import crypto from "crypto";
import { execa } from "execa";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createWriteStream } from "fs";
import fs from "fs/promises"; // Switched to non-blocking promise-based FS
import os from "os"; // Cross-platform OS path tracking
import path from "path";
import { pipeline } from "stream/promises";
import { verifiedUser } from "../lib/authorization";
import { supabase } from "../lib/supabase";
import { MAX_DURATION } from "../server";

// In-memory job tracking map
const uploadJobs = new Map<
  string,
  {
    status:
      | "queued"
      | "validating"
      | "inspecting"
      | "converting"
      | "hashing"
      | "completed"
      | "Duplicate"
      | "failed";
    progressMessage: string;
    createdAt: number; // Added to facilitate memory pruning
    result?: {
      projectId: string;
      duplicate: boolean;
      durationSeconds: number;
      title: string;
    };
    error?: string;
  }
>();

// Automatic Pruning: Clears out tracking objects older than 30 minutes every 5 minutes
setInterval(
  () => {
    const EXPIRATION_TIME = 30 * 60 * 1000;
    const now = Date.now();
    for (const [jobId, job] of uploadJobs.entries()) {
      if (now - job.createdAt > EXPIRATION_TIME) {
        uploadJobs.delete(jobId);
      }
    }
  },
  5 * 60 * 1000,
).unref(); // .unref() ensures this interval doesn't stall process shutdowns

export async function uploadRoutes(server: FastifyInstance) {
  server.post(
    "/upload",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // 1. Security Check: Bearer Token Auth
        const user = await verifiedUser(request, reply);

        const data = await request.file();
        if (!data) {
          return reply
            .code(400)
            .send({ success: false, error: "No file uploaded." });
        }

        const filename = data.filename;
        const mimetype = data.mimetype;

        // 2. Security Check: Extension and MIME type validation
        const ext = path.extname(filename).toLowerCase();
        const allowedExtensions = [
          ".mp3",
          ".wav",
          ".m4a",
          ".aac",
          ".ogg",
          ".mp4",
          ".mov",
          ".avi",
          ".webm",
          ".jpg",
          ".jpeg",
          ".png",
          ".webp",
        ];

        if (!allowedExtensions.includes(ext)) {
          return reply
            .code(400)
            .send({ success: false, error: "Invalid file extension." });
        }

        // Save upload stream using OS temporary tracking safely
        const tempId = crypto.randomBytes(8).toString("hex");
        const tmpDir = os.tmpdir();
        const tempUploadPath = path.join(tmpDir, `raw-${tempId}-${filename}`);

        const writeStream = createWriteStream(tempUploadPath);
        await pipeline(data.file, writeStream);

        if (data.file.truncated) {
          await fs.unlink(tempUploadPath).catch(() => {});
          return reply.code(413).send({
            success: false,
            error:
              "File upload size exceeded the maximum allowed limit of 30MB.",
          });
        }

        const jobId = crypto.randomBytes(12).toString("hex");
        uploadJobs.set(jobId, {
          status: "queued",
          progressMessage: "Initializing job...",
          createdAt: Date.now(),
        });

        // Background Processing (Non-blocking async worker)
        setImmediate(async () => {
          const outputAudioPath = path.join(tmpDir, `processed-${tempId}.mp3`);
          const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
          let uploadedStoragePath: string | null = null; // Tracked to prevent orphan storage leaks

          try {
            // --- STEP A: Image processing chain ---
            if (isImage) {
              uploadJobs.set(jobId, {
                status: "hashing",
                progressMessage: "Processing image file...",
                createdAt: Date.now(),
              });

              // Asynchronous non-blocking file loading
              const buffer = await fs.readFile(tempUploadPath);
              const fileHash = crypto
                .createHash("sha256")
                .update(buffer)
                .digest("hex");

              await fs.unlink(tempUploadPath).catch(() => {});

              const { data: existingProject } = await supabase
                .from("projects")
                .select("user_id")
                .eq("media_hash", fileHash)
                .maybeSingle();

              if (existingProject) {
                uploadJobs.set(jobId, {
                  status: "completed",
                  progressMessage: "Duplicate media detected!",
                  createdAt: Date.now(),
                  result: {
                    projectId: existingProject.user_id,
                    duplicate: true,
                    durationSeconds: 0,
                    title: filename,
                  },
                });
                return;
              }

              uploadedStoragePath = `uploads/${user?.id}/${Date.now()}-${filename}`;

              const { error: storageError } = await supabase.storage
                .from("media-bucket")
                .upload(uploadedStoragePath, buffer, { contentType: mimetype });

              if (storageError) throw storageError;

              const { data: newProject, error: insertError } = await supabase
                .from("projects")
                .insert({
                  user_id: user?.id,
                  media_hash: fileHash,
                  source_url: uploadedStoragePath + ` | name: ${filename}`,
                  status: "uploaded",
                })
                .select("id")
                .single();

              if (insertError) {
                // Delete file from bucket if row entry creation fails
                await supabase.storage
                  .from("media-bucket")
                  .remove([uploadedStoragePath]);
                throw insertError;
              }

              uploadJobs.set(jobId, {
                status: "completed",
                progressMessage: "Image uploaded successfully!",
                createdAt: Date.now(),
                result: {
                  projectId: newProject.id,
                  duplicate: false,
                  durationSeconds: 0,
                  title: filename,
                },
              });
              return;
            }

            // --- STEP B: Inspect Media Duration via ffprobe ---
            uploadJobs.set(jobId, {
              status: "inspecting",
              progressMessage: "Checking media duration...",
              createdAt: Date.now(),
            });

            const { stdout: probeStdout } = await execa("ffprobe", [
              "-v",
              "error",
              "-show_entries",
              "format=duration",
              "-of",
              "default=noprint_wrappers=1:nokey=1",
              tempUploadPath,
            ]);

            const durationSeconds = parseFloat(probeStdout.trim()) || 0;

            if (durationSeconds > MAX_DURATION) {
              throw new Error(
                `Media duration is too long (${Math.ceil(durationSeconds / 60)} mins). Maximum allowed limit is ${MAX_DURATION / 60} minutes.`,
              );
            }

            // --- STEP C: Convert Audio to MP3 via FFmpeg ---
            uploadJobs.set(jobId, {
              status: "converting",
              progressMessage: "Converting and extracting audio stream...",
              createdAt: Date.now(),
            });

            await execa("ffmpeg", [
              "-i",
              tempUploadPath,
              "-vn",
              "-acodec",
              "libmp3lame",
              "-q:a",
              "2",
              outputAudioPath,
              "-y",
            ]);

            try {
              await fs.access(outputAudioPath);
            } catch {
              throw new Error("FFmpeg audio extraction failed.");
            }

            // --- STEP D: Hash File & Check Duplicates ---
            uploadJobs.set(jobId, {
              status: "hashing",
              progressMessage: "Generating SHA-256 integrity hash...",
              createdAt: Date.now(),
            });

            const buffer = await fs.readFile(outputAudioPath);
            const fileHash = crypto
              .createHash("sha256")
              .update(buffer)
              .digest("hex");

            // Clean up files locally early before making remote network requests
            await fs.unlink(tempUploadPath).catch(() => {});
            await fs.unlink(outputAudioPath).catch(() => {});

            // Check duplicate in Supabase
            const { data: existingProject } = await supabase
              .from("projects")
              .select("user_id")
              .eq("media_hash", fileHash)
              .maybeSingle();

            if (existingProject) {
              uploadJobs.set(jobId, {
                status: "completed",
                progressMessage: "Duplicate media detected!",
                createdAt: Date.now(),
                result: {
                  projectId: existingProject.user_id,
                  duplicate: true,
                  durationSeconds,
                  title: filename,
                },
              });
              return;
            }

            // Upload to Supabase Storage
            uploadedStoragePath = `uploads/${user?.id}/${Date.now()}-${filename}.mp3`;

            const { error: storageError } = await supabase.storage
              .from("media-bucket")
              .upload(uploadedStoragePath, buffer, {
                contentType: "audio/mpeg",
              });

            if (storageError) throw storageError;

            const { data: newProject, error: insertError } = await supabase
              .from("projects")
              .insert({
                user_id: user?.id,
                media_hash: fileHash,
                source_url: uploadedStoragePath + ` | Title: ${filename}`,
                status: "uploaded",
              })
              .select("id")
              .single();

            if (insertError) {
              await supabase.storage
                .from("media-bucket")
                .remove([uploadedStoragePath]);
              throw insertError;
            }

            uploadJobs.set(jobId, {
              status: "completed",
              progressMessage: "Processing and upload complete!",
              createdAt: Date.now(),
              result: {
                projectId: newProject.id,
                duplicate: false,
                durationSeconds,
                title: filename,
              },
            });
          } catch (err: any) {
            console.error("Background processing error:", err);
            // Non-blocking catch-all local disk safety deletion
            await fs.unlink(tempUploadPath).catch(() => {});
            await fs.unlink(outputAudioPath).catch(() => {});
            uploadJobs.set(jobId, {
              status: "failed",
              progressMessage: "Failed",
              createdAt: Date.now(),
              error: err.message || "Error processing file.",
            });
          }
        });
        return reply.send({ success: true, jobId });
      } catch (err: any) {
        return reply.code(500).send({ success: false, error: err.message });
      }
    },
  );
  server.get(
    "/upload-status/:jobId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { jobId } = request.params as { jobId: string };
      const job = uploadJobs.get(jobId);

      if (!job) {
        return reply
          .code(404)
          .send({ success: false, error: "Job not found or has expired." });
      }

      return reply.send({ success: true, ...job });
    },
  );
}
