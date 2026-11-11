"use client";

import { useUpload } from "@/hooks/use-upload";
import { Info, LoaderCircle, X } from "lucide-react";

export default function UploadProcess() {
  const { state, progressMessage, error, job, reset } = useUpload();

  const isBusy =
    state === "uploading" ||
    state === "queued" ||
    state === "inspecting" ||
    state === "converting" ||
    state === "hashing";

  return (
    <div className="space-y-4">
      {/* Processing state */}
      {isBusy && (
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <LoaderCircle
              size={30}
              className="animate-spin duration-300 text-primary"
            />
            <p className="text-sm opacity-85">{getStateDescription(state)}</p>

            {/* <span className="text-muted-foreground">
              {progressMessage || "Processing..."}
            </span> */}
          </div>

          {/* <p className="text-sm opacity-85">{getStateDescription(state)}</p> */}
        </div>
      )}

      {/* Success state */}
      {state === "completed" && job?.result && (
        <div className="rounded-lg border border-green-200 p-4">
          <p className="font-medium text-green-700">
            {job.result.duplicate
              ? "This media already exists."
              : "Upload completed successfully."}
          </p>

          <p className="mt-1 text-sm text-gray-500">{job.result.title}</p>

          <p className="mt-1 text-sm text-gray-500">
            Project ID: {job.result.projectId}
          </p>

          <button
            type="button"
            onClick={reset}
            className="mt-3 rounded-md border px-3 py-2 text-sm"
          >
            Upload another file
          </button>
        </div>
      )}

      {/* Error state */}
      {state === "failed" && error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 relative flex gap-3">
          <span>
            <Info size={30} className="text-destructive" />
          </span>
          <div>
            <p className="mb-3 text-destructive">Upload failed</p>
            <h6 className={`font-medium text-destructive`}>{error}</h6>
          </div>

          <button
            type="button"
            onClick={reset}
            className="p-2 rounded-full text-sm absolute top-1.5 right-1.5 grid place-items-center"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

function getStateDescription(state: string): string {
  switch (state) {
    case "uploading":
      return "Sending your file to the server.";

    case "queued":
      return "File received and waiting to be processed.";

    case "inspecting":
      return "Checking and verifying file.";

    case "converting":
      return "Extracting the audio from your media.";

    case "hashing":
      return "Checking the media for duplicates.";

    default:
      return "Please wait...";
  }
}
