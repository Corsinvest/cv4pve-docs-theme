/*
 * SPDX-FileCopyrightText: Copyright Corsinvest Srl
 * SPDX-License-Identifier: MIT
 *
 * Starlight route middleware for the home page (a page with a hero): sets the side panel as hero
 * image when the page has none (the steps panel, or the older install-and-run panel), and adds the
 * button to cv4pve-admin to the hero when the tool also runs inside it (the `admin` option).
 * Standard Starlight route data (hero.image.html, hero.actions).
 */

import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import config from 'virtual:cv4pve-docs-theme/config';
import { ADMIN_ICON_SVG, ADMIN_LINK_ATTRS, ADMIN_LINK_LABEL, adminModuleUrl } from './admin-link.js';
import { installPanelHtml } from './install-panel.js';
import { stepsPanelHtml } from './steps-panel.js';

export const onRequest = defineRouteMiddleware((context) => {
  const data = context.locals.starlightRoute.entry.data;
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
