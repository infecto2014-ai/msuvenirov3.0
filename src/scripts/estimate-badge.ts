// Header estimate badge: the number of lines in the estimate; hidden when there are none.
import { ESTIMATE_EVENT, getEstimate } from '@/lib/estimate';

const paint = () => {
  const n = getEstimate().length;
  document.querySelectorAll<HTMLElement>('[data-estimate-count]').forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
  });
};

paint();
window.addEventListener(ESTIMATE_EVENT, paint);
