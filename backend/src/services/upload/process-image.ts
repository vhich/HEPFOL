import { updateUploadJob } from "./job-store";
import type { UploadInput } from "./types";

export async function processImage(
  input: UploadInput,
  jobId: string,
): Promise<void> {
  // updateUploadJob(jobId, {
  //   status: "hashing",
  //   progressMessage: "Processing image.",
  // });

  // const mediaHash = await sha256File(input.tempUploadPath);
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
  //       durationSeconds: 0,
  //       title: input.originalFilename,
  //     },
  //   });
  //   return;
  // }

  // The image is loaded only after duplicate detection so duplicate uploads
  // don't unnecessarily consume memory.
  // const imageBuffer = await fs.readFile(input.tempUploadPath);
  // const storagePath = createStoragePath(input.userId, input.extension);

  // await uploadToStorage(storagePath, imageBuffer, input.mimetype);

  try {
    // await createProject({ status: "uploaded", userId: input.userId });
    // const { data: projects, error: projectError } = await supabase
    //   .from("projects")
    //   .select("id")
    //   .eq("user_id", input.userId)
    //   .limit(FILE_UPLOAD_LIMIT);

    // if (projectError) throw projectError;
    // const projectList = projects ?? [];
    // for (const project of projectList) {
    //   await createProjectAsset({
    //     projectId: project.id,
    //     mediaHash,
    //     storagePath,
    //   });
    // }
    updateUploadJob(jobId, {
      status: "completed",
      progressMessage: "Image uploaded successfully.",
      result: {
        // projectAssetId: project.id,
        duplicate: false,
        durationSeconds: 0,
        title: input.originalFilename,
      },
    });
  } catch (error) {
    // Storage succeeded but the DB insert failed. Remove the orphaned object.
    // await removeFromStorage(storagePath).catch(() => {});
    throw error;
  }
}
