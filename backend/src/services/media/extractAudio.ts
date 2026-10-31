import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function extractAudio(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  // Extract audio stream to clean mp3
  await execFileAsync("ffmpeg", [
    "-i",
    inputPath,
    "-vn",
    "-acodec",
    "libmp3lame",
    "-ab",
    "192k",
    outputPath,
  ]);
}
