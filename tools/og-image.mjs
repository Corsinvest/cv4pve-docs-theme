/*
 * SPDX-FileCopyrightText: Copyright Corsinvest Srl
 * SPDX-License-Identifier: MIT
 *
 * Writes the social card of a documentation site, `public/og.png` (1200x630): the image shown when
 * a page is shared. Run it from the `docs` folder of the site, and again when the home page changes:
 *
 *   node node_modules/@corsinvest/cv4pve-docs-theme/tools/og-image.mjs
 *
 * Nothing to configure. The texts are those of the home page (`src/content/docs/index.mdx`): the
 * product name (`title`), the hero title, with its accent words in the accent colour, and the
 * `description`. The icon is `public/icon-dark.svg`, or `public/icon.svg`.
 * `sharp` and `js-yaml` are the ones Astro installs in the site.
 */

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const WIDTH = 1200;
const HEIGHT = 630;
const LEFT = 84;
// The text column ends before the icon.
const TEXT_WIDTH = 700;
const FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const COLOR = { back: '#0d1f31', glow: '#2a6fae', name: '#a9cbef', title: '#ffffff', accent: '#6cb4f5', text: '#c3d2e1', muted: '#8fa6bd' };

const site = process.cwd();
const home = join(site, 'src', 'content', 'docs', 'index.mdx');
if (!existsSync(home)) fail(`no home page at ${home}: run this from the "docs" folder of a site`);

// Resolved from the site, where Astro installs them: the theme does not depend on them.
const siteRequire = createRequire(join(site, 'package.json'));
const sharp = siteRequire('sharp');
const yaml = siteRequire('js-yaml');

const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(home, 'utf8'));
if (!frontmatter) fail(`no frontmatter in ${home}`);
const data = yaml.load(frontmatter[1]);
if (!data.title || !data.hero?.title || !data.description) fail('the home page needs "title", "hero.title" and "description"');

const icon = ['icon-dark.svg', 'icon.svg'].map((name) => join(site, 'public', name)).find((file) => existsSync(file));
const wordmark = fileURLToPath(new URL('../assets/corsinvest-wordmark-white.svg', import.meta.url));

const description = wrap(plainWords(data.description), 29, 0.5);

// Headline: the biggest size at which it takes three lines at most and the block of texts, name
// and description included, fits above the signature with some air.
const words = headlineWords(data.hero.title);
const blockHeightAt = (/** @type {number} */ fontSize, /** @type {number} */ count) =>
  34 + 30 + count * Math.round(fontSize * 1.14) + 22 + description.length * 42;
let size = 0;
let lines = [];
for (size of [76, 66, 58, 50, 44]) {
  lines = wrap(words, size, 0.56);
  if (lines.length <= 3 && blockHeightAt(size, lines.length) <= HEIGHT - 170) break;
}

// The block of texts is centred in the height left above the signature.
const lineHeight = Math.round(size * 1.14);
const blockHeight = blockHeightAt(size, lines.length);
let y = Math.max(50, Math.round((HEIGHT - 90 - blockHeight) / 2) + 34);

const parts = [];
parts.push(text(LEFT, y, 34, 600, COLOR.name, [{ text: data.title }]));
y += 30;
for (const line of lines) {
  y += lineHeight;
  parts.push(text(LEFT, y - Math.round(size * 0.2), size, 700, COLOR.title, line));
}
y += 22;
for (const line of description) {
  y += 42;
  parts.push(text(LEFT, y - 10, 29, 400, COLOR.text, line));
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="glow" cx="80%" cy="46%" r="46%">
      <stop offset="0" stop-color="${COLOR.glow}" stop-opacity="0.42"/>
      <stop offset="1" stop-color="${COLOR.glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${COLOR.back}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
  ${icon ? `<circle cx="965" cy="290" r="164" fill="none" stroke="#7db2e8" stroke-opacity="0.22" stroke-width="2"/>
  <image x="825" y="150" width="280" height="280" href="${dataUri(icon)}"/>` : ''}
  ${parts.join('\n  ')}
  <image x="${LEFT}" y="${HEIGHT - 78}" width="154" height="32" href="${dataUri(wordmark)}"/>
  <text x="${LEFT + 176}" y="${HEIGHT - 54}" font-family="${FONT}" font-size="22" fill="${COLOR.muted}">Part of the cv4pve suite</text>
</svg>`;

const out = join(site, 'public', 'og.png');
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
console.log(`${resolve(out)}  ${lines.length} title line(s) at ${size}px, ${description.length} description line(s)`);

/**
 * Words of the hero title; those inside a tag (the accent span) are marked.
 * @param {string} html
 */
function headlineWords(html) {
  const words = [];
  for (const piece of html.split(/(<[^>]+>[^<]*<\/[^>]+>)/)) {
    // The accent words stay on one line: "Proxmox VE" is not split.
    if (piece.startsWith('<')) words.push({ text: piece.replace(/<[^>]+>/g, '').trim(), accent: true });
    else words.push(...plainWords(piece));
  }
  return words;
}

/** @param {string} value */
function plainWords(value) {
  return value.split(/\s+/).filter(Boolean).map((word) => ({ text: word, accent: false }));
}

/**
 * Lines of words that fit the text column. The width of a word is estimated from the number of its
 * characters: `ratio` is the average character width for the font weight, as a part of the size.
 * @param {{ text: string, accent: boolean }[]} words
 * @param {number} fontSize
 * @param {number} ratio
 */
function wrap(words, fontSize, ratio) {
  const max = Math.floor(TEXT_WIDTH / (fontSize * ratio));
  const lines = [];
  let line = [];
  let length = 0;
  for (const word of words) {
    if (line.length && length + 1 + word.text.length > max) {
      lines.push(line);
      line = [];
      length = 0;
    }
    length += (line.length ? 1 : 0) + word.text.length;
    line.push(word);
  }
  if (line.length) lines.push(line);
  return lines;
}

/**
 * One line of text; the accent words in the accent colour.
 * @param {number} x @param {number} y @param {number} fontSize @param {number} weight
 * @param {string} fill @param {{ text: string, accent?: boolean }[]} words
 */
function text(x, y, fontSize, weight, fill, words) {
  const spans = words.map((word, index) =>
    `<tspan${word.accent ? ` fill="${COLOR.accent}"` : ''}>${index ? ' ' : ''}${escape(word.text)}</tspan>`);
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${fontSize}" font-weight="${weight}" fill="${fill}" xml:space="preserve">${spans.join('')}</text>`;
}

/** @param {string} value */
function escape(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** @param {string} file */
function dataUri(file) {
  return `data:image/svg+xml;base64,${readFileSync(file).toString('base64')}`;
}

/** @param {string} message @returns {never} */
function fail(message) {
  console.error(`og-image: ${message}`);
  process.exit(1);
}
