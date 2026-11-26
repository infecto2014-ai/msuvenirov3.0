import { gsap } from 'gsap';

export function initClothingRail(rail: HTMLElement) {
  const trigger = rail.querySelector<HTMLButtonElement>('.unfold')!;
  const items = [...rail.querySelectorAll<HTMLElement>('.pieces li')];
  const hangers = items.map(item => item.querySelector<HTMLElement>('.hanger')!);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let open = false;
  let reveal: gsap.core.Timeline;

  // The links keep their final widths, including on a scrollable phone rail.
  // Only move the hangers: both views pivot around the same fixed hook.
  function measure() {
    const width = rail.clientWidth;
    const progress = reveal?.progress() ?? 0;
    reveal?.kill();
    const offsets = items.map((item, index) => {
      const center = width * (.61 + .36 * (index + .5) / items.length);
      return center - item.offsetLeft - item.offsetWidth / 2;
    });
    const timing = { duration: .52, stagger: .018, ease: 'power2.inOut' };
    reveal = gsap.timeline({ paused: true })
      .fromTo(items, { x: i => offsets[i] }, { ...timing, x: 0 }, 0)
      .fromTo(rail.querySelector('.intro'), { opacity: 1 }, { opacity: 0, duration: .18 }, 0)
      .fromTo(rail.querySelectorAll('.side'), { opacity: 1, rotationY: 0 },
        { ...timing, opacity: 0, rotationY: 38 }, 0)
      .fromTo(rail.querySelectorAll('.front'), { opacity: 0, rotationY: -56 },
        { ...timing, opacity: 1, rotationY: 0 }, 0)
      .fromTo(rail.querySelectorAll('.piece span'), { opacity: 0 }, { opacity: 1, duration: .2 }, .28);
    reveal.progress(progress);
    settle();
  }
  function settle() {
    if (motion.matches) {
      reveal.pause().progress(open ? 1 : 0);
      gsap.killTweensOf(hangers);
      gsap.set(hangers, { rotation: 0 });
    } else if (open) reveal.play();
    else reveal.reverse();
  }
  function setOpen(next: boolean) {
    if (open === next) return;
    open = next;
    rail.toggleAttribute('data-open', next);
    settle();
  }
  measure();
  rail.dataset.interactive = '';
  new ResizeObserver(measure).observe(rail);
  motion.addEventListener('change', settle);

  rail.addEventListener('pointerover', event => {
    if (event.pointerType === 'mouse' && (event.target as Element).closest('.piece, .unfold')) setOpen(true);
  });
  rail.addEventListener('pointerleave', event => {
    lastX = null;
    if (event.pointerType === 'mouse' && !rail.scrollLeft && !rail.querySelector(':focus-visible')) setOpen(false);
  });
  trigger.addEventListener('click', () => {
    setOpen(true);
    rail.querySelector<HTMLAnchorElement>('.piece')?.focus({ preventScroll: true });
  });
  rail.addEventListener('focusin', event => {
    if ((event.target as Element).closest('.piece')) setOpen(true);
  });
  rail.addEventListener('focusout', event => {
    if (!rail.contains(event.relatedTarget as Node) && !rail.matches(':hover') && !rail.scrollLeft) setOpen(false);
  });
  document.addEventListener('pointerdown', event => {
    if (!rail.contains(event.target as Node) && !rail.scrollLeft) setOpen(false);
  });

  // A new brush interrupts the old swing at its current angle.
  // A rightward brush needs negative rotation for the hem to move right.
  let lastX: number | null = null;
  let lastHanger: HTMLElement | undefined;
  let lastDirection = 0;
  function brush(x: number, y: number) {
    const delta = lastX === null ? 0 : x - lastX;
    lastX = x;
    if (!open || motion.matches || Math.abs(delta) < 1) return;
    const link = document.elementFromPoint(x, y)?.closest('.piece');
    const hanger = link?.querySelector<HTMLElement>('.hanger');
    const direction = Math.sign(delta);
    if (hanger && (hanger !== lastHanger || direction !== lastDirection)) {
      const tilt = -direction * Math.min(5, 2 + Math.abs(delta) * .1);
      gsap.killTweensOf(hanger);
      gsap.timeline().to(hanger, { rotation: tilt, duration: .14, ease: 'power2.out' })
        .to(hanger, { rotation: 0, duration: .7, ease: 'elastic.out(1,.55)' });
    }
    lastHanger = hanger ?? undefined;
    lastDirection = direction;
  }
  rail.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch') brush(event.clientX, event.clientY);
  });
  rail.addEventListener('touchstart', event => {
    lastX = event.touches[0].clientX;
    lastHanger = undefined;
  }, { passive: true });
  rail.addEventListener('touchmove', event => {
    const touch = event.touches[0];
    if (!open && event.target === trigger && lastX !== null && Math.abs(touch.clientX - lastX) > 3) setOpen(true);
    brush(touch.clientX, touch.clientY);
  }, { passive: true });
}
