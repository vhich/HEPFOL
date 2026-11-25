// process-pdf.ts

import { updateUploadJob } from "./job-store";
import { getPdfPageCount } from "./pdf-tools";
import type { UploadInput } from "./types";

export async function processPdf(
  input: UploadInput,
  jobId: string,
): Promise<void> {
  updateUploadJob(jobId, {
    status: "inspecting",
    progressMessage: "Checking PDF.",
  });

  await getPdfPageCount(input.tempUploadPath);

  // const mediaHash = await sha256File(input.tempUploadPath);

  // const existingProject = await findDuplicateProjectAsset(
  //   input.userId,
  //   mediaHash,
  // );

  // if (existingProject) {
  //   updateUploadJob(jobId, {
  //     status: "completed",
  //     progressMessage: "Duplicate PDF detected.",
  //     result: {
  //       projectAssetId: existingProject.id,
  //       duplicate: true,
  //       durationSeconds: 0,
  //       title: input.originalFilename,
  //     },
  //   });

  //   return;
  // }

  // const pdfBuffer = await fs.readFile(input.tempUploadPath);

  // const storagePath = createStoragePath(input.userId, input.extension);

  // await uploadToStorage(storagePath, pdfBuffer, input.mimetype);

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
      progressMessage: "PDF uploaded successfully.",
      result: {
        // projectAssetId,
        duplicate: false,
        durationSeconds: 0,
        title: input.originalFilename,
      },
    });
  } catch (error) {
    // await removeFromStorage(storagePath).catch(() => {});
    throw error;
  }
}
