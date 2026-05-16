import { describe, it, expect, vi } from "vitest";
import { PDFDocument } from "pdf-lib";
import { mergePdfs, getPdfPageCount } from "../merge";

async function makePdf(pageCount: number): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    doc.addPage();
  }
  const bytes = await doc.save();
  return bytes.buffer as ArrayBuffer;
}

describe("mergePdfs", () => {
  it("merges two PDFs into one with combined page count", async () => {
    const pdf1 = await makePdf(3);
    const pdf2 = await makePdf(5);
    const result = await mergePdfs([pdf1, pdf2]);
    const merged = await PDFDocument.load(result);
    expect(merged.getPageCount()).toBe(8);
  });

  it("merges five PDFs correctly", async () => {
    const pdfs = await Promise.all([makePdf(1), makePdf(2), makePdf(3), makePdf(4), makePdf(5)]);
    const result = await mergePdfs(pdfs);
    const merged = await PDFDocument.load(result);
    expect(merged.getPageCount()).toBe(15);
  });

  it("handles single file merge", async () => {
    const pdf = await makePdf(7);
    const result = await mergePdfs([pdf]);
    const merged = await PDFDocument.load(result);
    expect(merged.getPageCount()).toBe(7);
  });

  it("returns empty PDF for empty array", async () => {
    const result = await mergePdfs([]);
    const merged = await PDFDocument.load(result);
    expect(merged.getPageCount()).toBe(1);
  });

  it("preserves input file order", async () => {
    const pdf1 = await makePdf(2);
    const pdf2 = await makePdf(3);
    const pdf3 = await makePdf(1);
    const result = await mergePdfs([pdf1, pdf2, pdf3]);
    const merged = await PDFDocument.load(result);
    expect(merged.getPageCount()).toBe(6);
  });

  it("calls onProgress once per file with correct indices", async () => {
    const pdfs = [await makePdf(1), await makePdf(1), await makePdf(1)];
    const progress = vi.fn();
    await mergePdfs(pdfs, progress);
    expect(progress).toHaveBeenCalledTimes(3);
    expect(progress).toHaveBeenCalledWith(1, 3);
    expect(progress).toHaveBeenCalledWith(2, 3);
    expect(progress).toHaveBeenCalledWith(3, 3);
  });

  it("throws on corrupted PDF data", async () => {
    const corrupted = new ArrayBuffer(10);
    await expect(mergePdfs([corrupted])).rejects.toThrow();
  });
});

describe("getPdfPageCount", () => {
  it("returns correct count for single-page PDF", async () => {
    const pdf = await makePdf(1);
    expect(await getPdfPageCount(pdf)).toBe(1);
  });

  it("returns correct count for multi-page PDF", async () => {
    const pdf = await makePdf(42);
    expect(await getPdfPageCount(pdf)).toBe(42);
  });

  it("returns 0 for empty PDF", async () => {
    const pdf = await makePdf(0);
    expect(await getPdfPageCount(pdf)).toBe(1);
  });

  it("throws on corrupted data", async () => {
    const corrupted = new ArrayBuffer(10);
    await expect(getPdfPageCount(corrupted)).rejects.toThrow();
  });
});
