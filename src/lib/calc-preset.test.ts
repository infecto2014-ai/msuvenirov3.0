import { expect, test } from 'vitest';
import { defaultSelection, findProduct } from '@/data/pricing';
import { applyPreset, CALC_APPLY_EVENT } from './calc-preset';

const tee = findProduct('textile', 'tshirt-unisex')!;

test('событие готового варианта называется calc:apply', () => {
  expect(CALC_APPLY_EVENT).toBe('calc:apply');
});

test('цветная футболка из готового варианта: 1 шт поднимается до 5, цвет и принт ставятся', () => {
  const s = applyPreset(tee, { options: { color: 'red', print1: 'a4' }, qty: 1 });
  expect(s.qty).toBe(5);
  expect(s.options.color).toBe('red');
  expect(s.options.print1).toBe('a4');
});

test('белая футболка остаётся с 1 шт', () => {
  expect(applyPreset(tee, { options: { color: 'white' }, qty: 1 }).qty).toBe(1);
});

test('неизвестная группа и неизвестное значение отбрасываются', () => {
  const s = applyPreset(tee, { options: { foo: 'bar', color: 'plaid', print2: 'a6' }, qty: 3 });
  expect(s.options).not.toHaveProperty('foo');
  expect(s.options.color).toBe(defaultSelection(tee).options.color);
  expect(s.options.print2).toBe('a6');
  expect(s.qty).toBe(3);
});

test('количество больше максимума ограничивается qty.max', () => {
  expect(applyPreset(tee, { qty: 999 }).qty).toBe(tee.qty.max);
});

test('пустой вариант даёт настройки по умолчанию', () => {
  expect(applyPreset(tee, {})).toEqual(defaultSelection(tee));
});

test('цена готового варианта совпадает с расчётом pricing.ts', () => {
  const s = applyPreset(tee, { options: { color: 'blue', print1: 'a4', print2: 'a6' }, qty: 20 });
  const q = tee.quote(s);
  expect(q.error).toBeUndefined();
  expect(q.total).toBe(q.unit * 20);
});
