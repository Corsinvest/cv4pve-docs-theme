// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import corsinvestTheme from '@corsinvest/cv4pve-docs-theme';

// TODO: replace cv4pve-TOOL everywhere, then remove the options the tool does not use.
export default defineConfig({
  site: 'https://corsinvest.github.io',
  base: '/cv4pve-TOOL',
  integrations: [
    starlight({
      title: 'cv4pve-TOOL',
      description: 'TODO: one line on what the tool does for Proxmox VE.',
      plugins: [
        corsinvestTheme({
          repo: 'cv4pve-TOOL',
          icon: { light: '/icon.svg', dark: '/icon-dark.svg' },
          // Only if cv4pve-admin has a module running the same engine (see the theme README).
          admin: { module: 'TODO' },
          install: {
            targets: ['linux', 'macos', 'windows'],
            run: ['--host=pve01', "--api-token='user@pve!token=…'", 'TODO-command'],
          },
        }),
      ],
      lastUpdated: true,
      sidebar: [
        { label: 'Start here', items: ['getting-started', 'permissions', 'connection', 'troubleshooting'] },
        // TODO: the tool's own reference pages.
      ],
    }),
  ],
});
