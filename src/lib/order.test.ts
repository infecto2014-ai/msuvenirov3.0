import { afterEach, expect, test, vi } from 'vitest';
import { sendOrder, type OrderPayload } from './order';
import type { EstimateItem } from './estimate';

const item = (total: number, note?: string): EstimateItem => ({
  id: String(total),
  title: 'Футболка',
  details: 'А4',
  qty: 1,
  unitPrice: total,
  total,
  note,
});

afterEach(() => vi.unstubAllGlobals());

test('sendOrder: estimate_total не включает позиции с пометкой «индивидуально»', async () => {
  let body: FormData | undefined;
  vi.stubGlobal('location', { pathname: '/' });
  vi.stubGlobal('fetch', async (_u: string, init: { body: FormData }) => {
    body = init.body;
    return { ok: true, json: async () => ({ success: true }) };
  });
  const p: OrderPayload = {
    name: 'Иван',
    phone: '+7 900 000-00-00',
    contactMethod: 'phone',
    items: [item(500), item(300, 'индивидуально')],
    files: [],
    website: '',
    startedAt: Date.now(),
  };
  expect((await sendOrder(p)).ok).toBe(true);
  expect(body?.get('estimate_total')).toBe('500');
});
