import { removeLocalFiles } from "./upload/file-utils";
import {
  getProcessingInput,
  markJobActive,
  pruneExpiredJobs,
  removeJobRuntimeState,
  updateUploadJob,
} from "./upload/job-store";
import { processAudioVideo } from "./upload/process-audio-video";
import { processImage } from "./upload/process-image";

const JOB_EXPIRATION_MS = 30 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export { createUploadJob, getUploadJob } from "./upload/job-store";
export type { UploadInput, UploadJob, UploadJobStatus } from "./upload/types";

/**
 * This is intentionally an orchestration function only. Each responsibility
 * lives in its own module, making the worker easier to test and maintain.
 */
export async function processUploadJob(jobId: string): Promise<void> {
  const input = getProcessingInput(jobId);
  if (!input || !markJobActive(jobId)) return;

  try {
    if (IMAGE_EXTENSIONS.has(input.extension)) {
      await processImage(input, jobId);
    } else {
      await processAudioVideo(input, jobId);
    }
  } catch (error) {
    // Never send raw FFmpeg/Supabase/internal errors to the client. They can
    // contain implementation details and are not useful to the uploader.
    console.error("Upload background job failed:", error);

    updateUploadJob(jobId, {
      status: "failed",
      progressMessage: "Upload processing failed.",
      error: "File could not be processed.",
    });
  } finally {
    await removeLocalFiles(input.tempUploadPath);
    removeJobRuntimeState(jobId);
  }
}

/**
 * Housekeeping is kept separate from actual upload processing. It only removes
 * stale in-memory metadata; it never touches an active job's media file.
 */
export function startUploadJobCleanup(
  pruneExpiredJobs: (expirationMs: number) => void,
): NodeJS.Timeout {
  const timer = setInterval(
    () => pruneExpiredJobs(JOB_EXPIRATION_MS),
    CLEANUP_INTERVAL_MS,
  );

  timer.unref();
  return timer;
}

// Keep periodic pruning outside the request path.
startUploadJobCleanup(pruneExpiredJobs);
