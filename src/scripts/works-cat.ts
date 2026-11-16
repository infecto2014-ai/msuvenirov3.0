// «Наши работы»: the cat over the strip peeks out once, the first time the block comes into view.
// The script only sets data-cat on the cat ('wait' → 'peek'); the motion itself is CSS in Works.astro.
// Without this script, with reduced motion or without IntersectionObserver the cat simply sits in place.
export function initWorksCat(root: HTMLElement): void {
  // the placeholder (no picture yet) does not peek
  const cat = root.querySelector<HTMLElement>('.wk-cat:not(.wk-cat-ph)');
  if (!cat || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  cat.dataset.cat = 'wait';
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      cat.dataset.cat = 'peek';
    },
    // most of the cat is on screen and clear of the bottom edge, so the peek is actually seen
    { threshold: 0.4, rootMargin: '0px 0px -15% 0px' },
  );
  io.observe(cat);
}
