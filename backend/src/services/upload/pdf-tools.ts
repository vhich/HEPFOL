// process-pdf.ts

import fs from "fs/promises";
import { PDFDocument } from "pdf-lib";

const MAX_PDF_PAGES = 10;

export async function getPdfPageCount(filePath: string): Promise<number> {
  const buffer = await fs.readFile(filePath);

  const pdf = await PDFDocument.load(buffer, {
    ignoreEncryption: false,
  });

  const pageCount = pdf.getPageCount();

  if (pageCount > MAX_PDF_PAGES) {
    throw new Error(`PDF exceeds the maximum of ${MAX_PDF_PAGES} pages.`);
  }

  return pageCount;
}
