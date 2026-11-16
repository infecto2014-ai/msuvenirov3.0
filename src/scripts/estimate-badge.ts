// Estimate badge on the «Заявка» buttons: the number of lines in the estimate; hidden when there are none.
// Reads localStorage directly (estimate.ts would pull the whole price list into every page).
import { countStored, orderLabel, ESTIMATE_EVENT, ESTIMATE_KEY } from '@/lib/estimate-count';

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
  // the attribute value is the button's visible text
  document.querySelectorAll<HTMLElement>('[data-estimate-order]').forEach((el) => el.setAttribute('aria-label', orderLabel(n, el.dataset.estimateOrder || 'Заявка')));
};

paint(read());
// the event carries the new list; fall back to storage when it does not
window.addEventListener(ESTIMATE_EVENT, (e) => {
  const d = (e as CustomEvent).detail;
  paint(Array.isArray(d) ? d.length : read());
});
