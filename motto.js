/*
 * SPDX-FileCopyrightText: Copyright Corsinvest Srl
 * SPDX-License-Identifier: MIT
 *
 * The motto of the cv4pve suite, in one place: under the hero of the home page (Motto.astro) and in
 * the footer of every other page (Footer.astro).
 *
 * "By sysadmins, for sysadmins.": the tools are made by people who run Proxmox VE clusters, for
 * people who do the same. On the sites of the API libraries the reader is a developer, so the motto
 * is "By developers, for developers." (the `audience` option of the theme). The same word on both
 * sides: the motto works on that symmetry ("By sysadmins, for developers." was tried and read as
 * half a sentence).
 */

/** @typedef {'sysadmins' | 'developers'} Audience */

/** @param {Audience} [audience] Who the site is for. Default `sysadmins`. */
export const mottoText = (audience = 'sysadmins') => `By ${audience}, for ${audience}.`;
