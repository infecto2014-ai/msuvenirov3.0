// Sends an order to the `send-telegram` edge function (multipart/form-data).
// Contract: supabase/functions/send-telegram/index.ts
import type { EstimateItem } from './estimate';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase-public';

export type ContactMethod = 'phone' | 'telegram' | 'max' | 'whatsapp' | 'vk';

export interface OrderPayload {
  name: string;
  phone: string;
  contactMethod: ContactMethod;
  email?: string;
  comment?: string;
  items: EstimateItem[];
  files: File[];
  /** honeypot value — must stay empty */
  website: string;
  startedAt: number;
}

export const MAX_FILES = 10;
export const MAX_FILE_MB = 20;
export const MAX_TOTAL_MB = 50;
export const ACCEPT =
  '.png,.jpg,.jpeg,.webp,.heic,.pdf,.ai,.eps,.cdr,.psd,.svg,.tif,.tiff,.zip,.rar,.7z,.docx,.xlsx,.txt';

export const validateFiles = (files: File[]): string | null => {
  if (files.length > MAX_FILES) return `Можно прикрепить не больше ${MAX_FILES} файлов.`;
  const allowed = ACCEPT.split(',');
  for (const f of files) {
    const ext = `.${f.name.split('.').pop()?.toLowerCase() ?? ''}`;
    if (!allowed.includes(ext)) return `Формат файла «${f.name}» не поддерживается.`;
    if (f.size > MAX_FILE_MB * 1024 * 1024) return `Файл «${f.name}» больше ${MAX_FILE_MB} МБ.`;
  }
  const total = files.reduce((a, f) => a + f.size, 0);
  if (total > MAX_TOTAL_MB * 1024 * 1024) return `Общий размер файлов больше ${MAX_TOTAL_MB} МБ.`;
  return null;
};

export const phoneDigits = (s: string) => s.replace(/\D/g, '');

export async function sendOrder(p: OrderPayload): Promise<{ ok: true } | { ok: false; message: string }> {
  const fd = new FormData();
  fd.append('name', p.name.trim());
  fd.append('phone', p.phone.trim());
  fd.append('contact_method', p.contactMethod);
  if (p.email?.trim()) fd.append('email', p.email.trim());
  if (p.comment?.trim()) fd.append('comment', p.comment.trim());
  if (p.items.length) {
    fd.append(
      'estimate',
      JSON.stringify(
        p.items.map((i) => ({
          title: i.title.slice(0, 120),
          details: `${i.from ? 'от, ' : ''}${i.details}`.slice(0, 300),
          qty: i.qty,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
      ),
    );
    fd.append('estimate_total', String(p.items.reduce((a, i) => a + i.total, 0)));
  }
  fd.append('page', location.pathname.slice(0, 200));
  fd.append('website', p.website);
  fd.append('elapsed_ms', String(Date.now() - p.startedAt));
  fd.append('fileCount', String(p.files.length));
  p.files.forEach((f, i) => fd.append(`file_${i}`, f, f.name));

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-telegram`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      body: fd,
    });
    const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
    if (res.ok && data.success) return { ok: true };
    return { ok: false, message: data.error || 'Не удалось отправить заявку. Позвоните нам или напишите в Telegram.' };
  } catch {
    return { ok: false, message: 'Нет связи с сервером. Проверьте интернет или позвоните нам.' };
  }
}
