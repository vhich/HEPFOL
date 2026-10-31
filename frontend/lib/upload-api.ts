// lib/upload-api.ts

export type UploadStatus =
  | "queued"
  | "inspecting"
  | "converting"
  | "hashing"
  | "completed"
  | "failed";

export interface UploadJobResult {
  projectId: string;
  duplicate: boolean;
  durationSeconds: number;
  title: string;
}

export interface UploadJob {
  status: UploadStatus;
  progressMessage: string;
  createdAt: number;
  result?: UploadJobResult;
  error?: string;
}

interface UploadResponse {
  success: boolean;
  jobId?: string;
  status?: "queued";
  error?: string;
}

interface UploadStatusResponse extends UploadJob {
  success: boolean;
}

/**
 * Uploads the file and returns the background-processing job ID.
 *
 * The server intentionally responds before media processing finishes.
 * The returned jobId is then used to check the processing status.
 */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch("/upload", {
    method: "POST",
    body: formData,

    // Don't manually set Content-Type.
    // The browser automatically adds the multipart boundary.
    credentials: "include",
  });

  let data: UploadResponse;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !data.success || !data.jobId) {
    throw new Error(data.error || "Upload could not be started.");
  }

  return data.jobId;
}

/**
 * Retrieves the current state of a background upload job.
 */
export async function getUploadStatus(jobId: string): Promise<UploadJob> {
  const response = await fetch(`/upload-status/${encodeURIComponent(jobId)}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  let data: UploadStatusResponse;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid status response.");
  }

  if (!response.ok || !data.success) {
    throw new Error(data.error || "Unable to retrieve upload status.");
  }

  return {
    status: data.status,
    progressMessage: data.progressMessage,
    createdAt: data.createdAt,
    result: data.result,
    error: data.error,
  };
}
