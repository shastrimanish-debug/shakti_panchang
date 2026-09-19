export interface PdfResult {
  fileName: string;
  blob: Blob;
  blobUrl: string;
  pageCount: number;
}

export async function waitForPdfFonts(): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    if (document.fonts?.ready) await document.fonts.ready;
  } catch {
    /* ignore */
  }
  await new Promise((r) => setTimeout(r, 50));
}

export function triggerPdfDownload(blobUrl: string, fileName: string) {
  if (typeof document === "undefined") return;
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    if (document.body.contains(link)) document.body.removeChild(link);
  }, 400);
}
