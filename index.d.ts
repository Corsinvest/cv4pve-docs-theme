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

export interface CorsinvestThemeOptions {
  /** GitHub repository name under github.com/Corsinvest, e.g. `cv4pve-diag`. */
  repo: string;
  /** Branch the "Edit page" links point to. Default `master`. */
  branch?: string;
  /** Folder of the Starlight project inside the repository. Default `docs`. */
  docsPath?: string;
  /** Product icon, paths under the site's `public/` folder: favicon and icon before the product name. */
  icon?: { light: string; dark?: string };
  /** cv4pve-admin module running the same engine: banner on the home page. */
  admin?: { module: string };
  /** Install-and-run panel in the home hero. */
  install?: InstallPanelOptions;
  /** Matomo instance and site ID: page views and outbound links, without cookies. */
  matomo?: { url: string; siteId: number };
}

/** Starlight plugin with the Corsinvest look and the settings shared by every cv4pve documentation site. */
export default function corsinvestTheme(options: CorsinvestThemeOptions): StarlightPlugin;
