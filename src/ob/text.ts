import * as _ from 'lodash';
import * as pag from 'pag';
import * as ob from './index';

let dotPatterns;
let charToIndex;
let context: CanvasRenderingContext2D;

export function init(_context: CanvasRenderingContext2D) {
  context = _context;
  const letterCount = 66;
  const letterPatterns = [
    0x4644AAA4, 0x6F2496E4, 0xF5646949, 0x167871F4, 0x2489F697,
    0xE9669696, 0x79F99668, 0x91967979, 0x1F799976, 0x1171FF17,
    0xF99ED196, 0xEE444E99, 0x53592544, 0xF9F11119, 0x9DDB9999,
    0x79769996, 0x7ED99611, 0x861E9979, 0x994444E7, 0x46699699,
    0x6996FD99, 0xF4469999, 0x2224F248, 0x26244424, 0x64446622,
    0x84284248, 0x40F0F024, 0x0F0044E4, 0x480A4E40, 0x9A459124,
    0x000A5A16, 0x640444F0, 0x80004049, 0x40400004, 0x44444040,
    0x0AA00044, 0x6476E400, 0xFAFA61D9, 0xE44E4EAA, 0x24F42445,
    0xF244E544, 0x00000042
  ];
  let p = 0;
  let d = 32;
  let pIndex = 0;
  dotPatterns = [];
  for (let i = 0; i < letterCount; i++) {
    let dots = [];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 4; x++) {
        if (++d >= 32) {
          p = letterPatterns[pIndex++];
          d = 0;
        }
        if ((p & 1) > 0) {
          dots.push({ x, y });
        }
        p >>= 1;
      }
    }
    dotPatterns.push(dots);
  }
  const charStr = "()[]<>=+-*/%&_!?,.:|'\"$@#\\urdl";
  charToIndex = [];
  for (let c = 0; c < 128; c++) {
    let li = -2;
    if (c == 32) {
      li = -1;
    } else if (c >= 48 && c < 58) {
      li = c - 48;
    } else if (c >= 65 && c < 90) {
      li = c - 65 + 10;
    } else {
      const ci = charStr.indexOf(String.fromCharCode(c));
      if (ci >= 0) {
        li = ci + 36;
      }
    }
    charToIndex.push(li);
  }
}

export enum Align {
  left, right
}

export function draw(str: string, x: number, y: number, align: Align = null) {
  context.fillStyle = 'white';
  if (align === Align.left) {
  } else if (align === Align.right) {
    x -= str.length * 5;
  } else {
    x -= str.length * 5 / 2;
  }
  x = Math.floor(x);
  y = Math.floor(y);
  for (let i = 0; i < str.length; i++) {
    const idx = charToIndex[str.charCodeAt(i)];
    if (idx === -2) {
      throw `invalid char: ${str.charAt(i)}`;
    } else if (idx >= 0) {
      drawLetter(idx, x, y);
    }
    x += 5;
  }
}

function drawLetter(idx: number, x: number, y: number) {
  const p = dotPatterns[idx];
  for (let i = 0; i < p.length; i++) {
    const d = p[i];
    context.fillRect(d.x + x, d.y + y, 1, 1);
  }
}

let textPixels = {};

export function drawScaled
  (str: string, scale: number, x: number, y: number) {
  const pixels = generatePixels(str, scale);
  pag.draw(ob.screen.context, pixels, x, y, 0);
}

function generatePixels(str: string, scale: number) {
  if (textPixels.hasOwnProperty(`${str}_${scale}`)) {
    return textPixels[`${str}_${scale}`];
  }
  const pixelArray = _.times(Math.ceil(5 * scale), () =>
    _.times(Math.ceil(5 * str.length * scale), () => ' '));
  _.times(str.length, i => {
    const idx = charToIndex[str.charCodeAt(i)];
    if (idx === -2) {
      throw `invalid char: ${str.charAt(i)}`;
    } else if (idx >= 0) {
      drawToPixelArray(pixelArray, idx, i * 5 * scale, scale);
    }
  });
  const paw = pixelArray[0].length;
  const pah = pixelArray.length;
  _.times(pah, y => {
    _.times(paw, x => {
      if (pixelArray[y][x] === 'x' && isEdgePixel(x, y, pixelArray, paw, pah)) {
        pixelArray[y][x] = 'o';
      }
    });
  });
  const pixels = pag.generate(_.map(pixelArray, line => line.join('')),
    { isMirrorY: false, scale: 1, rotationNum: 1, colorLighting: 0 });
  textPixels[`${str}_${scale}`] = pixels;
  return pixels;
}

function drawToPixelArray(pixelArray: string[][], idx: number, ox: number, scale: number) {
  const p = dotPatterns[idx];
  _.forEach(p, d => {
    for (let y = d.y * scale; y < (d.y + 1) * scale; y++) {
      for (let x = d.x * scale; x < (d.x + 1) * scale; x++) {
        pixelArray[Math.round(y)][Math.round(x + ox)] = 'x';
      }
    }
  });
}

function isEdgePixel(x: number, y: number, pixelArray: string[][], w: number, h: number) {
  if (x <= 0 || x >= w - 1 || y <= 0 || y >= h - 1) {
    return true;
  }
  const ofss = [1, 0, 1, 1, 0, 1, -1, 1, -1, 0, -1, -1, 0, -1, 1, -1];
  for (let i = 0; i < 8; i++) {
    if (pixelArray[y + ofss[i * 2 + 1]][x + ofss[i * 2]] === ' ') {
      return true;
    }
  }
  return false;
}
