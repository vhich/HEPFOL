import fs from "fs/promises";
import { findDuplicateProject, createProject, createStoragePath, removeFromStorage, uploadToStorage } from "./storage";
import { sha256File } from "./file-utils";
import { updateUploadJob } from "./job-store";
import type { UploadInput } from "./types";

export async function processImage(
  input: UploadInput,
  jobId: string,
): Promise<void> {
  updateUploadJob(jobId, {
    status: "hashing",
    progressMessage: "Processing image.",
  });

  const mediaHash = await sha256File(input.tempUploadPath);
  const existingProject = await findDuplicateProject(input.userId, mediaHash);

  if (existingProject) {
    updateUploadJob(jobId, {
      status: "completed",
      progressMessage: "Duplicate media detected.",
      result: {
        projectId: existingProject.id,
        duplicate: true,
        durationSeconds: 0,
        title: input.originalFilename,
      },
    });
    return;
  }

  // The image is loaded only after duplicate detection so duplicate uploads
  // don't unnecessarily consume memory.
  const imageBuffer = await fs.readFile(input.tempUploadPath);
  const storagePath = createStoragePath(input.userId, input.extension);

  await uploadToStorage(storagePath, imageBuffer, input.mimetype);

  try {
    const projectId = await createProject({
      userId: input.userId,
      mediaHash,
      storagePath,
    });

    updateUploadJob(jobId, {
      status: "completed",
      progressMessage: "Image uploaded successfully.",
      result: {
        projectId,
        duplicate: false,
        durationSeconds: 0,
        title: input.originalFilename,
      },
    });
  } catch (error) {
    // Storage succeeded but the DB insert failed. Remove the orphaned object.
    await removeFromStorage(storagePath).catch(() => {});
    throw error;
  }
}
