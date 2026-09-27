/*
 * SPDX-FileCopyrightText: Copyright Corsinvest Srl
 * SPDX-License-Identifier: MIT
 *
 * Starlight route middleware for the home page (a page with a hero): sets the install-and-run panel
 * as hero image when the page has none, and the cv4pve-admin banner when the page has none.
 * Both are standard Starlight route data (hero.image.html, banner.content).
 */

import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import config from 'virtual:cv4pve-docs-theme/config';
import { installPanelHtml } from './install-panel.js';

const ADMIN_DOCS = 'https://corsinvest.github.io/cv4pve-admin/modules/';

export const onRequest = defineRouteMiddleware((context) => {
  const data = context.locals.starlightRoute.entry.data;
  if (!data.hero) return;

  if (config.install && !data.hero.image) {
    data.hero.image = { html: installPanelHtml(config.repo, config.install) };
  }

  if (config.admin?.module && !data.banner) {
    const href = ADMIN_DOCS + encodeURIComponent(config.admin.module) + '/';
    data.banner = {
      content: `Prefer a web interface with scheduled runs? <a href="${href}" target="_blank" rel="noopener noreferrer">${config.repo} also runs inside cv4pve-admin →</a>`,
    };
  }
});
