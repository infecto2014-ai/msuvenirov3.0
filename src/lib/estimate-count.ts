// Light-weight view of the estimate for the header badge: no pricing import (it would put a 40 KB chunk on every page).
// The storage key and event name live here so estimate.ts and the badge cannot drift apart.
export const ESTIMATE_KEY = 'msuvenirov:estimate:v1';
export const ESTIMATE_EVENT = 'estimate:change';
/** estimate.ts keeps at most this many lines */
export const ESTIMATE_MAX_LINES = 30;

/** Number of lines in a stored estimate; same validity rules as estimate.ts read(): an array of objects with a string id. */
export const countStored = (raw: string | null): number => {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return 0;
    return parsed.filter((i) => !!i && typeof i === 'object' && typeof i.id === 'string').slice(0, ESTIMATE_MAX_LINES).length;
  } catch {
    return 0;
  }
};

/** «позиция / позиции / позиций» for n */
export const pluralLines = (n: number): string => {
  const m100 = n % 100;
  const m10 = n % 10;
  if (m100 >= 11 && m100 <= 14) return 'позиций';
  if (m10 === 1) return 'позиция';
  if (m10 >= 2 && m10 <= 4) return 'позиции';
  return 'позиций';
};

/** accessible name of the header «Смета» button */
export const estimateLabel = (n: number): string => (n > 0 ? `Смета, ${n} ${pluralLines(n)}` : 'Смета');
