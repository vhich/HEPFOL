import crypto from "crypto";
import { processMediaPipeline } from "../services/media/processMedia";
// In-memory job status map
const jobs = new Map<
  string,
  {
    status: "queued" | "processing" | "completed" | "failed";
    progressMessage: string;
    result?: any;
    error?: string;
  }
>();

export function createJob(): string {
  const jobId = crypto.randomBytes(12).toString("hex");
  jobs.set(jobId, {
    status: "queued",
    progressMessage: "Job queued...",
  });
  return jobId;
}

export function getJob(jobId: string) {
  return jobs.get(jobId);
}

export function runMediaWorker(
  jobId: string,
  tempFilePath: string,
  mimeType: string,
) {
  setImmediate(async () => {
    try {
      jobs.set(jobId, {
        status: "processing",
        progressMessage: "Inspecting and verifying file...",
      });

      const result = await processMediaPipeline(tempFilePath, mimeType);

      jobs.set(jobId, {
        status: "completed",
        progressMessage: "Processing complete!",
        result,
      });
    } catch (err: any) {
      console.error("Media worker processing error:", err);
      jobs.set(jobId, {
        status: "failed",
        progressMessage: "Processing failed",
        error: err.message,
      });
    }
  });
}
