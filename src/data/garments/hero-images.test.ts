import { join } from 'node:path';
import { expect, test } from 'vitest';
import { imageSize, resolvePic } from '../../lib/pic';
import { tshirt } from './tshirt';
import { hoodie } from './hoodie';
import { shopper } from './shopper';
import { cap } from './cap';
import { workwear } from './workwear';
import { sport } from './sport';
import { sublimation } from './sublimation';
import { transfers } from './transfers';
import { mugs } from './mugs';
import { badges } from './badges';
import { stickers } from './stickers';
import { calendars } from './calendars';
import { notebooks } from './notebooks';

const pages = { tshirt, hoodie, shopper, cap, workwear, sport, sublimation, transfers, mugs, badges, stickers, calendars, notebooks };
const file = (name: string) => {
  const pic = resolvePic(name);
  if (!('src' in pic)) throw new Error(`Missing hero image: ${name}`);
  return join(process.cwd(), 'public', pic.src);
};

// The composition dimensions in data must match the selected PNG, so layout space stays correct.
test.each(Object.entries(pages))('изображение первого экрана %s: файлы есть, размеры совпадают', (_, page) => {
  const { hero, heroSize, heroMobile, heroMobileSize } = page.images;
  expect(imageSize(file(hero))).toEqual(heroSize);
  expect(imageSize(file(heroMobile))).toEqual(heroMobileSize);
});
