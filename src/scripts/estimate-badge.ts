// Header estimate badge: the number of lines in the estimate; hidden when there are none.
// Reads localStorage directly (estimate.ts would pull the whole price list into every page).
import { countStored, estimateLabel, ESTIMATE_EVENT, ESTIMATE_KEY } from '@/lib/estimate-count';

const read = (): number => {
  try {
    return countStored(localStorage.getItem(ESTIMATE_KEY));
  } catch {
    return 0;
  }
};

const paint = (n: number) => {
  document.querySelectorAll<HTMLElement>('[data-estimate-count]').forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
  });
  document.querySelectorAll<HTMLElement>('[data-estimate-open]').forEach((el) => el.setAttribute('aria-label', estimateLabel(n)));
};

paint(read());
// the event carries the new list; fall back to storage when it does not
window.addEventListener(ESTIMATE_EVENT, (e) => {
  const d = (e as CustomEvent).detail;
  paint(Array.isArray(d) ? d.length : read());
});
