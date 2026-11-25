import { removeLocalFiles } from "./file-utils";
import { updateUploadJob } from "./job-store";
import { extractAudio, inspectDuration } from "./media-tools";
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

    await extractAudio(input.tempUploadPath, outputAudioPath, durationSeconds);

    // updateUploadJob(jobId, {
    //   status: "hashing",
    //   progressMessage: "Generating media hash.",
    // });

    // const mediaHash = await sha256File(outputAudioPath);
    // const existingProject = await findDuplicateProjectAsset(
    //   input.userId,
    //   mediaHash,
    // );

    // if (existingProject) {
    //   updateUploadJob(jobId, {
    //     status: "completed",
    //     progressMessage: "Duplicate media detected.",
    //     result: {
    //       projectAssetId: existingProject.id,
    //       duplicate: true,
    //       durationSeconds,
    //       title: input.originalFilename,
    //     },
    //   });
    //   return;
    // }

    // const audioBuffer = await fs.readFile(outputAudioPath);
    // const storagePath = createStoragePath(input.userId, ".mp3");

    // await uploadToStorage(storagePath, audioBuffer, "audio/mpeg");

    try {
      // await createProject({ status: "uploaded", userId: input.userId });
      // const { data: project, error: projectError } = await supabase
      //   .from("projects")
      //   .select("id")
      //   .eq("user_id", input.userId)
      //   .single();

      // if (projectError) throw projectError;

      // const projectAssetId = await createProjectAsset({
      //   projectId: project.id,
      //   mediaHash,
      //   storagePath,
      // });

      updateUploadJob(jobId, {
        status: "completed",
        progressMessage: "Upload complete.",
        result: {
          // projectAssetId,
          duplicate: false,
          durationSeconds,
          title: input.originalFilename,
        },
      });
    } catch (error) {
      // Roll back the storage object if the DB transaction cannot be completed.
      // await removeFromStorage(storagePath).catch(() => {});
      throw error;
    }
  } finally {
    // FFmpeg creates a second local file. Always delete it, including on errors.
    await removeLocalFiles(outputAudioPath);
  }
}
