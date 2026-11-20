import { describe, expect, test } from 'vitest';
import { defaultSelection, findProduct, rub } from './pricing';

const notebook = findProduct('flyers', 'notebook')!;
const quote = (variant: 'a5' | 'a6', qty: number, cover?: 'front' | 'both') => {
  const selection = defaultSelection(notebook);
  selection.qty = qty;
  selection.options.variant = variant;
  if (cover) selection.options.cover = cover;
  else delete selection.options.cover;
  return notebook.quote(selection);
};

describe('блокноты: новый прайс владельца', () => {
  test('доступны от 10 до 30 штук, выше — индивидуальный расчёт', () => {
    expect(notebook.qty).toMatchObject({ min: 10, max: 30, default: 10, individualAbove: true });
    expect(quote('a5', 9).error).toBeTruthy();
    expect(quote('a5', 31).error).toBeTruthy();
  });

  test.each([10, 30])('передняя обложка: фиксированная ставка на границе тиража %s', (qty) => {
    expect(quote('a5', qty)).toMatchObject({ unit: 200, total: 200 * qty });
    expect(quote('a6', qty)).toMatchObject({ unit: 170, total: 170 * qty });
  });

  test('обе обложки: надбавка 15%, включая копейки А6', () => {
    expect(quote('a5', 30, 'both')).toMatchObject({ unit: 230, total: 6900 });
    expect(quote('a6', 30, 'both')).toMatchObject({ unit: 195.5, total: 5865 });
    expect(quote('a6', 11, 'both').total).toBe(2150.5);
    expect(quote('a6', 30, 'both').breakdown.reduce((sum, line) => sum + line.amount, 0)).toBe(195.5);
  });

  test('старая сохранённая позиция без cover считается с передней обложкой', () => {
    expect(quote('a5', 20).unit).toBe(200);
    expect(quote('a6', 20).unit).toBe(170);
    expect(defaultSelection(notebook).options.cover).toBe('front');
  });

  test('таблица, минимальная цена и ступени отражают тот же расчёт', () => {
    expect(notebook.fromPrice).toBe(170);
    expect(notebook.table?.columns).toEqual(['10–30 шт']);
    const cells = notebook.table!.rows.flatMap((row) => row.cells);
    for (const price of [200, 170, 230, 195.5]) expect(cells).toContain(rub(price));
    const selection = defaultSelection(notebook);
    selection.options.variant = 'a6';
    selection.options.cover = 'both';
    expect(notebook.ladder?.(selection)).toEqual([{ from: 10, price: 195.5 }]);
  });

  test('30 чистых листов; печать внутри не получает выдуманную автоматическую цену', () => {
    expect(notebook.short).toContain('30');
    expect(quote('a5', 10).notes.join(' ')).toMatch(/30.*чист/);
    expect(quote('a5', 10).notes.join(' ')).toMatch(/Печать внутри.*индивидуально/);
    expect(notebook.options?.map((group) => group.id)).toEqual(['variant', 'cover']);
  });
});
