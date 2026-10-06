import { Capacitor, registerPlugin } from "@capacitor/core";

interface UmaDevicePlugin {
  sharePdf(options: { base64: string; fileName: string }): Promise<void>;
  openUrl(options: { url: string }): Promise<void>;
  scheduleReminder(options: { id: string; title: string; body: string; timestamp: number }): Promise<void>;
  cancelReminder(options: { id: string }): Promise<void>;
}

const UmaDevice = registerPlugin<UmaDevicePlugin>("UmaDevice");

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || "");
      resolve(data.includes(",") ? data.split(",")[1] : data);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function deliverPdf(
  pdf: { output: (type: "blob") => Blob; save: (name: string) => void },
  fileName: string,
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    pdf.save(fileName);
    return true;
  }
  const blob = pdf.output("blob");
  const file = new File([blob], fileName, { type: "application/pdf" });
  if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return true;
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") return true;
    }
  }
  const base64 = await blobToBase64(blob);
  await UmaDevice.sharePdf({ base64, fileName });
  return true;
}

export async function openExternal(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await UmaDevice.openUrl({ url });
      return;
    } catch {
      /* fall through */
    }
  }
  window.open(url, "_blank");
}

export function scheduleNativeReminder(id: string, title: string, body: string, timestamp: number) {
  if (!Capacitor.isNativePlatform()) return;
  UmaDevice.scheduleReminder({ id, title, body, timestamp }).catch(() => {});
}

export function cancelNativeReminder(id: string) {
  if (!Capacitor.isNativePlatform()) return;
  UmaDevice.cancelReminder({ id }).catch(() => {});
}
