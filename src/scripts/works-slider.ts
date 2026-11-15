// «Наши работы» strip: the arrows scroll by one visible width, the dots show and pick the page.
// Without this script the strip still scrolls by finger, wheel and keyboard; the arrows and dots stay hidden.
const MAX_DOTS = 6;

export function initWorksSlider(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>('[data-works-track]');
  const prev = root.querySelector<HTMLButtonElement>('[data-works-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-works-next]');
  const dotsBox = root.querySelector<HTMLElement>('[data-works-dots]');
  if (!track || !prev || !next || !dotsBox) return;
  const items = Array.from(track.children) as HTMLElement[];
  if (!items.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = (): ScrollBehavior => (reduced.matches ? 'auto' : 'smooth');
  const maxScroll = () => track.scrollWidth - track.clientWidth;
  /** distance between the starts of two neighbouring cards */
  const stride = () => (items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : items[0].offsetWidth);
  /** cards that fit in the visible width (the last one has no gap after it) */
  const perView = () => {
    const gap = stride() - items[0].offsetWidth;
    return Math.max(1, Math.floor((track.clientWidth + gap + 1) / stride()) || 1);
  };
  const pageCount = () => (maxScroll() <= 1 ? 1 : Math.ceil(items.length / perView()));
  const currentPage = () => {
    const pages = pageCount();
    if (track.scrollLeft >= maxScroll() - 4) return pages - 1;
    return Math.min(pages - 1, Math.round(track.scrollLeft / (perView() * stride())));
  };

  let dots: HTMLButtonElement[] = [];
  const buildDots = () => {
    const pages = pageCount();
    if (dots.length === pages) return;
    dotsBox.replaceChildren();
    dots = Array.from({ length: pages }, (_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'wk-dot';
      b.setAttribute('aria-label', `Страница ${i + 1} из ${pages}`);
      b.addEventListener('click', () => {
        track.scrollTo({ left: Math.min(maxScroll(), i * perView() * stride()), behavior: behavior() });
      });
      dotsBox.append(b);
      return b;
    });
    // a phone shows one card per page: a dozen tiny dots would not help — the arrows and the swipe do
    dotsBox.hidden = pages < 2 || pages > MAX_DOTS;
  };

  const update = () => {
    const page = currentPage();
    dots.forEach((d, i) => d.setAttribute('aria-current', String(i === page)));
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= maxScroll() - 4;
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: behavior() }));
  next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: behavior() }));

  let raf = 0;
  track.addEventListener(
    'scroll',
    () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    },
    { passive: true },
  );
  new ResizeObserver(() => {
    buildDots();
    update();
  }).observe(track);

  root.classList.add('is-js');
  prev.hidden = false;
  next.hidden = false;
  buildDots();
  update();
}
