import { gsap } from 'gsap';

export function initClothingRail(rail: HTMLElement) {
  const trigger = rail.querySelector<HTMLButtonElement>('.unfold')!;
  const items = [...rail.querySelectorAll<HTMLElement>('.pieces li')];
  const pieces = rail.querySelector<HTMLElement>('.pieces')!;
  const hangers = items.map(item => item.querySelector<HTMLElement>('.hanger')!);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 900px)');
  const dialog = document.querySelector<HTMLDialogElement>('#clothing-dialog')!;
  let open = false;
  let reveal: gsap.core.Timeline;
  let copies: HTMLElement[] = [];
  let cycleWidth = 0;
  let cycleStart = 0;

  items.forEach(item => {
    const link = item.querySelector<HTMLAnchorElement>('.piece')!;
    link.setAttribute('role', 'button');
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', dialog.id);
  });

  function clearLoop() {
    copies.forEach(copy => copy.remove());
    copies = [];
    cycleWidth = 0;
    rail.scrollLeft = 0;
  }
  function loop() {
    const position = cycleWidth ? (rail.scrollLeft - cycleStart) / cycleWidth : 0;
    if (!copies.length) {
      const clone = (item: HTMLElement) => {
        const copy = item.cloneNode(true) as HTMLElement;
        copy.setAttribute('aria-hidden', 'true');
        copy.querySelector<HTMLAnchorElement>('.piece')!.tabIndex = -1;
        return copy;
      };
      const before = items.map(clone), after = items.map(clone);
      pieces.prepend(...before);
      pieces.append(...after);
      copies = [...before, ...after];
    }
    cycleWidth = copies[items.length].offsetLeft - items[0].offsetLeft;
    cycleStart = items[0].offsetLeft - parseFloat(getComputedStyle(pieces).paddingLeft);
    rail.scrollLeft = cycleStart + position * cycleWidth;
  }

  // Identical neighbours let native touch scrolling wrap without a visible jump.
  rail.addEventListener('scroll', () => {
    if (!cycleWidth) return;
    const offset = rail.scrollLeft - cycleStart;
    if (offset < 0 || offset >= cycleWidth) {
      rail.scrollLeft = cycleStart + ((offset % cycleWidth) + cycleWidth) % cycleWidth;
    }
  }, { passive: true });

  // The links keep their final widths, including on a scrollable phone rail.
  // Only move the hangers: both views pivot around the same fixed hook.
  function measure() {
    if (!mobile.matches && copies.length) clearLoop();
    const width = rail.clientWidth;
    const progress = reveal?.progress() ?? 0;
    reveal?.kill();
    const offsets = items.map((item, index) => {
      const center = width * (.57 + .40 * (index + .5) / items.length);
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
      gsap.killTweensOf(hangers);
      gsap.set(hangers, { rotation: 0 });
    }
    if (mobile.matches && open) {
      reveal.pause().progress(1);
      loop();
    } else if (motion.matches) {
      reveal.pause().progress(open ? 1 : 0);
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
  mobile.addEventListener('change', measure);

  rail.addEventListener('pointerover', event => {
    if (event.pointerType === 'mouse' && (event.target as Element).closest('.piece, .unfold')) setOpen(true);
  });
  rail.addEventListener('pointerleave', event => {
    lastX = null;
    if (!mobile.matches && !dialog.open && event.pointerType === 'mouse' && !rail.querySelector(':focus-visible')) setOpen(false);
  });
  trigger.addEventListener('click', () => {
    setOpen(true);
    items[0].querySelector<HTMLAnchorElement>('.piece')?.focus({ preventScroll: true });
  });
  rail.addEventListener('focusin', event => {
    if ((event.target as Element).closest('.piece')) setOpen(true);
  });
  rail.addEventListener('focusout', event => {
    if (!mobile.matches && !dialog.open && !rail.contains(event.relatedTarget as Node) && !rail.matches(':hover')) setOpen(false);
  });
  document.addEventListener('pointerdown', event => {
    if (!mobile.matches && !dialog.open && !rail.contains(event.target as Node)) setOpen(false);
  });

  let opener: HTMLAnchorElement | null = null;
  let ignoreClickUntil = 0;
  rail.addEventListener('click', event => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('.piece');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if ((event.detail !== 0 && performance.now() < ignoreClickUntil) || dialog.open) return;
    opener = link;
    dialog.querySelector('#clothing-dialog-title')!.textContent = link.textContent!.trim();
    dialog.querySelector('#clothing-dialog-description')!.textContent = link.dataset.description!;
    dialog.querySelector<HTMLAnchorElement>('[data-clothing-link]')!.href = link.href;
    dialog.showModal();
  });
  rail.addEventListener('keydown', event => {
    if (event.key === ' ' && (event.target as Element).matches('.piece')) {
      event.preventDefault();
      (event.target as HTMLElement).click();
    }
  });
  dialog.querySelector('button')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const first = dialog.querySelector<HTMLButtonElement>('button')!;
    const last = dialog.querySelector<HTMLAnchorElement>('a')!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  function outside(event: MouseEvent) {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  }
  let startedOutside = false;
  dialog.addEventListener('pointerdown', event => { startedOutside = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (startedOutside && event.target === dialog && outside(event)) dialog.close();
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
  let touchStart: { x: number; y: number } | null = null;
  let suppressTouchClick = false;
  rail.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) return;
    ignoreClickUntil = 0;
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    // Revealing changes the item underneath the finger, just like scrolling.
    suppressTouchClick = mobile.matches && !open;
    lastX = event.touches[0].clientX;
    lastHanger = undefined;
    if (mobile.matches) setOpen(true);
  }, { passive: true });
  rail.addEventListener('touchmove', event => {
    if (event.touches.length !== 1 || !touchStart) return;
    const touch = event.touches[0];
    if (Math.abs(touch.clientX - touchStart.x) > 10 && Math.abs(touch.clientX - touchStart.x) > Math.abs(touch.clientY - touchStart.y)) suppressTouchClick = true;
    brush(touch.clientX, touch.clientY);
  }, { passive: true });
  function endTouch() {
    if (suppressTouchClick) ignoreClickUntil = performance.now() + 400;
    touchStart = null;
    lastX = null;
  }
  rail.addEventListener('touchend', endTouch, { passive: true });
  rail.addEventListener('touchcancel', endTouch, { passive: true });
}
