/*
 * SPDX-FileCopyrightText: Copyright Corsinvest Srl
 * SPDX-License-Identifier: MIT
 */

import type { StarlightPlugin } from '@astrojs/starlight/types';

/** Standard cv4pve release channels, derived from the repository name. */
export type InstallPresetTarget = 'linux' | 'macos' | 'windows';

export interface InstallCustomTarget {
  /** Unique id, e.g. `docker`. */
  id: string;
  /** Button label. */
  label: string;
  icon?: 'linux' | 'macos' | 'windows' | 'docker';
  /** Lines to show. `# …` is a comment; a multi-line command is one string with `\n`. */
  lines: string[];
}

export interface InstallPanelOptions {
  /** Install targets, in button order. */
  targets: (InstallPresetTarget | InstallCustomTarget)[];
  /** Arguments of the run command, one per line, for the preset targets. */
  run?: string[];
  /** WinGet id. Default `Corsinvest.cv4pve.<name>`. */
  winget?: string;
  /** A sample of the output shown under the commands. */
  output?: { text: string; tone?: 'critical' | 'warning' | 'info' | 'ok' }[];
}

export interface StepsPanelOptions {
  /**
   * The steps, in order: three or four short lines. Text between backticks is shown as code.
   * A step with `href` (relative to the home page) links to the page that explains it.
   */
  items: (string | { text: string; href: string })[];
  /** Start of the title. Default `Up and running in`. */
  title?: string;
  /** End of the title, in the accent colour. Default: the number of steps, e.g. `4 steps`. */
  highlight?: string;
  /** Link under the steps, `href` relative to the home page. Default: Getting Started. */
  link?: { text: string; href: string };
}

export interface CorsinvestThemeOptions {
  /** GitHub repository name under github.com/Corsinvest, e.g. `cv4pve-diag`. */
  repo: string;
  /** No longer used: the theme sets no "Edit page" link. Accepted so that sites passing it still build. */
  branch?: string;
  /** No longer used, as `branch`. */
  docsPath?: string;
  /** Product icon, paths under the site's `public/` folder: favicon and icon before the product name. */
  icon?: { light: string; dark?: string };
  /** cv4pve-admin module running the same engine: a button to it in the home hero. */
  admin?: { module: string };
  /** Steps panel in the home hero: the numbered steps to a first result. */
  steps?: StepsPanelOptions;
  /** Install-and-run panel in the home hero, used when `steps` is not set. */
  install?: InstallPanelOptions;
  /**
   * Who the site is for: the word of the motto ("By sysadmins, for sysadmins."). Default `sysadmins`;
   * `developers` on the sites of the API libraries.
   */
  audience?: 'sysadmins' | 'developers';
  /** Matomo instance and site ID: page views and outbound links, without cookies. */
  matomo?: { url: string; siteId: number };
}

/** Starlight plugin with the Corsinvest look and the settings shared by every cv4pve documentation site. */
export default function corsinvestTheme(options: CorsinvestThemeOptions): StarlightPlugin;
