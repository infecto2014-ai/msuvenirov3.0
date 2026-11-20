import { expect, test } from 'vitest';
import { calendarAnatomy, calendarFoldPrice, calendarModels, calendarOthers, calendarPocketQuote, calendarPresetQuote, calendars } from './calendars';
import { findProduct } from '../pricing';
import { presetPrice } from './select';

const category = calendars.calc.category;

test('квартальные модели, изделия и пресеты соответствуют источнику и прайсу', () => {
  expect(calendarModels).toHaveLength(5);
  expect(calendarOthers).toHaveLength(4);
  expect(calendars.calc.tiles.map((tile) => tile.product)).toEqual(['cal-quarterly', 'cal-wall', 'cal-desk', 'cal-pocket']);
  expect(calendars.prices.products.map((item) => item.id)).toEqual(calendars.calc.tiles.map((tile) => tile.product));
  expect(calendars.prices.products.every(({ id }) => findProduct(category, id)?.table)).toBe(true);
  expect(calendars.presets).toHaveLength(4);
  for (const preset of calendars.presets) {
    expect(calendarPresetQuote(preset).unit).toBeGreaterThan(0);
    const quote = calendarPresetQuote(preset);
    expect(presetPrice(preset, category)).toEqual({ unit: quote.unit, total: quote.total });
    expect(preset.pic).toBeUndefined();
    expect(preset.art?.kind).toBe('calendar');
  }
  const folded = calendars.presets[3];
  expect(folded.options).toMatchObject({ strip: 'gold', fold: ['fold'] });
  expect(calendarPresetQuote(folded).unit - calendarPresetQuote({ ...folded, options: { model: 'midi3', strip: 'gold' } }).unit).toBe(40);
  expect(calendarFoldPrice()).toBe(40);
});

test('трио ограничено 200 штуками, карманные считаются целыми тиражами', () => {
  const trio = findProduct(category, 'cal-quarterly')!;
  const selection = { options: { model: 'trio', strip: 'none', fold: [] }, dims: {}, qty: 201 };
  expect(trio.quote(selection).notes.join(' ')).toMatch(/больше 200/);
  expect(calendarPocketQuote(100)).toMatchObject({ total: 625 });
  expect(calendarPocketQuote(200)).toMatchObject({ total: 1170 });
  expect(calendarPocketQuote(300)).toMatchObject({ total: 1795 });
  expect(calendarPocketQuote(500)).toMatchObject({ total: 2185 });
  expect(calendarPocketQuote(1000)).toMatchObject({ total: 4055 });
  expect(calendarPocketQuote(10000)).toMatchObject({ total: 17160 });
  expect(calendarPocketQuote(300).total).not.toBe(calendarPocketQuote(300).unit * 300);
  expect(findProduct(category, 'cal-pocket')!.table?.columns).toEqual(['Цена за тираж']);
});

test('страница использует данные и схему 2027 года из источника', () => {
  expect(calendars.slug).toBe('/kalendari');
  expect(calendars.accent).toBe('на 2027 год');
  expect(calendars.faq).toHaveLength(13);
  expect(calendarAnatomy).toHaveLength(5);
  expect(calendars.description).toContain('2027 год');
  expect(calendars.extra?.find((section) => section.id === 'layout')?.cards[0].points?.join(' ')).toContain('2027 год');
  expect(calendars.images.hero).toBe('calendar-hero');
  expect(calendars.images.heroMobile).toBe('calendar-hero-mobile');
});
