import { execa } from "execa";
import fs from "fs/promises";
import { MAX_DURATION } from "../../server";

export async function inspectDuration(filePath: string): Promise<number> {
  const { stdout } = await execa(
    "ffprobe",
    [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ],
    {
      // Protect the worker from a malformed media file that causes ffprobe to hang.
      timeout: 30_000,
      maxBuffer: 64 * 1024,
    },
  );

  const duration = Number.parseFloat(stdout.trim());

  if (!Number.isFinite(duration) || duration < 0) {
    throw new Error("Unable to determine media duration.");
  }

  if (duration > MAX_DURATION) {
    throw new Error("Media duration exceeds the allowed limit.");
  }

  return duration;
}

export async function extractAudio(
  inputPath: string,
  outputPath: string,
  durationSeconds: number,
): Promise<void> {
  await execa(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      // Never allow ffmpeg to wait for interactive stdin in a server process.
      "-nostdin",
      "-y",
      "-i",
      inputPath,
      "-vn",
      "-acodec",
      "libmp3lame",
      "-q:a",
      "2",
      outputPath,
    ],
    {
      // A bounded timeout prevents one malicious/problematic media file from
      // occupying a worker indefinitely. The upper bound is deliberately strict.
      timeout: Math.max(
        60_000,
        Math.min(15 * 60_000, (durationSeconds + 60) * 10_000),
      ),
      maxBuffer: 256 * 1024,
    },
  );

  await fs.access(outputPath);
}
