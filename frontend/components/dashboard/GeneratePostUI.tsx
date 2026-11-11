import { UploadArea } from "@/components/dashboard/UploadArea";
import { Step, StepConnector } from "@/components/StepConnector";
import {
  FILE_LIMITS,
  InputTypeUITypes,
  MediaFile,
} from "@/lib/dashboard_types";
import { useDBcontext } from "@/providers/dashboardProvider";
import { cn } from "cn";
import { ChangeEvent, DragEvent, useRef } from "react";

import { useUpload } from "@/hooks/use-upload";
import { useUploadContext } from "@/providers/uploadFileProvider";
import { validateFiles } from "@/utils/validate_file_upload";
import InnerModal from "./InnerModal";
import UploadTabs from "./UploadTabs";

const GeneratePostUI = () => {
  const {
    workFlow,
    openModal,
    inputType,
    setFiles,
    setIsDragging,
    files,
    isDragging,
    removeFileandUrl,
    setUploadError,
    uploadError,
  } = useDBcontext();

  const { upload } = useUpload();
  const { notBusy, state, setState } = useUploadContext();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (selectedFiles: FileList | File[]) => {
    const incoming = Array.from(selectedFiles);
    const validFiles = incoming.filter((file) => {
      if (inputType === "audio") {
        return file.type.startsWith("audio/");
      }

      if (inputType === "video") {
        return file.type.startsWith("video/");
      }

      if (inputType === "images") {
        return file.type.startsWith("image/");
      }
      if (inputType === "pdf") {
        return file.type.startsWith("application/pdf");
      }

      return true;
    });

    if (selectedFiles.length > 10) {
      return setUploadError({
        valid: false,
        error: "Too many files",
      });
    }

    if (validFiles.length !== incoming.length) {
      setUploadError({
        valid: false,
        error: "One or more selected files are not valid for this input type.",
      });

      return;
    }

    setUploadError(undefined);

    const result = await validateFiles(validFiles, inputType);

    if (!result.valid) {
      setUploadError(result);
      return;
    }

    const mapped: MediaFile[] = validFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    try {
      await upload(validFiles);
      setFiles((prev) => [...prev, ...mapped]);

      setUploadError({
        valid: true,
      });
    } catch (error) {
      // Upload failed.
      // Do NOT populate files.
      mapped.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });

      setUploadError({
        valid: false,
        error:
          error instanceof Error
            ? error.message
            : "The files could not be uploaded.",
      });
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files) {
      handleFiles(event.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((item) => item.id === id);

      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      if (files.length === 1) {
        removeFileandUrl();
      }
      return prev.filter((item) => item.id !== id);
    });
    if (files.length === 1) {
      setState("idle");
    }
  };

  const getAccept = () => {
    if (inputType === "audio") {
      return "audio/*";
    }

    if (inputType === "video") {
      return "video/*";
    }

    if (inputType === "images") {
      return "image/*";
    }
    if (inputType === "pdf") {
      return "application/pdf, .pdf";
    }

    return undefined;
  };
  const upLoadArea = (
    <UploadArea
      type={inputType}
      files={files}
      isDragging={isDragging}
      accept={getAccept()}
      fileInputRef={fileInputRef}
      onDragEnter={(event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()}
      onDrop={handleDrop}
      onBrowse={() => fileInputRef.current?.click()}
      onChange={handleFileChange}
      onRemove={removeFile}
    />
  );

  const inputTypeUI: InputTypeUITypes[] = [
    // {
    //   id: "youtube",
    //   userInterface: <YoutubeInput />,
    //   limit: { size: FILE_LIMITS.sizeMB, duration: null },
    //   accept_file: `Paste your YouTube video URL \u2022 ${FILE_LIMITS.videoDurationMinutes}mins`,
    // },
    {
      id: "audio",
      userInterface: upLoadArea,
      limit: {
        size: FILE_LIMITS.sizeMB,
        duration: FILE_LIMITS.videoDurationMinutes,
      },
      accept_file: `MP3, WAV, M4A, AAC, OGG • Up to ${FILE_LIMITS.sizeMB}mb • ${FILE_LIMITS.videoDurationMinutes}mins`,
    },
    {
      id: "video",
      userInterface: upLoadArea,
      limit: {
        size: FILE_LIMITS.sizeMB,
        duration: FILE_LIMITS.videoDurationMinutes,
      },
      accept_file: `MP4, MOV, AVI, WebM • ${FILE_LIMITS.sizeMB}mb • ${FILE_LIMITS.videoDurationMinutes}mins`,
    },
    {
      id: "images",
      userInterface: upLoadArea,
      limit: { size: FILE_LIMITS.sizeMB, duration: null },
      accept_file: `JPG, PNG, WEBP • Multiple images supported • ${FILE_LIMITS.sizeMB}mb`,
    },
    {
      id: "pdf",
      userInterface: upLoadArea,
      limit: { size: FILE_LIMITS.sizeMB, duration: null },
      accept_file: `PDF only • ${FILE_LIMITS.sizeMB}mb`,
    },
  ];
  return (
    <InnerModal
      title="Generate a post"
      roleDescription="paste a youtube link or upload a media or file, which will be transcribe to text"
      isHidden={!openModal || !workFlow}
      className={cn("lg:min-w-200 md:min-w-150 w-full")}
    >
      <div className="max-w-2xl mx-auto sm:p-0 p-3">
        {notBusy && (
          <div className="my-10 flex sm:gap-0 gap-2 items-center justify-center max-w-lg mx-auto">
            <Step number="1" label="Add Media / URL" />
            <StepConnector />
            <Step number="2" label="Customize" />
            <StepConnector />
            <Step number="3" label="Generate" />
          </div>
        )}

        {files.length === 0 && state === "idle" && <UploadTabs />}

        {inputTypeUI.find((input) => input.id === inputType)?.userInterface}
        <p className="mt-4 text-center text-xs text-slate-400">
          {files.length === 0 &&
            inputTypeUI.find((input) => input.id === inputType)?.accept_file}
        </p>
      </div>
    </InnerModal>
  );
};

export default GeneratePostUI;
