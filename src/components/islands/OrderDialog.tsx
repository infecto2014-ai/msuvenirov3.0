import { useEffect, useRef, useState } from 'preact/hooks';
import {
  ESTIMATE_EVENT,
  ORDER_OPEN_EVENT,
  clearEstimate,
  estimateTotal,
  getEstimate,
  removeFromEstimate,
  FILES_EVENT,
  getOrderFiles,
  setOrderFiles,
  setEstimateQty,
  stepQty,
  type EstimateItem,
} from '@/lib/estimate';
import { ACCEPT, MAX_FILES, phoneDigits, sendOrder, validateFiles, type ContactMethod } from '@/lib/order';
import { formatPhone } from '@/lib/phone';
import { reachGoal } from '@/lib/metrika';
import { findProduct, rub } from '@/data/pricing';
import './OrderDialog.css';

const methods: { id: ContactMethod; label: string }[] = [
  { id: 'phone', label: 'Звонок' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'max', label: 'MAX' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'vk', label: 'ВКонтакте' },
];

const Cross = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const Warn = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 7.5v5.5M12 16.6h.01" />
  </svg>
);
const Clip = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);
const Tick = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done' } | { kind: 'error'; message: string };

export default function OrderDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<ContactMethod>('phone');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [files, setFilesState] = useState<File[]>([]);
  // files live in a shared store so a calculator can attach them before the form opens
  const setFiles = (f: File[]) => setOrderFiles(f);
  useEffect(() => {
    setFilesState(getOrderFiles());
    const on = (e: Event) => setFilesState([...(e as CustomEvent<File[]>).detail]);
    window.addEventListener(FILES_EVENT, on);
    return () => window.removeEventListener(FILES_EVENT, on);
  }, []);
  const [fileError, setFileError] = useState('');
  const [website, setWebsite] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [drag, setDrag] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    setItems(getEstimate());
    const onChange = (e: Event) => setItems([...(e as CustomEvent<EstimateItem[]>).detail]);
    const onOpen = () => {
      setItems(getEstimate());
      if (status.kind === 'done') setStatus({ kind: 'idle' });
      startedAt.current = Date.now();
      // the mobile menu sheet lies under the dialog: close it so it does not hang behind
      document.querySelectorAll<HTMLDetailsElement>('details.mnav[open]').forEach((d) => (d.open = false));
      const dlg = dialog.current;
      if (dlg && !dlg.open) {
        dlg.showModal();
        // focus goes to the first field (the browser would pick the close button); closing returns it to the opener
        dlg.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
      }
      reachGoal('order_open');
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-estimate-open]')) {
        e.preventDefault();
        onOpen();
        return;
      }
      const el = target.closest<HTMLElement>('[data-order]');
      if (el) {
        e.preventDefault();
        // buttons like «Заказать» on a popular item pass what is ordered: data-order="Футболка с принтом А4, 1 шт"
        const what = el.dataset.order?.trim();
        // a bare `data-order` attribute is rendered by Astro as "true" — that is not an item
        if (what && what !== 'true') setComment((c) => (c.includes(what) ? c : c ? `${c}\n${what}` : what));
        onOpen();
      }
    };
    window.addEventListener(ESTIMATE_EVENT, onChange);
    window.addEventListener(ORDER_OPEN_EVENT, onOpen);
    document.addEventListener('click', onClick);
    if (location.hash === '#zakaz') onOpen();
    return () => {
      window.removeEventListener(ESTIMATE_EVENT, onChange);
      window.removeEventListener(ORDER_OPEN_EVENT, onOpen);
      document.removeEventListener('click', onClick);
    };
  }, [status.kind]);

  const close = () => dialog.current?.close();

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list)].slice(0, MAX_FILES);
    const err = validateFiles(next);
    setFileError(err ?? '');
    if (!err) {
      setFiles(next);
      reachGoal('file_attached');
    }
  };

  const nameOk = name.trim().length >= 2;
  const phoneOk = phoneDigits(phone).length === 11;
  const total = estimateTotal(items);
  const hasFrom = items.some((i) => i.from);

  const submit = async (e: Event) => {
    e.preventDefault();
    setTouched(true);
    if (!nameOk || !phoneOk) {
      reachGoal('form_validation_error');
      // move focus to the first field with an error, so it is seen and announced
      setTimeout(() => dialog.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setStatus({ kind: 'sending' });
    reachGoal('form_submit_attempt');
    const res = await sendOrder({ name, phone, contactMethod: method, email, comment, items, files, website, startedAt: startedAt.current });
    if (res.ok) {
      setStatus({ kind: 'done' });
      reachGoal('form_submit_success', { total, items: items.length, files: files.length });
      clearEstimate();
      setFiles([]);
      setComment('');
    } else {
      setStatus({ kind: 'error', message: res.message });
      reachGoal('form_submit_error');
    }
  };

  return (
    <>
      <dialog
        ref={dialog}
        class="order"
        aria-labelledby="order-title"
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div class="order-box">
          <button type="button" class="order-close" aria-label="Закрыть" onClick={close}>
            <Cross />
          </button>

          {status.kind === 'done' ? (
            <div class="order-done">
              <div class="order-done-mark">
                <Tick />
              </div>
              <h2 id="order-title">Заявка отправлена</h2>
              <p>Менеджер свяжется с вами в рабочее время — ежедневно с 10:00 до 20:00. Если срочно — позвоните: <a href="tel:+79521142350">+7 (952) 114-23-50</a>.</p>
              <button type="button" class="order-btn" onClick={close}>
                Хорошо
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <h2 id="order-title">{items.length ? 'Ваша смета' : 'Заявка на расчёт'}</h2>
              {items.length === 0 && <p class="order-empty">В смете пока пусто</p>}
              <p class="order-sub">
                {items.length
                  ? 'Проверьте позиции и оставьте контакты — уточним детали и подтвердим цену.'
                  : 'Опишите задачу и приложите макет — рассчитаем стоимость и подскажем лучший вариант.'}
              </p>

              {items.length > 0 && (
                <div class="order-items">
                  {items.map((i) => {
                    const p = i.calc ? findProduct(i.calc.cat, i.calc.product) : undefined;
                    return (
                      <div class="order-item">
                        <div class="order-item-text">
                          <b>{i.title}</b>
                          <span>
                            {i.details}
                            {!p && `${i.details ? ' · ' : ''}${i.qty.toLocaleString('ru-RU')} шт`}
                            {!i.note && ` · ${i.from ? 'от ' : ''}${rub(i.unitPrice)} / шт`}
                          </span>
                          {i.note && <span class="order-item-note">{i.note}</span>}
                          {p && (
                            <span class="order-qty" role="group" aria-label={`Количество: ${i.title}`}>
                              <button type="button" aria-label="Меньше" disabled={stepQty(p.qty, i.qty, -1) === i.qty} onClick={() => setEstimateQty(i.id, stepQty(p.qty, i.qty, -1))}>
                                −
                              </button>
                              <input
                                type="number"
                                inputMode="numeric"
                                min={p.qty.min}
                                value={i.qty}
                                aria-label="Количество, шт"
                                onChange={(e) => setEstimateQty(i.id, Number((e.target as HTMLInputElement).value))}
                              />
                              <span>шт</span>
                              <button type="button" aria-label="Больше" onClick={() => setEstimateQty(i.id, stepQty(p.qty, i.qty, 1))}>
                                +
                              </button>
                            </span>
                          )}
                        </div>
                        <span class="order-item-sum">
                          {i.note ? '—' : `${i.from ? 'от ' : ''}${rub(i.total)}`}
                        </span>
                        <button type="button" class="order-item-del" aria-label={`Удалить: ${i.title}`} onClick={() => removeFromEstimate(i.id)}>
                          <Cross />
                        </button>
                      </div>
                    );
                  })}
                  <div class="order-items-total">
                    <span>Итого по смете</span>
                    <b>
                      {hasFrom ? 'от ' : ''}
                      {rub(total)}
                    </b>
                  </div>
                  <a class="order-more" href="/price" onClick={close}>
                    + Добавить ещё изделие
                  </a>
                </div>
              )}

              <div class="order-fields">
                <label class="order-field">
                  <span class="order-label">Имя *</span>
                  <input
                    class="order-input"
                    name="name"
                    autoComplete="name"
                    maxLength={80}
                    value={name}
                    aria-invalid={touched && !nameOk}
                    aria-describedby={touched && !nameOk ? 'order-name-err' : undefined}
                    onInput={(e) => setName((e.target as HTMLInputElement).value)}
                  />
                  {touched && !nameOk && (
                    <span class="order-err" id="order-name-err" role="alert">
                      <Warn />
                      Как к вам обращаться?
                    </span>
                  )}
                </label>
                <label class="order-field">
                  <span class="order-label">Телефон *</span>
                  <input
                    class="order-input"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    aria-invalid={touched && !phoneOk}
                    aria-describedby={touched && !phoneOk ? 'order-phone-err' : undefined}
                    onInput={(e) => setPhone(formatPhone((e.target as HTMLInputElement).value))}
                  />
                  {touched && !phoneOk && (
                    <span class="order-err" id="order-phone-err" role="alert">
                      <Warn />
                      Проверьте номер: нужно 11 цифр
                    </span>
                  )}
                </label>
              </div>

              <div class="order-field">
                <span class="order-label" id="order-method">Как удобнее связаться?</span>
                <div class="order-chips" role="radiogroup" aria-labelledby="order-method">
                  {methods.map((m) => (
                    <button type="button" class="order-chip" role="radio" aria-checked={method === m.id} onClick={() => setMethod(m.id)}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <label class="order-field">
                <span class="order-label">Комментарий</span>
                <textarea
                  class="order-input"
                  name="comment"
                  maxLength={2000}
                  placeholder="Что печатаем, к какой дате, размеры, цвета…"
                  value={comment}
                  onInput={(e) => setComment((e.target as HTMLTextAreaElement).value)}
                />
              </label>

              <label class="order-field">
                <span class="order-label">E-mail <span class="order-opt">(необязательно)</span></span>
                <input class="order-input" name="email" type="email" autoComplete="email" maxLength={120} value={email} onInput={(e) => setEmail((e.target as HTMLInputElement).value)} />
              </label>

              <div
                class={`order-drop${drag ? ' is-drag' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  addFiles(e.dataTransfer?.files ?? null);
                }}
              >
                <label class="order-drop-label">
                  <span class="order-drop-ic">
                    <Clip />
                  </span>
                  <input type="file" multiple accept={ACCEPT} class="order-file" onChange={(e) => addFiles((e.target as HTMLInputElement).files)} />
                  <span class="order-drop-text">
                    <span>
                      <b>Прикрепить макет</b> или перетащите файлы сюда
                    </span>
                    <small>PNG, JPG, PDF, AI, CDR, PSD, ZIP — до 10 файлов, до 20 МБ каждый</small>
                  </span>
                </label>
                {files.length > 0 && (
                  <ul class="order-files">
                    {files.map((f, idx) => (
                      <li>
                        <span>{f.name}</span>
                        <button type="button" aria-label={`Убрать файл ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== idx))}>
                          <Cross />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {fileError && (
                  <p class="order-err" role="alert">
                    <Warn />
                    {fileError}
                  </p>
                )}
              </div>

              {/* honeypot: hidden from people, bots fill it */}
              <label class="order-hp" aria-hidden="true">
                Сайт
                <input tabIndex={-1} autoComplete="off" value={website} onInput={(e) => setWebsite((e.target as HTMLInputElement).value)} />
              </label>

              {status.kind === 'error' && (
                <p class="order-fail" role="alert">
                  <Warn />
                  {status.message}
                </p>
              )}

              <button type="submit" class="order-btn" disabled={status.kind === 'sending'}>
                {status.kind === 'sending' ? 'Отправляем…' : items.length ? 'Отправить смету' : 'Отправить заявку'}
              </button>
              <p class="order-legal">
                Нажимая кнопку, вы соглашаетесь с <a href="/privacy-policy">политикой обработки персональных данных</a>. Частным лицам — предоплата 50%, организациям — оплата по счёту.
              </p>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
