/*
 * SPDX-FileCopyrightText: Copyright Corsinvest Srl
 * SPDX-License-Identifier: MIT
 *
 * Starlight route middleware. On every page: the `<title>` ends with what the product is (the
 * `titleSuffix` option) in place of the site name. On the home page (a page with a hero): sets the
 * side panel as hero image when the page has none (the steps panel, or the older install-and-run
 * panel), and adds the button to cv4pve-admin to the hero when the tool also runs inside it (the
 * `admin` option). Standard Starlight route data (head, hero.image.html, hero.actions).
 */

import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import config from 'virtual:cv4pve-docs-theme/config';
import { ADMIN_ICON_SVG, ADMIN_LINK_ATTRS, ADMIN_LINK_LABEL, adminModuleUrl } from './admin-link.js';
import { installPanelHtml } from './install-panel.js';
import { stepsPanelHtml } from './steps-panel.js';

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const data = route.entry.data;

  if (config.titleSuffix) setTitle(route.head, data, config.titleSuffix);
  if (!data.hero) return;

  if (!data.hero.image) {
    // The steps panel wins when a site sets both.
    const html = config.steps
      ? stepsPanelHtml(config.steps)
      : config.install
        ? installPanelHtml(config.repo, config.install)
        : '';
    if (html) data.hero.image = { html };
  }

  // Last, after the buttons about this tool, and in the `secondary` variant: with a border, so it
  // reads as something to click (the `minimal` variant, text and icon alone, did not). A page that
  // already links cv4pve-admin from its hero is left as it is.
  if (config.admin?.module) {
    const link = adminModuleUrl(config.admin.module);
    data.hero.actions ??= [];
    if (!data.hero.actions.some((action) => action.link.includes('/cv4pve-admin'))) {
      data.hero.actions.push({
        text: ADMIN_LINK_LABEL,
        link,
        variant: 'secondary',
        icon: { type: 'raw', html: ADMIN_ICON_SVG },
        attrs: { ...ADMIN_LINK_ATTRS, class: 'cv-admin-link' },
      });
    }
  }
});

/**
 * Writes "page title | suffix" in `<title>` and in `og:title`, each only when the page does not set
 * it in its own frontmatter (`head`): a title written by hand for a page wins.
 * @param {any[]} head Head entries of the page, as built by Starlight.
 * @param {any} data Frontmatter of the page.
 * @param {string} suffix
 */
function setTitle(head, data, suffix) {
  const own = data.head ?? [];
  const written = own.find((/** @type {any} */ entry) => entry.tag === 'title')?.content;
  // The social title follows the title of the page, also when that one is written by hand.
  const text = written ?? `${data.title} | ${suffix}`;
  if (!written) {
    const title = head.find((entry) => entry.tag === 'title');
    if (title) title.content = text;
  }
  if (!own.some((/** @type {any} */ entry) => entry.attrs?.property === 'og:title')) {
    const social = head.find((entry) => entry.attrs?.property === 'og:title');
    if (social) social.attrs.content = text;
  }
}
