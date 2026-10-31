import crypto from "crypto";
import type { UploadInput, UploadJob } from "./types";

// In-memory state is intentionally small and private. A durable queue should
// replace this store if jobs must survive a server restart.
const uploadJobs = new Map<string, UploadJob>();
const processingInputs = new Map<string, UploadInput>();
const activeJobs = new Set<string>();

export function createJobId(): string {
  // 128 bits of cryptographic randomness makes guessing another job ID
  // impractical.
  return crypto.randomBytes(16).toString("hex");
}

export function createUploadJob(input: UploadInput): string {
  const jobId = createJobId();

  uploadJobs.set(jobId, {
    userId: input.userId,
    status: "queued",
    progressMessage: "Upload queued.",
    createdAt: Date.now(),
  });

  processingInputs.set(jobId, input);
  return jobId;
}

export function getUploadJob(jobId: string): UploadJob | undefined {
  return uploadJobs.get(jobId);
}

export function getProcessingInput(jobId: string): UploadInput | undefined {
  return processingInputs.get(jobId);
}

export function updateUploadJob(
  jobId: string,
  patch: Partial<UploadJob>,
): void {
  const job = uploadJobs.get(jobId);
  if (!job) return;

  uploadJobs.set(jobId, {
    ...job,
    ...patch,
    // Refreshing this timestamp prevents an active job from being pruned.
    createdAt: Date.now(),
  });
}

export function markJobActive(jobId: string): boolean {
  if (activeJobs.has(jobId)) return false;
  activeJobs.add(jobId);
  return true;
}

export function removeJobRuntimeState(jobId: string): void {
  processingInputs.delete(jobId);
  activeJobs.delete(jobId);
}

export function pruneExpiredJobs(expirationMs: number): void {
  const now = Date.now();

  for (const [jobId, job] of uploadJobs) {
    if (now - job.createdAt <= expirationMs) continue;

    uploadJobs.delete(jobId);
    processingInputs.delete(jobId);
  }
}
