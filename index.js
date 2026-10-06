/*
 * SPDX-FileCopyrightText: Copyright Corsinvest Srl
 * SPDX-License-Identifier: MIT
 */

import { isSatteriProcessor, satteri } from '@astrojs/markdown-satteri';

const PACKAGE = '@corsinvest/cv4pve-docs-theme';
const SUITE_URL = 'https://www.corsinvest.it/en/cv4pve/';

/**
 * @typedef {object} CorsinvestThemeOptions
 * @property {string} repo GitHub repository name under github.com/Corsinvest, e.g. `cv4pve-diag`.
 * @property {string} [branch] No longer used: the theme sets no "Edit page" link. Accepted so that
 *   sites passing it still build.
 * @property {string} [docsPath] No longer used, as `branch`.
 * @property {{ light: string, dark?: string }} [icon] Product icon, paths under the site's `public/`
 *   folder (e.g. `/icon.svg`): used as favicon and shown before the product name in the header.
 *   `dark` is used by the dark theme and by browsers in dark mode.
 * @property {{ module: string }} [admin] cv4pve-admin module that runs the same engine, e.g.
 *   `{ module: 'diagnostics' }`: a "Web interface (cv4pve-admin)" button, with the cv4pve-admin icon,
 *   as last button of the home hero, linking that module's docs.
 * @property {import('./steps-panel.js').StepsPanelOptions} [steps] Steps panel shown in the hero of
 *   the home page (a page with a hero and no hero image): the numbered steps to a first result.
 * @property {import('./install-panel.js').InstallPanelOptions} [install] Install-and-run panel in the
 *   same place, used when `steps` is not set. Prefer `steps` in the hero and the CliInstall
 *   component in the page, where the commands can be copied.
 * @property {'sysadmins' | 'developers'} [audience] Who the site is for: the word of the motto
 *   ("By sysadmins, for sysadmins.", or "By developers, for developers.") under the home hero and in the footer. Default `sysadmins`; `developers`
 *   on the sites of the API libraries.
 * @property {{ url: string, siteId: number }} [matomo] Matomo instance and site ID: page views and
 *   outbound links are tracked without cookies, so no consent banner is needed.
 */

/**
 * Starlight plugin with the Corsinvest look and the settings shared by every cv4pve
 * documentation site: brand, product icon, GitHub link, the Corsinvest sidebar
 * group, and external links opening in a new tab.
 *
 * Only documented Starlight settings are touched. Two components are replaced through Starlight's
 * own `components` setting: the theme switch (ThemeSelect) and the footer (Footer, which wraps
 * Starlight's one). The rest stays stock Starlight and upgrades with it.
 *
 * @param {CorsinvestThemeOptions} options
 * @returns {import('@astrojs/starlight/types').StarlightPlugin}
 */
export default function corsinvestTheme(options) {
  if (!options?.repo) throw new Error(`${PACKAGE}: the "repo" option is required, e.g. { repo: 'cv4pve-diag' }`);
  const { repo, install, steps, icon, admin, audience, matomo } = options;

  return {
    name: PACKAGE,
    hooks: {
      'config:setup'({ config, updateConfig, addIntegration, addRouteMiddleware, astroConfig, command }) {
        const base = (astroConfig.base ?? '/').replace(/\/$/, '');
        updateConfig({
          ...(icon && {
            favicon: config.favicon && config.favicon !== '/favicon.svg' ? config.favicon : icon.light,
          }),
          head: [
            ...(config.head ?? []),
            ...(icon ? productIconHead(base, icon) : []),
            socialLinksInNewTab(),
            // Only in the built site: local dev visits stay out of the statistics.
            ...(matomo && command === 'build' ? [matomoHead(matomo)] : []),
          ],
          // No logo from the theme: the header shows the product, with its icon (the `icon` option)
          // before the name. Corsinvest is in the suite link beside GitHub and in the footer of
          // every page. A logo set by the site is kept as it is.
          // The light / dark switch is an icon button in place of Starlight's drop-down. A component
          // set by the site is kept as it is.
          // The footer adds the signature of the suite under Starlight's own footer.
          components: {
            ThemeSelect: `${PACKAGE}/components/ThemeSelect.astro`,
            Footer: `${PACKAGE}/components/Footer.astro`,
            ...(config.components ?? {}),
          },
          // Brand first, so the site's own CSS can override it.
          customCss: [`${PACKAGE}/styles/brand.css`, ...(config.customCss ?? [])],
          social: config.social?.length
            ? config.social
            : [
                { icon: 'github', label: 'GitHub', href: `https://github.com/Corsinvest/${repo}` },
                // brand.css draws the Corsinvest "C" in place of this icon; the label is for screen readers.
                { icon: 'puzzle', label: 'Part of the cv4pve suite', href: SUITE_URL },
              ],
          // No "Edit page" link under the pages: the theme sets no `editLink`. A site that wants it
          // sets its own in the Starlight config.
          // No "Last updated" date either, also when the site's config asks for it: a page that
          // needs it sets `lastUpdated` in its frontmatter.
          lastUpdated: false,
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

        if (install || steps || admin) addRouteMiddleware({ entrypoint: `${PACKAGE}/route-middleware` });

        addIntegration({
          name: `${PACKAGE}/external-links`,
          hooks: {
            'astro:config:setup'({ config: astroConfig, updateConfig: updateAstroConfig }) {
              // The route middleware reads the plugin options from this virtual module.
              updateAstroConfig({ vite: { plugins: [virtualConfig({ repo, install, steps, admin, audience })] } });

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
 * the header: plain CSS on Starlight's site title, no component override.
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
        `.site-title > span::before{content:'';display:inline-block;width:1.35rem;height:1.35rem;margin-right:.5rem;vertical-align:-.2rem;background:url("${light}") center/contain no-repeat}` +
        `:root:not([data-theme='light']) .site-title > span::before{background-image:url("${dark}")}`,
    },
  ];
}

/**
 * Head script: the header social links (GitHub, cv4pve suite) open in a new tab, like the other
 * external links, and show their label as tooltip. Starlight's social config has no target or
 * title option and the component is not overridden; its links are the only ones with rel="me".
 */
function socialLinksInNewTab() {
  return {
    tag: 'script',
    content:
      `document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('a[rel~="me"][href^="http"]')` +
      `.forEach((a)=>{a.target='_blank';a.rel='me noopener noreferrer';a.title||=a.textContent.trim();});});`,
  };
}

/**
 * Head script: Matomo page views and outbound links. Cookies off, so visits are counted without
 * recognising the visitor and no consent banner is required; IP anonymisation is set on the
 * Matomo server.
 * @param {{ url: string, siteId: number }} matomo
 */
function matomoHead({ url, siteId }) {
  const base = url.endsWith('/') ? url : `${url}/`;
  return {
    tag: 'script',
    content:
      `var _paq=window._paq=window._paq||[];_paq.push(['disableCookies']);_paq.push(['trackPageView']);` +
      `_paq.push(['enableLinkTracking']);(function(){var u=${JSON.stringify(base)};` +
      `_paq.push(['setTrackerUrl',u+'matomo.php']);_paq.push(['setSiteId',${JSON.stringify(String(siteId))}]);` +
      `var d=document,g=d.createElement('script'),s=d.getElementsByTagName('script')[0];` +
      `g.async=true;g.src=u+'matomo.js';s.parentNode.insertBefore(g,s);})();`,
  };
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
      { label: 'cv4pve suite', link: SUITE_URL, attrs: external },
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
