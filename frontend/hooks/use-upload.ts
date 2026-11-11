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
  upload: (files: File[]) => Promise<void>;
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
  const { removeFileandUrl, steps } = useDBcontext();

  const reset = useCallback(() => {
    pollingRef.current = false;

    setState("idle");
    setProgressMessage("");
    setError(null);
    setJob(null);
    removeFileandUrl();
  }, [removeFileandUrl, setState, setProgressMessage, setError, setJob]);

  const upload = useCallback(
    async (files: File[]) => {
      // Prevent two uploads from being started through the same hook instance.
      if (pollingRef.current) {
        return;
      }

      pollingRef.current = true;

      setState("uploading");
      setProgressMessage(
        files.length > 1
          ? `Uploading ${files.length} images...`
          : "Uploading file...",
      );
      setError(null);
      setJob(null);
      try {
        const jobs = await uploadFile(files);

        if (!jobs.length) {
          throw new Error("No upload jobs were created.");
        }

        setState("queued");
        setProgressMessage(
          jobs.length > 1
            ? `${jobs.length} images received. Processing...`
            : "Upload received. Processing...",
        );

        /**
         * Each uploaded image has its own job.
         *
         * Example:
         *
         * image-1 -> job A
         * image-2 -> job B
         * image-3 -> job C
         *
         * We therefore poll every job independently.
         */

        const completedJobs = new Set<string>();
        const failedJobs = new Set<string>();

        while (pollingRef.current) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

          if (!pollingRef.current) {
            break;
          }

          const results = await Promise.all(
            jobs
              .filter(
                ({ jobId }) =>
                  !completedJobs.has(jobId) && !failedJobs.has(jobId),
              )
              .map(async ({ jobId }) => {
                const currentJob = await getUploadStatus(jobId);

                return {
                  jobId,
                  job: currentJob,
                };
              }),
          );

          if (!results.length) {
            break;
          }

          let completedCount = completedJobs.size;
          let failedCount = failedJobs.size;

          for (const { jobId, job: currentJob } of results) {
            if (currentJob.status === "completed") {
              completedJobs.add(jobId);
              completedCount++;
            }

            if (currentJob.status === "failed") {
              failedJobs.add(jobId);
              failedCount++;
            }
          }

          /**
           * Keep the latest job in the existing context.
           *
           * Your current context only stores one UploadJob, so this
           * represents the most recently checked job.
           */
          const latestResult = results[results.length - 1];

          if (latestResult) {
            setJob(latestResult.job);
            setState(latestResult.job.status);
          }

          const total = jobs.length;
          const finished = completedCount + failedCount;

          if (failedCount > 0) {
            setProgressMessage(
              `${finished}/${total} files processed. ${failedCount} failed.`,
            );
          } else if (finished === total) {
            setProgressMessage(
              total > 1
                ? `${total} images processed successfully.`
                : "File processed successfully.",
            );
          } else {
            setProgressMessage(
              total > 1
                ? `Processing images... ${finished}/${total} completed.`
                : latestResult?.job.progressMessage || "Processing...",
            );
          }

          /**
           * Only stop polling when EVERY job has reached a terminal state.
           */
          if (finished === total) {
            pollingRef.current = false;

            if (failedCount > 0) {
              setState("failed");

              setError(
                `${failedCount} ${
                  failedCount === 1 ? "file" : "files"
                } could not be processed.`,
              );
            } else {
              const step = steps.length + 1;
              setState("completed");
              setError(null);
              steps.push(step);
            }

            return;
          }
        }
      } catch (err) {
        pollingRef.current = false;

        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong while uploading the files.";

        setState("failed");
        setError(message);
        setProgressMessage("");
      }
    },
    [setState, setProgressMessage, setError, setJob, steps],
  );

  /**
   * If the component using this hook disappears, stop polling.
   *
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
