import fs from "fs/promises";
import { inspectDuration, extractAudio } from "./media-tools";
import { sha256File, removeLocalFiles } from "./file-utils";
import { updateUploadJob } from "./job-store";
import {
  createProject,
  createStoragePath,
  findDuplicateProject,
  removeFromStorage,
  uploadToStorage,
} from "./storage";
import type { UploadInput } from "./types";

export async function processAudioVideo(
  input: UploadInput,
  jobId: string,
): Promise<void> {
  const outputAudioPath = `${input.tempUploadPath}.processed.mp3`;

  try {
    updateUploadJob(jobId, {
      status: "inspecting",
      progressMessage: "Checking media duration.",
    });

    const durationSeconds = await inspectDuration(input.tempUploadPath);

    updateUploadJob(jobId, {
      status: "converting",
      progressMessage: "Extracting audio.",
    });

    await extractAudio(
      input.tempUploadPath,
      outputAudioPath,
      durationSeconds,
    );

    updateUploadJob(jobId, {
      status: "hashing",
      progressMessage: "Generating media hash.",
    });

    const mediaHash = await sha256File(outputAudioPath);
    const existingProject = await findDuplicateProject(
      input.userId,
      mediaHash,
    );

    if (existingProject) {
      updateUploadJob(jobId, {
        status: "completed",
        progressMessage: "Duplicate media detected.",
        result: {
          projectId: existingProject.id,
          duplicate: true,
          durationSeconds,
          title: input.originalFilename,
        },
      });
      return;
    }

    const audioBuffer = await fs.readFile(outputAudioPath);
    const storagePath = createStoragePath(input.userId, ".mp3");

    await uploadToStorage(storagePath, audioBuffer, "audio/mpeg");

    try {
      const projectId = await createProject({
        userId: input.userId,
        mediaHash,
        storagePath,
      });

      updateUploadJob(jobId, {
        status: "completed",
        progressMessage: "Processing and upload complete.",
        result: {
          projectId,
          duplicate: false,
          durationSeconds,
          title: input.originalFilename,
        },
      });
    } catch (error) {
      // Roll back the storage object if the DB transaction cannot be completed.
      await removeFromStorage(storagePath).catch(() => {});
      throw error;
    }
  } finally {
    // FFmpeg creates a second local file. Always delete it, including on errors.
    await removeLocalFiles(outputAudioPath);
  }
}
