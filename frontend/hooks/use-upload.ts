// hooks/use-upload.ts

"use client";

import {
  getUploadStatus,
  uploadFile,
  type UploadJob,
  type UploadStatus,
} from "@/lib/upload-api";
import { useDBcontext } from "@/providers/dashboardProvider";
import { useUploadContext } from "@/providers/uploadFileProvider";
import { useCallback, useEffect, useRef } from "react";

export type UploadState = "idle" | "uploading" | UploadStatus;

interface UseUploadReturn {
  state: UploadState;
  progressMessage: string;
  error: string | null;
  job: UploadJob | null;
  upload: (file: File[]) => Promise<void>;
  reset: () => void;
}

const POLL_INTERVAL = 1500;

export function useUpload(): UseUploadReturn {
  const {
    state,
    setState,
    progressMessage,
    setProgressMessage,
    error,
    setError,
    job,
    setJob,
  } = useUploadContext();

  const pollingRef = useRef(false);
  const { removeFileandUrl } = useDBcontext();

  const reset = useCallback(() => {
    pollingRef.current = false;

    setState("idle");
    setProgressMessage("");
    setError(null);
    setJob(null);
    removeFileandUrl();
  }, []);

  const upload = useCallback(async (files: File[]) => {
    // Prevent two uploads from being started through the same hook instance.
    if (pollingRef.current) {
      return;
    }

    pollingRef.current = true;

    setState("uploading");
    setProgressMessage("Uploading file...");
    setError(null);
    setJob(null);
    try {
      const jobId = await uploadFile(files);

      setState("queued");
      setProgressMessage("Upload received. Processing...");

      /*
       * The POST /upload endpoint only uploads the file and creates
       * the background job. It does NOT wait for FFmpeg/Supabase
       * processing to finish.
       *
       * Therefore we poll the status endpoint until the job reaches
       * either "completed" or "failed".
       */
      while (pollingRef.current) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

        if (!pollingRef.current) {
          break;
        }

        const currentJob = await getUploadStatus(jobId);

        setJob(currentJob);
        setState(currentJob.status);
        setProgressMessage(currentJob.progressMessage);

        if (currentJob.status === "completed") {
          pollingRef.current = false;
          return;
        }

        if (currentJob.status === "failed") {
          pollingRef.current = false;

          setError(
            currentJob.error || "The uploaded file could not be processed.",
          );

          return;
        }
      }
    } catch (err) {
      pollingRef.current = false;

      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading the file.";

      setState("failed");
      setError(message);
      setProgressMessage("");
    }
  }, []);

  /*
   * If the component using this hook disappears, stop polling.
   * This prevents a component that no longer exists from continuing
   * to make requests.
   */
  useEffect(() => {
    return () => {
      pollingRef.current = false;
    };
  }, []);

  return {
    state,
    progressMessage,
    error,
    job,
    upload,
    reset,
  };
}
