import { KundaliData } from '../types';
import { getUmaApiEndpoints } from './UmaVoiceService';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY_LAST_BACKUP_PHONE = 'shakti_last_cloud_backup_key';

export function getStoredCloudBackupKey(): string {
  try {
    const local = localStorage.getItem(STORAGE_KEY_LAST_BACKUP_PHONE);
    if (local && local.trim()) return local.trim();
  } catch {}
  return '';
}

export async function setStoredCloudBackupKey(key: string): Promise<void> {
  const clean = key.trim();
  try {
    localStorage.setItem(STORAGE_KEY_LAST_BACKUP_PHONE, clean);
    await Preferences.set({
      key: STORAGE_KEY_LAST_BACKUP_PHONE,
      value: clean,
    });
  } catch {}
}

export interface CloudBackupResult {
  success: boolean;
  count: number;
  message: string;
  updatedAt?: string;
}

export interface CloudRestoreResult {
  success: boolean;
  profiles: KundaliData[];
  count: number;
  message: string;
  updatedAt?: string;
}

export async function saveProfilesToCloud(
  key: string,
  profiles: KundaliData[]
): Promise<CloudBackupResult> {
  const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!cleanKey || cleanKey.length < 4) {
    return {
      success: false,
      count: 0,
      message: 'कृपया कम से कम 4 अक्षरों का वैध 10-अंकों का मोबाइल नंबर या बैकअप कोड दर्ज करें।',
    };
  }

  await setStoredCloudBackupKey(cleanKey);

  const endpoints = getUmaApiEndpoints('/api/cloud-backup/save');
  let lastError = 'सर्वर से संपर्क नहीं हो सका।';

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          key: cleanKey,
          profiles,
          clientInfo: {
            platform: typeof navigator !== 'undefined' ? navigator.userAgent : 'mobile',
            savedAt: new Date().toISOString(),
          },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.ok) {
          return {
            success: true,
            count: data.count ?? profiles.length,
            message: `क्लाउड में कुल ${data.count ?? profiles.length} कुण्डलियाँ सुरक्षित सहेज ली गईं!`,
            updatedAt: data.updatedAt,
          };
        } else if (data?.error) {
          lastError = data.error;
        }
      }
    } catch (e: any) {
      lastError = e?.message || 'नेटवर्क त्रुटि।';
    }
  }

  return {
    success: false,
    count: 0,
    message: `क्लाउड बैकअप विफल: ${lastError} (आप 'बैकअप फ़ाइल' विकल्प से लोकल बैकअप भी ले सकते हैं)`,
  };
}

export async function restoreProfilesFromCloud(
  key: string
): Promise<CloudRestoreResult> {
  const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!cleanKey || cleanKey.length < 4) {
    return {
      success: false,
      profiles: [],
      count: 0,
      message: 'कृपया वैध 10-अंकों का मोबाइल नंबर या बैकअप कोड दर्ज करें।',
    };
  }

  await setStoredCloudBackupKey(cleanKey);

  const endpoints = getUmaApiEndpoints(`/api/cloud-backup/restore/${encodeURIComponent(cleanKey)}`);
  let lastError = 'इस नंबर या बैकअप कोड पर कोई सहेजा हुआ डेटा नहीं मिला।';

  for (const url of endpoints) {
    try {
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.ok && Array.isArray(data.profiles)) {
          return {
            success: true,
            profiles: data.profiles,
            count: data.count || data.profiles.length,
            message: `क्लाउड से कुल ${data.count || data.profiles.length} कुण्डलियाँ प्राप्त हुईं।`,
            updatedAt: data.updatedAt,
          };
        } else if (data?.error) {
          lastError = data.error;
        }
      } else if (resp.status === 404) {
        lastError = 'इस मोबाइल नंबर / बैकअप कोड पर कोई बैकअप नहीं मिला।';
      }
    } catch (e: any) {
      lastError = e?.message || 'नेटवर्क त्रुटि।';
    }
  }

  return {
    success: false,
    profiles: [],
    count: 0,
    message: lastError,
  };
}
