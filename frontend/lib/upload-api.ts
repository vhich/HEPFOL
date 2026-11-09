// lib/upload-api.ts

import { getSupabaseBrowserClient } from "./supabase/client";

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
const serverUrl = "http://localhost:4000";
const supabase = getSupabaseBrowserClient();
export async function uploadFile(files: File[]): Promise<string> {
  // 1. Create a new FormData instance
  const formData = new FormData();

  // 2. Append each file to the FormData object
  files.forEach((file) => {
    formData.append("files", file); // Change "files" to match your backend's expected field name
  });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    alert("You must be logged in to upload files.");
    return "Unauthorised!";
  }
  const response = await fetch(`${serverUrl}/upload`, {
    method: "POST",
    body: formData,

    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
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
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    alert("You must be logged in to upload files.");
    return {
      status: "failed",
      progressMessage: "",
      createdAt: 0,
    };
  }
  const response = await fetch(
    `${serverUrl}/upload-status/${encodeURIComponent(jobId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    },
  );

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
