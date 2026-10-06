/*
 * SPDX-FileCopyrightText: Copyright Corsinvest Srl
 * SPDX-License-Identifier: MIT
 *
 * Steps panel for the hero of a cv4pve home page: a short title and the numbered steps from nothing
 * to a first result, with a link to the page that explains them. It says how little it takes; the
 * commands themselves are in the page, in code blocks that can be copied.
 *
 * Starlight takes the hero image only as an HTML string, so the panel is built here as a string and
 * set by the theme's route middleware (see route-middleware.js). Styles are in styles/brand.css.
 */

/**
 * @typedef {object} StepsPanelOptions
 * @property {(string | { text: string, href: string })[]} items The steps, in order: three or
 *   four short lines. Text between backticks is shown as code, e.g.
 *   'Open `http://<server-ip>:8080`'. A step with `href` (relative to the home page) links to the
 *   page that explains it: for the step the commands in the page do not cover.
 * @property {string} [title] Start of the title. Default `Up and running in`.
 * @property {string} [highlight] End of the title, in the accent colour. Default: the number
 *   of steps, e.g. `4 steps`.
 * @property {{ text: string, href: string }} [link] Link under the steps. `href` is relative to
 *   the home page. Default: "Step by step in Getting Started →", `getting-started/`.
 */

/** @param {string} s */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Escaped text, with `code` spans. @param {string} s */
const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');

/** A step: its text, linked when it has an address. @param {StepsPanelOptions['items'][number]} item */
const step = (item) =>
  typeof item === 'string' ? inline(item) : `<a href="${esc(item.href)}">${inline(item.text)}</a>`;

/** @param {StepsPanelOptions} options */
export function stepsPanelHtml(options) {
  const items = options.items ?? [];
  if (items.length === 0) return '';
  const title = options.title ?? 'Up and running in';
  const highlight = options.highlight ?? `${items.length} steps`;
  const link = options.link ?? { text: 'Step by step in Getting Started →', href: 'getting-started/' };

  return '<div class="cv-steps">'
    + `<p class="cv-steps-title">${esc(title)} <strong>${esc(highlight)}</strong></p>`
    + `<ol>${items.map((item) => `<li><span>${step(item)}</span></li>`).join('')}</ol>`
    + `<a href="${esc(link.href)}">${esc(link.text)}</a>`
    + '</div>';
}
