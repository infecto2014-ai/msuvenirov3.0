import { phoneDigits } from './order';

/** +7 (999) 123-45-67 — formats a Russian phone number while it is typed (order form, chat callback) */
export const formatPhone = (raw: string) => {
  let d = phoneDigits(raw);
  if (d.startsWith('8')) d = `7${d.slice(1)}`;
  if (!d.startsWith('7')) d = `7${d}`;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let out = '+7';
  if (p[0]) out += ` (${p[0]}`;
  if (p[0].length === 3) out += ')';
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += `-${p[2]}`;
  if (p[3]) out += `-${p[3]}`;
  return out;
};
