import crypto from "crypto";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { pipeline } from "stream/promises";
import { verifiedUser } from "../lib/authorization";
import {
  createUploadJob,
  getUploadJob,
  processUploadJob,
} from "../services/upload-background.service";

const ALLOWED_TYPES = new Map<string, string>([
  [".mp3", "audio/mpeg"],
  [".wav", "audio/wav"],
  [".m4a", "audio/mp4"],
  [".aac", "audio/aac"],
  [".ogg", "audio/ogg"],
  [".mp4", "video/mp4"],
  [".mov", "video/quicktime"],
  [".avi", "video/x-msvideo"],
  [".webm", "video/webm"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

function getSafeExtension(filename: string): string | null {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_TYPES.has(ext) ? ext : null;
}

function safeDisplayName(filename: string): string {
  const normalized = path
    .basename(filename)
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, "");

  return normalized.slice(0, 255) || "uploaded-file";
}

function isAllowedMime(ext: string, mimetype: string): boolean {
  return ALLOWED_TYPES.get(ext) === mimetype.toLowerCase();
}

export async function uploadRoutes(server: FastifyInstance) {
  server.post(
    "/upload",
    async (request: FastifyRequest, reply: FastifyReply) => {
      let tempUploadPath: string | undefined;

      try {
        const user = await verifiedUser(request, reply);

        if (!user?.id) {
          return reply.code(401).send({
            success: false,
            error: "Unauthorized.",
          });
        }

        const data = await request.file();

        if (!data) {
          return reply.code(400).send({
            success: false,
            error: "No file uploaded.",
          });
        }

        const ext = getSafeExtension(data.filename);
        const mimetype = data.mimetype.toLowerCase();

        if (!ext || !isAllowedMime(ext, mimetype)) {
          data.file.resume();

          return reply.code(400).send({
            success: false,
            error: "Unsupported file type.",
          });
        }

        const tempId = crypto.randomBytes(16).toString("hex");

        tempUploadPath = path.join(os.tmpdir(), `media-upload-${tempId}${ext}`);

        await pipeline(
          data.file,
          (await import("fs")).createWriteStream(tempUploadPath, {
            flags: "wx",
            mode: 0o600,
          }),
        );

        if (data.file.truncated) {
          await fs.rm(tempUploadPath, { force: true });

          return reply.code(413).send({
            success: false,
            error: "File is too large.",
          });
        }

        const jobId = createUploadJob({
          userId: user.id,
          tempUploadPath,
          originalFilename: safeDisplayName(data.filename),
          extension: ext,
          mimetype,
        });

        // Processing is implemented by the background service, not by the
        // HTTP route. The request can therefore return immediately.
        void processUploadJob(jobId).catch(() => {
          // The service owns persistent job-state/error handling.
        });

        tempUploadPath = undefined;

        return reply.code(202).send({
          success: true,
          jobId,
          status: "queued",
        });
      } catch {
        if (tempUploadPath) {
          await fs.rm(tempUploadPath, { force: true }).catch(() => {});
        }

        return reply.code(500).send({
          success: false,
          error: "Upload could not be processed.",
        });
      }
    },
  );

  server.get(
    "/upload-status/:jobId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = await verifiedUser(request, reply);

      if (!user?.id) {
        return reply.code(401).send({
          success: false,
          error: "Unauthorized.",
        });
      }

      const { jobId } = request.params as { jobId: string };

      if (!/^[a-f0-9]{32}$/.test(jobId)) {
        return reply.code(400).send({
          success: false,
          error: "Invalid job ID.",
        });
      }

      const job = getUploadJob(jobId);

      // Do not reveal whether another user's job exists.
      if (!job || job.userId !== user.id) {
        return reply.code(404).send({
          success: false,
          error: "Job not found or has expired.",
        });
      }

      const { userId: _userId, ...publicJob } = job;

      return reply.send({
        success: true,
        ...publicJob,
      });
    },
  );
}
