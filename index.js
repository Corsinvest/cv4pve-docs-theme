/*
 * SPDX-FileCopyrightText: Copyright Corsinvest Srl
 * SPDX-License-Identifier: MIT
 */

import { isSatteriProcessor, satteri } from '@astrojs/markdown-satteri';

const PACKAGE = '@corsinvest/cv4pve-docs-theme';

/**
 * @typedef {object} CorsinvestThemeOptions
 * @property {string} repo GitHub repository name under github.com/Corsinvest, e.g. `cv4pve-diag`.
 * @property {string} [branch] Branch the "Edit page" links point to. Default `master`.
 * @property {string} [docsPath] Folder of the Starlight project inside the repository. Default `docs`.
 * @property {{ light: string, dark?: string }} [icon] Product icon, paths under the site's `public/`
 *   folder (e.g. `/icon.svg`): used as favicon and shown before the product name in the header.
 *   `dark` is used by the dark theme and by browsers in dark mode.
 * @property {{ module: string }} [admin] cv4pve-admin module that runs the same engine, e.g.
 *   `{ module: 'diagnostics' }`: the home page gets a banner linking to that module's docs.
 * @property {import('./install-panel.js').InstallPanelOptions} [install] Install-and-run panel shown
 *   in the hero of the home page (a page with a hero and no hero image).
 */

/**
 * Starlight plugin with the Corsinvest look and the settings shared by every cv4pve
 * documentation site: brand, logo, GitHub and "Edit page" links, the Corsinvest sidebar
 * group, and external links opening in a new tab.
 *
 * Only documented Starlight settings are touched and no component is overridden, so the
 * sites stay stock Starlight and upgrade with it.
 *
 * @param {CorsinvestThemeOptions} options
 * @returns {import('@astrojs/starlight/types').StarlightPlugin}
 */
export default function corsinvestTheme(options) {
  if (!options?.repo) throw new Error(`${PACKAGE}: the "repo" option is required, e.g. { repo: 'cv4pve-diag' }`);
  const { repo, branch = 'master', docsPath = 'docs', install, icon, admin } = options;

  return {
    name: PACKAGE,
    hooks: {
      'config:setup'({ config, updateConfig, addIntegration, addRouteMiddleware, astroConfig }) {
        const base = (astroConfig.base ?? '/').replace(/\/$/, '');
        updateConfig({
          ...(icon && {
            favicon: config.favicon && config.favicon !== '/favicon.svg' ? config.favicon : icon.light,
            head: [...(config.head ?? []), ...productIconHead(base, icon)],
          }),
          // A logo set by the site wins; otherwise the Corsinvest wordmark, as in the corsinvest.it header.
          logo: config.logo ?? {
            light: `${PACKAGE}/assets/corsinvest-wordmark.svg`,
            dark: `${PACKAGE}/assets/corsinvest-wordmark-white.svg`,
            alt: 'Corsinvest',
          },
          // Brand first, so the site's own CSS can override it.
          customCss: [`${PACKAGE}/styles/brand.css`, ...(config.customCss ?? [])],
          social: config.social?.length
            ? config.social
            : [{ icon: 'github', label: 'GitHub', href: `https://github.com/Corsinvest/${repo}` }],
          editLink: config.editLink?.baseUrl
            ? config.editLink
            : { baseUrl: `https://github.com/Corsinvest/${repo}/edit/${branch}/${docsPath}/` },
          sidebar: config.sidebar ? [...config.sidebar, corsinvestSidebarGroup()] : config.sidebar,
          // Shell blocks as plain code blocks, not terminal windows with the three decorative dots.
          // A frame set by the site, or per block (```bash frame="terminal"), still wins.
          ...(config.expressiveCode !== false && {
            expressiveCode: {
              ...(typeof config.expressiveCode === 'object' ? config.expressiveCode : {}),
              defaultProps: {
                frame: 'code',
                ...(typeof config.expressiveCode === 'object' ? config.expressiveCode.defaultProps : {}),
              },
            },
          }),
        });

        if (install || admin) addRouteMiddleware({ entrypoint: `${PACKAGE}/route-middleware` });

        addIntegration({
          name: `${PACKAGE}/external-links`,
          hooks: {
            'astro:config:setup'({ config: astroConfig, updateConfig: updateAstroConfig }) {
              // The route middleware reads the plugin options from this virtual module.
              updateAstroConfig({ vite: { plugins: [virtualConfig({ repo, install, admin })] } });

              const siteRoot = new URL(astroConfig.base ?? '/', astroConfig.site ?? 'http://localhost').href;
              const plugin = externalLinksInNewTab(siteRoot);
              const processor = astroConfig.markdown.processor;
              // Astro 7 renders Markdown with Sätteri, which ignores markdown.rehypePlugins.
              // Its options are read by reference, so adding the plugin to the existing
              // processor keeps any plugin the site configured itself.
              if (isSatteriProcessor(processor)) {
                processor.options.hastPlugins = [...(processor.options.hastPlugins ?? []), plugin];
              } else {
                updateAstroConfig({ markdown: { processor: satteri({ hastPlugins: [plugin] }) } });
              }
            },
          },
        });
      },
    },
  };
}

/**
 * Head entries for the product icon: a dark-mode favicon, and the icon before the product name in
 * the header — plain CSS on Starlight's site title, no component override.
 * @param {string} base Site base path without trailing slash.
 * @param {{ light: string, dark?: string }} icon
 */
function productIconHead(base, icon) {
  const url = (/** @type {string} */ p) => (/^https?:/.test(p) ? p : base + p);
  const light = url(icon.light);
  const dark = url(icon.dark ?? icon.light);
  const type = (/** @type {string} */ p) => (p.endsWith('.svg') ? 'image/svg+xml' : 'image/png');
  return [
    // Both variants with an explicit media query, so the choice does not depend on the order
    // Starlight writes its own favicon link in.
    ...(icon.dark
      ? [
          { tag: 'link', attrs: { rel: 'icon', href: light, type: type(light), media: '(prefers-color-scheme: light)' } },
          { tag: 'link', attrs: { rel: 'icon', href: dark, type: type(dark), media: '(prefers-color-scheme: dark)' } },
        ]
      : []),
    {
      tag: 'style',
      content:
        `.site-title img + span::before{content:'';display:inline-block;width:1.35rem;height:1.35rem;margin-right:.5rem;vertical-align:-.2rem;background:url("${light}") center/contain no-repeat}` +
        `:root:not([data-theme='light']) .site-title img + span::before{background-image:url("${dark}")}`,
    },
  ];
}

/**
 * Vite plugin exposing the theme options to runtime code as `virtual:cv4pve-docs-theme/config`.
 * @param {object} value
 */
function virtualConfig(value) {
  const id = 'virtual:cv4pve-docs-theme/config';
  return {
    name: `${PACKAGE}/config`,
    /** @param {string} source */
    resolveId(source) { return source === id ? '\0' + id : undefined; },
    /** @param {string} key */
    load(key) { return key === '\0' + id ? `export default ${JSON.stringify(value)};` : undefined; },
  };
}

/** Sidebar group with the Corsinvest links, the same on every cv4pve site. */
function corsinvestSidebarGroup() {
  const external = { target: '_blank', rel: 'noopener noreferrer' };
  return {
    label: 'Corsinvest',
    items: [
      { label: 'cv4pve suite', link: 'https://www.corsinvest.it/en/cv4pve/', attrs: external },
      { label: 'Professional support', link: 'https://www.corsinvest.it/en/contact/', attrs: external },
    ],
  };
}

/**
 * Sätteri hast plugin: absolute http(s) links that leave the site open in a new tab,
 * so the reader keeps the page they were on (as corsinvest.it does).
 * @param {string} siteRoot Absolute URL of the site, links under it are internal.
 */
function externalLinksInNewTab(siteRoot) {
  return {
    name: 'external-links-new-tab',
    element: {
      filter: ['a'],
      /** @param {any} node @param {any} ctx */
      visit(node, ctx) {
        const href = node.properties?.href;
        if (typeof href !== 'string' || !/^https?:\/\//.test(href) || href.startsWith(siteRoot)) return;
        ctx.setProperty(node, 'target', '_blank');
        ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
      },
    },
  };
}
