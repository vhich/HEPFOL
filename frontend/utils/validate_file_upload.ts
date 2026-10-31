import {
  FILE_LIMITS,
  FileValidationResult,
  InputType,
} from "@/lib/dashboard_types";

export const MAX_SIZE_BYTES = FILE_LIMITS.sizeMB * 1024 * 1024;

export const MAX_DURATION_SECONDS = FILE_LIMITS.videoDurationMinutes * 60;
function validateFile(
  file: File,
  type: InputType,
): Promise<FileValidationResult> {
  // Check file size
  if (file.size > MAX_SIZE_BYTES) {
    return Promise.resolve({
      valid: false,
      error: `${file.name} is too large. Maximum size is ${FILE_LIMITS.sizeMB}MB.`,
    });
  }

  // Only videos need duration validation
  if (type === "video" || type === "audio") {
    return validateVideoDuration(file);
  }

  // Images, audio and PDFs only need size validation
  return Promise.resolve({
    valid: true,
  });
}

export function validateVideoDuration(
  file: File,
): Promise<FileValidationResult> {
  return new Promise((resolve) => {
    const video = document.createElement("video");

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;

      URL.revokeObjectURL(video.src);

      if (duration > MAX_DURATION_SECONDS) {
        resolve({
          valid: false,
          error: `${file.name} is too long. Maximum duration is ${FILE_LIMITS.videoDurationMinutes} minutes.`,
        });

        return;
      }

      resolve({
        valid: true,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);

      resolve({
        valid: false,
        error: `Unable to read the duration of ${file.name}.`,
      });
    };

    video.src = URL.createObjectURL(file);
  });
}

export async function validateImages(
  files: File[] | FileList,
): Promise<FileValidationResult> {
  for (const file of files) {
    const result = await validateFile(file, "images");

    if (!result.valid) {
      return result;
    }
  }

  return {
    valid: true,
  };
}

export async function validateFiles(
  files: File[] | FileList,
  type: InputType,
): Promise<FileValidationResult> {
  for (const file of files) {
    const result = await validateFile(file, type);

    if (!result.valid) {
      return result;
    }
  }

  return {
    valid: true,
  };
}
