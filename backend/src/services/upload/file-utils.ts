import crypto from "crypto";
import fs from "fs/promises";

/**
 * Hashes the file incrementally instead of loading the whole file into RAM.
 * This is important because uploads can be tens of megabytes or larger.
 */
export async function sha256File(filePath: string): Promise<string> {
  const hash = crypto.createHash("sha256");
  const handle = await fs.open(filePath, "r");

  try {
    const buffer = Buffer.allocUnsafe(1024 * 1024); // 1 MiB working buffer.

    while (true) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
      if (bytesRead === 0) break;
      hash.update(buffer.subarray(0, bytesRead));
    }

    return hash.digest("hex");
  } finally {
    await handle.close();
  }
}

/** Best-effort cleanup; failure to remove a temporary file must not hide the original error. */
export async function removeLocalFiles(
  ...files: Array<string | undefined>
): Promise<void> {
  await Promise.all(
    files
      .filter((file): file is string => Boolean(file))
      .map((file) => fs.rm(file, { force: true }).catch(() => {})),
  );
}
