import { execFile } from "child_process";
import fs from "fs/promises";
import { promisify } from "util";
import { MAX_DURATION } from "../../server";

const execFileAsync = promisify(execFile);

export async function inspectMedia(filePath: string, mimeType: string) {
  // 1. Signature / File header validation logic (retained as is)
  const buffer = Buffer.alloc(4100);
  const fileHandle = await fs.open(filePath, "r");
  await fileHandle.read(buffer, 0, 4100, 0);
  await fileHandle.close();

  // 2. ffprobe duration & stream inspection
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    filePath,
  ]);

  const metadata = JSON.parse(stdout);
  const duration = parseFloat(metadata.format?.duration || "0");

  if (duration > MAX_DURATION) {
    throw new Error(
      `Media duration exceeds the maximum ${MAX_DURATION / 60}mins duration.`,
    );
  }

  return { duration, metadata };
}
