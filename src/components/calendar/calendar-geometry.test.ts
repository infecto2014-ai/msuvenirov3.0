import { expect, test } from 'vitest';
import { buildLayout, monthArt } from './calendar-geometry';
import { calendarModels } from '@/data/garments/calendars';
import { applyPreset } from '@/lib/calc-preset';
import { defaultSelection, findProduct } from '@/data/pricing';

test('пять моделей сохраняют размеры поставщика и количество рекламных полей', () => {
  for (const m of calendarModels) {
    const layout = buildLayout(m.id);
    expect([layout.width, layout.height]).toEqual([m.width, m.height]);
    expect(layout.ads).toHaveLength(m.fields);
  }
});

test('сетка января 2027: 31 день, 1 января — пятница, неделя начинается с понедельника', () => {
  const month = monthArt({x:0,y:0,w:140,h:120},2027,0,'c');
  expect(month.cells.filter(c=>c.cur)).toHaveLength(31);
  expect(month.weekdays.map(d=>d.t)).toEqual(['пн','вт','ср','чт','пт','сб','вс']);
  expect(month.cells.findIndex(c=>c.cur&&c.d===1)).toBe(4);
});

test('пресет подгиба сохраняет массив; трио не оформляется по фиксированной цене за пределами 200', () => {
  const product=findProduct('calendars','cal-quarterly')!;
  const preset=applyPreset(product,{qty:300,options:{model:'trio',fold:['fold']}});
  expect(preset.qty).toBe(200);
  expect(preset.options.fold).toEqual(['fold']);
  expect(product.qtyFor!(preset).individualAbove).toBe(true);
  expect(product.quote({...preset,qty:201}).error).toContain('индивидуальный');
  const plain=applyPreset(product,{qty:100,options:{model:'midi3'}});
  const gold=applyPreset(product,{qty:100,options:{model:'midi3',strip:'gold',fold:['fold','unknown']}});
  expect(gold.options.fold).toEqual(['fold']);
  expect(product.quote(gold).unit-product.quote(plain).unit).toBe(170);
  expect(product.qtyFor!(defaultSelection(product)).max).toBe(5000);
});
