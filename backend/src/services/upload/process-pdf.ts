// process-pdf.ts

import fs from "fs/promises";
import { sha256File } from "./file-utils";
import { updateUploadJob } from "./job-store";
import { getPdfPageCount } from "./pdf-tools";
import {
  createProject,
  createStoragePath,
  findDuplicateProject,
  removeFromStorage,
  uploadToStorage,
} from "./storage";
import type { UploadInput } from "./types";

export async function processPdf(
  input: UploadInput,
  jobId: string,
): Promise<void> {
  updateUploadJob(jobId, {
    status: "inspecting",
    progressMessage: "Checking PDF.",
  });

  const pageCount = await getPdfPageCount(input.tempUploadPath);

  const mediaHash = await sha256File(input.tempUploadPath);

  const existingProject = await findDuplicateProject(input.userId, mediaHash);

  if (existingProject) {
    updateUploadJob(jobId, {
      status: "completed",
      progressMessage: "Duplicate PDF detected.",
      result: {
        projectId: existingProject.id,
        duplicate: true,
        durationSeconds: 0,
        title: input.originalFilename,
      },
    });

    return;
  }

  const pdfBuffer = await fs.readFile(input.tempUploadPath);

  const storagePath = createStoragePath(input.userId, input.extension);

  await uploadToStorage(storagePath, pdfBuffer, input.mimetype);

  try {
    const projectId = await createProject({
      userId: input.userId,
      mediaHash,
      storagePath,
    });

    updateUploadJob(jobId, {
      status: "completed",
      progressMessage: "PDF uploaded successfully.",
      result: {
        projectId,
        duplicate: false,
        durationSeconds: 0,
        title: input.originalFilename,
      },
    });
  } catch (error) {
    await removeFromStorage(storagePath).catch(() => {});
    throw error;
  }
}
