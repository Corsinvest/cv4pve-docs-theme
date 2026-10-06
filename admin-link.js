/*
 * SPDX-FileCopyrightText: Copyright Corsinvest Srl
 * SPDX-License-Identifier: MIT
 *
 * The way on to cv4pve-admin, for a tool whose engine also runs inside it as a module (the `admin`
 * option of the theme): the label, the address and the cv4pve-admin icon of the button the theme adds
 * to the hero of the home page (route-middleware.js).
 *
 * Starlight takes a hero button as data (text, link, icon as an inline SVG string), not as a
 * component, so the pieces are built here as values.
 */

const ADMIN_DOCS = 'https://corsinvest.github.io/cv4pve-admin/modules/';

/** Text of the button. */
export const ADMIN_LINK_LABEL = 'Web interface (cv4pve-admin)';

/** Documentation page of a cv4pve-admin module. @param {string} module e.g. `diagnostics` */
export const adminModuleUrl = (module) => ADMIN_DOCS + encodeURIComponent(module) + '/';

/**
 * The cv4pve-admin icon (the one of its documentation site), as an inline SVG. The colours come from
 * custom properties set in styles/brand.css, brighter on the dark theme; the fallbacks are those of
 * the light theme. The gradient ids are prefixed: ids are global in a page.
 */
export const ADMIN_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="32 24 960 960" width="24" height="24" aria-hidden="true">' +
  '<defs>' +
  '<linearGradient id="cv-admin-a" x1="0" y1="0" x2="0" y2="1">' +
  '<stop offset="0" style="stop-color:var(--cv-admin-icon-1,#4ab4ec)"/>' +
  '<stop offset="1" style="stop-color:var(--cv-admin-icon-2,#2f92dc)"/>' +
  '</linearGradient>' +
  '<linearGradient id="cv-admin-b" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" style="stop-color:var(--cv-admin-icon-3,#2565b0)"/>' +
  '<stop offset="1" style="stop-color:var(--cv-admin-icon-4,#174384)"/>' +
  '</linearGradient>' +
  '</defs>' +
  '<path fill="url(#cv-admin-a)" d="M325 160 512 55l396 228-200 149v-56L512 265 325 370zM110 283l167-95v387L110 675z"/>' +
  '<path fill="url(#cv-admin-b)" d="M110 675l167-100v18l235 134 196-115V487l204-157v395L512 952 110 725z"/>' +
  '</svg>';

/** Attributes of the link: cv4pve-admin has its own site, so it opens in a new tab. */
export const ADMIN_LINK_ATTRS = { target: '_blank', rel: 'noopener noreferrer' };
