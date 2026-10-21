import crypto from "crypto";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fs from "fs/promises"; // Use modern non-blocking promise-based filesystem
import os from "os"; // Cross-platform OS path tracking
import path from "path";
import youtubedl from "yt-dlp-exec";
import { checkAuthorization, verifiedUser } from "../lib/authorization";
import { supabase } from "../lib/supabase";
import { MAX_DURATION } from "../server";

// Job store to track progress in memory
const jobs = new Map<
  string,
  {
    status: string;
    progressMessage: string;
    createdAt: number;
    result?: any;
    error?: string;
  }
>();

// Temporary cache to bridge extraction and saving (Tracks files on disk instead of memory buffers)
const tempAudioCache = new Map<
  string,
  { filePath: string; url: string; videoTitle: string; createdAt: number }
>();

// Automatic Cleaner: Wipes out stale tracking jobs and removes cached temp files every 5 minutes
setInterval(
  async () => {
    const JOB_EXPIRATION = 30 * 60 * 1000; // 30 mins
    const CACHE_EXPIRATION = 10 * 60 * 1000; // 10 mins
    const now = Date.now();

    // Clean tracking jobs
    for (const [jobId, job] of jobs.entries()) {
      if (now - job.createdAt > JOB_EXPIRATION) {
        jobs.delete(jobId);
      }
    }

    // Clean cached temp files to prevent disk usage pile-up
    for (const [extractionId, cache] of tempAudioCache.entries()) {
      if (now - cache.createdAt > CACHE_EXPIRATION) {
        await fs.unlink(cache.filePath).catch(() => {});
        tempAudioCache.delete(extractionId);
      }
    }
  },
  5 * 60 * 1000,
).unref();

export async function youtubeRoutes(server: FastifyInstance) {
  // --- STEP 1A: Initialize Async Job ---
  server.post(
    "/process-youtube",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = verifiedUser(request);
      if (!user)
        return reply
          .code(401)
          .send({ success: false, error: "Unauthorised user." });
      const youtubeRegex =
        /^(?:https?:)?\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_\-]{11})(?:\S+)?$/;

      const { url } = request.body as { url: string };

      if (!url || !youtubeRegex.test(url)) {
        return reply
          .code(400)
          .send({ success: false, error: "Invalid YouTube URL format." });
      }

      const jobId = crypto.randomBytes(12).toString("hex");

      // Initialize job state
      jobs.set(jobId, {
        status: "queued",
        progressMessage: "Initializing extraction job...",
        createdAt: Date.now(),
      });

      // Run heavy lifting asynchronously in the background (Non-blocking)
      setImmediate(async () => {
        const tempId = crypto.randomBytes(8).toString("hex");
        const tmpDir = os.tmpdir();
        const tempFilePath = path.join(tmpDir, `${tempId}.mp3`);

        try {
          jobs.set(jobId, {
            status: "downloading",
            progressMessage: "Checking video duration...",
            createdAt: Date.now(),
          });

          // 1. Fetch metadata ONLY first (instant)
          const metadata = await youtubedl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            skipDownload: true,
          });

          const durationSeconds = (metadata as any).duration || 0;
          const videoTitle =
            (metadata as any).title || "Untitled YouTube Video";
          const CONVERT_MAX_DURATION = MAX_DURATION / 60;

          if (durationSeconds > MAX_DURATION) {
            throw new Error(
              `Video is too long (${Math.ceil(durationSeconds / 60)} mins). Maximum allowed duration for MVP is ${CONVERT_MAX_DURATION} minutes.`,
            );
          }

          jobs.set(jobId, {
            status: "extracting",
            progressMessage: "Converting stream to MP3...",
            createdAt: Date.now(),
          });

          // 2. Proceed with download only if it passes validation checks
          await youtubedl(url, {
            extractAudio: true,
            audioFormat: "mp3",
            output: tempFilePath,
          });

          try {
            await fs.access(tempFilePath);
          } catch {
            throw new Error("Audio extraction file missing or failed to save.");
          }

          jobs.set(jobId, {
            status: "hashing",
            progressMessage: "Wrapping up extraction details...",
            createdAt: Date.now(),
          });

          // Fetch file statistics asynchronously without locking the memory heap with buffer blocks
          const stats = await fs.stat(tempFilePath);
          const extractionId = crypto.randomBytes(16).toString("hex");

          // Store the reference path on disk instead of holding raw binary buffers in memory
          tempAudioCache.set(extractionId, {
            filePath: tempFilePath,
            url,
            videoTitle,
            createdAt: Date.now(),
          });

          // Mark job as completed successfully
          jobs.set(jobId, {
            status: "completed",
            progressMessage: "Extraction complete!",
            createdAt: Date.now(),
            result: {
              extractionId,
              title: videoTitle,
              sizeMB: (stats.size / 1024 / 1024).toFixed(2),
            },
          });
        } catch (err: any) {
          console.error("Extraction background error:", err);

          // Ensure cleanup of any partial local temp disk footprints
          await fs.unlink(tempFilePath).catch(() => {});

          jobs.set(jobId, {
            status: "failed",
            progressMessage: "Failed",
            createdAt: Date.now(),
            error: err.message || "Unknown extraction error",
          });
        }
      });

      return reply.send({ success: true, jobId });
    },
  );

  // --- STEP 1B: Job Status Polling Endpoint ---
  server.get(
    "/job-status/:jobId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { jobId } = request.params as { jobId: string };
      const job = jobs.get(jobId);

      if (!job) {
        return reply
          .code(404)
          .send({ success: false, error: "Job not found or has expired." });
      }

      return reply.send({ success: true, ...job });
    },
  );

  // --- STEP 2: Save Route ---
  server.post(
    "/save-youtube",
    async (request: FastifyRequest, reply: FastifyReply) => {
      let targetFilePath = "";
      try {
        checkAuthorization(request, reply);
        const user = await verifiedUser(request);
        const { extractionId } = request.body as { extractionId: string };
        const cachedData = tempAudioCache.get(extractionId);

        if (!cachedData) {
          return reply.code(400).send({
            success: false,
            error: "Session expired or file not found. Please re-extract.",
          });
        }

        const { filePath, url, videoTitle } = cachedData;
        targetFilePath = filePath;

        // Non-blocking binary file reading into the single route execution block
        const buffer = await fs.readFile(filePath);
        const fileHash = crypto
          .createHash("sha256")
          .update(buffer)
          .digest("hex");

        const { data: existingProject } = await supabase
          .from("projects")
          .select("id")
          .eq("media_hash", fileHash)
          .maybeSingle();

        if (existingProject) {
          // Immediately erase the local file and clear cache mappings
          await fs.unlink(filePath).catch(() => {});
          tempAudioCache.delete(extractionId);
          return reply.send({
            success: true,
            duplicate: true,
            projectId: existingProject.id,
          });
        }

        const storagePath = `uploads/youtube-${Date.now()}.mp3`;

        const { error: storageError } = await supabase.storage
          .from("media-bucket")
          .upload(storagePath, buffer, { contentType: "audio/mpeg" });

        if (storageError) throw storageError;

        const { data: newProject, error: insertError } = await supabase
          .from("projects")
          .insert({
            user_id: user?.id,
            media_hash: fileHash,
            source_url: url + ` | Title: ${videoTitle}`,
            status: "uploaded",
          })
          .select("id")
          .single();

        if (insertError) {
          // Roll back uploaded asset from storage bucket if database entry instantiation crashes
          await supabase.storage.from("media-bucket").remove([storagePath]);
          throw insertError;
        }

        await fs.unlink(filePath).catch(() => {});
        tempAudioCache.delete(extractionId);

        return reply.send({
          success: true,
          duplicate: false,
          projectId: newProject.id,
          title: videoTitle,
        });
      } catch (error: any) {
        // Fallback catch cleanup to guarantee file system assets do not persist indefinitely
        if (targetFilePath) {
          await fs.unlink(targetFilePath).catch(() => {});
        }
        return reply.code(500).send({ success: false, error: error.message });
      }
    },
  );
}
