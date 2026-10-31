/**
 * The states exposed to the client while an upload is being processed.
 */
export type UploadJobStatus =
  | "queued"
  | "inspecting"
  | "converting"
  | "hashing"
  | "completed"
  | "failed";

export type UploadResult = {
  projectId: string;
  duplicate: boolean;
  durationSeconds: number;
  title: string;
};

/**
 * This is the only job data that is returned by the status endpoint.
 * `userId` is kept internally for authorization and is never returned.
 */
export type UploadJob = {
  userId: string;
  status: UploadJobStatus;
  progressMessage: string;
  createdAt: number;
  result?: UploadResult;
  error?: string;
};

/**
 * Metadata required by the worker. The actual file remains on disk and is
 * referenced by a random temporary path rather than by the user's filename.
 */
export type UploadInput = {
  userId: string;
  tempUploadPath: string;
  originalFilename: string;
  extension: string;
  mimetype: string;
};
