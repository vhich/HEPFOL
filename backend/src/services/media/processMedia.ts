import os from "os";
import path from "path";
import { extractAudio } from "./extractAudio";
import { hashMedia } from "./hashMedia";
import { inspectMedia } from "./inspectMedia";

export async function processMediaPipeline(
  tempFilePath: string,
  mimeType: string,
) {
  // Step 1: Inspect and validate via ffprobe & security checks
  const inspection = await inspectMedia(tempFilePath, mimeType);

  // Step 2: Compute SHA-256 integrity hash for duplicate detection
  const fileHash = await hashMedia(tempFilePath);

  // Step 3: Optional audio processing extraction output path
  const outputAudioPath = path.join(os.tmpdir(), `${fileHash}.mp3`);
  await extractAudio(tempFilePath, outputAudioPath);

  return {
    fileHash,
    duration: inspection.duration,
    outputAudioPath,
  };
}
