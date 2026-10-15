/**
 * Robust, cross-platform Content & Image Sharing Helper for AI Studio Applet
 * Handles Native Android FileProvider Share, Web Share API, WhatsApp Direct Link, and Download Fallback
 */
import { shareImageNative } from './device';

export async function shareTextContent(options: {
  title?: string;
  text: string;
  url?: string;
}): Promise<'shared' | 'whatsapp' | 'copied' | 'error'> {
  const { title = 'श्री शक्ति सनातन वैदिक पंचांग', text, url } = options;
  const fullText = url ? `${text}\n${url}` : text;

  // 1. Try Native Web Share API first
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title,
        text: fullText,
      });
      return 'shared';
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') {
        return 'shared';
      }
      // Fall through to WhatsApp / Clipboard if Web Share was refused or failed
    }
  }

  // 2. Try WhatsApp API Direct Link
  try {
    const encoded = encodeURIComponent(fullText);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    
    const win = window.open(waUrl, '_blank', 'noopener,noreferrer');
    if (win) {
      return 'whatsapp';
    }
    
    // If popup was blocked by browser/iframe, redirect directly
    window.location.href = waUrl;
    return 'whatsapp';
  } catch {
    // 3. Fallback to Clipboard Copy
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullText);
        return 'copied';
      }
    } catch {
      /* ignore */
    }
    return 'error';
  }
}

export async function shareImageFile(options: {
  imageUri: string;
  fileName: string;
  title: string;
  text: string;
}): Promise<'shared' | 'downloaded' | 'copied' | 'whatsapp' | 'error'> {
  const { imageUri, fileName, title, text } = options;

  try {
    // 0. Native Android Capacitor Plugin Share (FileProvider + EXTRA_STREAM + EXTRA_TEXT)
    const nativeShared = await shareImageNative(imageUri, fileName, text);
    if (nativeShared) {
      return 'shared';
    }

    const res = await fetch(imageUri);
    const blob = await res.blob();
    const file = new File([blob], fileName, { type: 'image/png' });

    // 1. Try Web Share API with file support
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          title,
          text,
          files: [file],
        });
        return 'shared';
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return 'shared';
      }
    }

    // 2. Direct Blob Download
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    return 'downloaded';
  } catch {
    // Direct WhatsApp text share as fallback
    return shareTextContent({ title, text });
  }
}

