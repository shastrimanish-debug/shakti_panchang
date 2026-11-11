import { Capacitor, registerPlugin } from "@capacitor/core";

interface UmaDevicePlugin {
  sharePdf(options: { base64: string; fileName: string }): Promise<void>;
  saveImage(options: { base64: string; fileName: string }): Promise<{ ok?: boolean; uri?: string }>;
  shareImage(options: { base64: string; fileName: string; text?: string }): Promise<void>;
  saveBackup(options: { content: string; fileName: string }): Promise<{ ok?: boolean; savedToDownloads?: boolean; fileName?: string }>;
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

export async function saveImageNative(dataUri: string, fileName: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const base64 = dataUri.includes(",") ? dataUri.split(",")[1] : dataUri;
    await UmaDevice.saveImage({ base64, fileName });
    return true;
  } catch {
    return false;
  }
}

export async function shareImageNative(dataUri: string, fileName: string, text?: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const base64 = dataUri.includes(",") ? dataUri.split(",")[1] : dataUri;
    await UmaDevice.shareImage({ base64, fileName, text: text || "" });
    return true;
  } catch {
    return false;
  }
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

export async function saveOrDeliverKundaliBackup(
  jsonContent: string,
  preferredFileName?: string
): Promise<{ success: boolean; fileName: string; method: string; message: string }> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = preferredFileName || `Kundali_Backup_${dateStr}.json`;

  // 1. If running in Native Capacitor App (Android)
  if (Capacitor.isNativePlatform()) {
    try {
      const res = await UmaDevice.saveBackup({ content: jsonContent, fileName });
      const finalName = res?.fileName || fileName;
      return {
        success: true,
        fileName: finalName,
        method: 'native',
        message: `फ़ाइल सुरक्षित हो गई: "${finalName}" (फोन के Downloads फोल्डर में और शेयर मेनू द्वारा)`,
      };
    } catch (e) {
      console.warn('Native saveBackup failed, falling back to web/share...', e);
    }
  }

  // 2. Web Share API with File (Mobile Chrome, Safari, Android browser)
  try {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const file = new File([blob], fileName, { type: 'application/json' });
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: fileName,
        text: 'कुंडली बैकअप फ़ाइल',
      });
      return {
        success: true,
        fileName,
        method: 'share',
        message: `बैकअप शेयर/सेव किया गया: "${fileName}"`,
      };
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return {
        success: true,
        fileName,
        method: 'share_cancelled',
        message: 'शेयर प्रक्रिया रद्द की गई',
      };
    }
  }

  // 3. Modern File System Access API (Desktop Chrome / Edge / Opera)
  try {
    if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: 'Kundali Backup File (*.json)',
            accept: { 'application/json': ['.json'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(jsonContent);
      await writable.close();
      return {
        success: true,
        fileName,
        method: 'picker',
        message: `फ़ाइल सफलतापूर्वक सेव की गई: "${fileName}"`,
      };
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return {
        success: true,
        fileName,
        method: 'picker_cancelled',
        message: 'सेव प्रक्रिया रद्द की गई',
      };
    }
  }

  // 4. Standard Browser Download (Blob + Anchor click + Data URL fallback)
  try {
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);

    return {
      success: true,
      fileName,
      method: 'download',
      message: `फ़ाइल डाउनलोड हो गई: "${fileName}"`,
    };
  } catch (err) {
    console.error('Download failed', err);
    return {
      success: false,
      fileName,
      method: 'failed',
      message: 'बैकअप फ़ाइल डाउनलोड नहीं हो सकी।',
    };
  }
}

