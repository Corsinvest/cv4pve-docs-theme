/*
 * SPDX-FileCopyrightText: Copyright Corsinvest Srl
 * SPDX-License-Identifier: MIT
 *
 * Install-and-run panel for the hero of a cv4pve home page: a terminal frame with one block per
 * install target (Linux, macOS, Windows, Docker, …), a picker when there is more than one, and an
 * optional sample of the output. The visitor's OS is selected when it is one of the targets.
 *
 * Starlight takes the hero image only as an HTML string, so the panel is built here as a string and
 * set by the theme's route middleware (see route-middleware.js).
 */

import { icons } from './icons.js';

/**
 * @typedef {'linux' | 'macos' | 'windows'} PresetTarget
 * Standard cv4pve release channels, derived from the repository name:
 * GitHub release zip (Linux), Homebrew tap (macOS), WinGet (Windows).
 *
 * @typedef {object} CustomTarget
 * @property {string} id Unique id, e.g. `docker`.
 * @property {string} label Button label.
 * @property {'linux' | 'macos' | 'windows' | 'docker'} [icon]
 * @property {string[]} lines Lines to show. `# …` is a comment; a command spanning several lines
 *   is one string with `\n`, only its first line gets the prompt.
 *
 * @typedef {object} InstallPanelOptions
 * @property {(PresetTarget | CustomTarget)[]} targets In button order.
 * @property {string[]} [run] Arguments of the run command, one per line, for the preset targets,
 *   e.g. `['--host=pve01', "--api-token='diag@pve!audit=…'", 'execute']`.
 * @property {string} [winget] WinGet id. Default `Corsinvest.cv4pve.<name>`.
 * @property {{ text: string, tone?: 'critical' | 'warning' | 'info' | 'ok' }[]} [output]
 *   A sample of the output shown under the commands, e.g. a findings summary.
 */

const LABELS = { linux: 'Linux', macos: 'macOS', windows: 'Windows', docker: 'Docker' };

/** @param {string} s */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The install targets with the lines to show, the preset ones written out. Used by the hero panel
 * below.
 * @param {string} repo Repository name, e.g. `cv4pve-diag`, also the binary and package name.
 * @param {Pick<InstallPanelOptions, 'targets' | 'run' | 'winget'>} options
 * @returns {CustomTarget[]}
 */
export function installTargets(repo, options) {
  const name = repo.replace(/^cv4pve-/, '');
  const run = options.run ?? [];
  return options.targets.map((t) => (typeof t === 'string' ? preset(t) : t));

  /** @param {PresetTarget} id */
  function preset(id) {
    const cont = id === 'windows' ? ' `' : ' \\';
    // First argument on the command line, the others indented on continuation lines.
    const runCmd = (/** @type {string} */ bin) =>
      [run.length ? `${bin} ${run[0]}` : bin, ...run.slice(1)]
        .map((part, i, all) => (i === 0 ? '' : '    ') + part + (i < all.length - 1 ? cont : ''))
        .join('\n');
    if (id === 'linux') {
      return {
        id, label: LABELS.linux, icon: 'linux',
        lines: [
          '# install (x64; arm64 on the Releases page)',
          `wget https://github.com/Corsinvest/\\\n${repo}/releases/latest/download/\\\n${repo}-linux-x64.zip`,
          `unzip ${repo}-linux-x64.zip`,
          `chmod +x ${repo}`,
          '',
          '# run against any node',
          runCmd(`./${repo}`),
        ],
      };
    }
    if (id === 'macos') {
      return {
        id, label: LABELS.macos, icon: 'macos',
        lines: ['# install', `brew install corsinvest/tap/${repo}`, '', '# run against any node', runCmd(repo)],
      };
    }
    return {
      id, label: LABELS.windows, icon: 'windows',
      lines: ['# install', `winget install ${options.winget ?? `Corsinvest.cv4pve.${name}`}`, '', '# run against any node', runCmd(repo)],
    };
  }
}

/**
 * @param {string} repo Repository name, e.g. `cv4pve-diag`, also the binary and package name.
 * @param {InstallPanelOptions} options
 */
export function installPanelHtml(repo, options) {
  const targets = installTargets(repo, options);
  if (targets.length === 0) return '';

  const prompt = (/** @type {string} */ id) => (id === 'windows' ? 'PS&gt;' : '$');
  const block = (/** @type {CustomTarget} */ t, /** @type {number} */ i) => {
    const body = t.lines
      .map((line) => {
        if (line === '') return '';
        if (line.startsWith('#')) return `<span class="c">${esc(line)}</span>`;
        return `<span class="p">${prompt(t.id)}</span> ${esc(line)}`;
      })
      .join('\n');
    return `<pre data-target="${esc(t.id)}"${i === 0 ? '' : ' hidden'}>${body}</pre>`;
  };

  const svg = (/** @type {string | undefined} */ icon) =>
    icon && icons[icon] ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">${icons[icon]}</svg>` : '';
  const buttons = targets.length > 1
    ? `<div class="cv-os" role="group" aria-label="Install on">${targets
        .map((t, i) => `<button type="button" data-pick="${esc(t.id)}" aria-pressed="${i === 0}">${svg(t.icon)}${esc(t.label)}</button>`)
        .join('')}</div>`
    : '';

  const output = options.output?.length
    ? `<pre class="cv-sum">${options.output.map((o) => `<span class="${o.tone ?? ''}">${esc(o.text)}</span>`).join('  ')}</pre>`
    : '';

  // Picks the visitor's OS when offered (Docker is never guessed), else keeps the first target.
  const script = `<script>(() => {
  const box = document.currentScript.parentElement;
  const show = (id) => {
    box.querySelectorAll('pre[data-target]').forEach((p) => { p.hidden = p.dataset.target !== id; });
    box.querySelectorAll('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pick === id)));
  };
  const p = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '').toLowerCase();
  const os = p.includes('win') ? 'windows' : /mac|iphone|ipad/.test(p) ? 'macos' : 'linux';
  if (box.querySelector('pre[data-target="' + os + '"]')) show(os);
  box.querySelectorAll('[data-pick]').forEach((b) => b.addEventListener('click', () => show(b.dataset.pick)));
})();</script>`;

  return `<div class="cv-hero-term" aria-label="Install and run ${esc(repo)}">`
    + (buttons ? `<div class="cv-hero-term-bar">${buttons}</div>` : '')
    + targets.map(block).join('')
    + output
    + script
    + '</div>';
}
