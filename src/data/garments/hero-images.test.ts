import { join } from 'node:path';
import { expect, test } from 'vitest';
import { imageSize } from '../../lib/pic';
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

const pages = { tshirt, hoodie, shopper, cap, workwear, sport, sublimation, transfers, mugs, badges, stickers };
const file = (name: string) => join(process.cwd(), 'public/img/v3', `${name}.webp`);

// the first-screen cats are tight cut-outs: the sizes in the data must match the files, or HeroArt reserves a wrong box
test.each(Object.entries(pages))('кот первого экрана %s: файлы есть, размеры совпадают', (_, page) => {
  const { hero, heroSize, heroMobile, heroMobileSize } = page.images;
  expect(imageSize(file(hero))).toEqual(heroSize);
  expect(imageSize(file(heroMobile))).toEqual(heroMobileSize);
});
