# cv4pve-docs-theme

```
     ______                _                      __
    / ____/___  __________(_)___ _   _____  _____/ /_
   / /   / __ \/ ___/ ___/ / __ \ | / / _ \/ ___/ __/
  / /___/ /_/ / /  (__  ) / / / / |/ /  __(__  ) /_
  \____/\____/_/  /____/_/_/ /_/|___/\___/____/\__/

Documentation theme for cv4pve (Made in Italy)
```

[![License](https://img.shields.io/github/license/Corsinvest/cv4pve-docs-theme.svg?style=flat-square)](LICENSE.md)
[![Release](https://img.shields.io/github/v/tag/Corsinvest/cv4pve-docs-theme?style=flat-square&label=version)](https://github.com/Corsinvest/cv4pve-docs-theme/tags)

> **The shared look and settings of every cv4pve documentation site** — one [Starlight](https://starlight.astro.build) plugin, so brand, links and layout change in one place for the whole suite.

---

## Why

Each cv4pve tool (cv4pve-diag, cv4pve-report, cv4pve-autosnap, …) publishes its own documentation site
next to its code, at `https://corsinvest.github.io/<tool>/`. Without a shared theme every site carries
its own copy of the colours, fonts, logo, links and components — and a change to any of them has to be
repeated in every repository.

This package holds that shared part. A site installs it, adds one line to its Starlight config and
keeps only its own pages.

---

## What it provides

**Settings** (through the plugin — no Starlight component is overridden, so sites stay stock Starlight
and upgrade with it):

- Corsinvest brand: colours and Barlow fonts from [corsinvest.it](https://www.corsinvest.it), light and dark theme
- Corsinvest wordmark as logo, GitHub link and "Edit page" link for the tool's repository
- **Part of the cv4pve suite** in the header, beside GitHub: the round Corsinvest logo, with the text on
  wide screens, linking to the suite on corsinvest.it
- A **Corsinvest** sidebar group: cv4pve suite, professional support
- External links opening in a new tab, the header ones included (with their label as tooltip); internal
  links unchanged
- Optional Matomo statistics without cookies (`matomo` option)

**Components** — use Starlight's own components first (`CardGrid`, `LinkCard`, `Tabs`, `Badge`, `Aside`,
`Steps`, `Code`); these cover only what is shared by the cv4pve sites. They are self-contained, with scoped
styles, and touch no Starlight internals:

| Component | What it shows | For |
|---|---|---|
| `CliInstall.astro` | Installation table: release zips, deb, rpm, AUR, WinGet, Homebrew, macOS pkg — names derived from the repository, as the shared release workflow publishes them | Tools released with `cv4pve-tools-publish.yml`; pass `channels` / `winget` for the exceptions |
| `CliConnection.astro` | Connection options: `--host` (several nodes), `--api-token`, `--username`/`--password`, `--validate-certificate` | Tools built on `Corsinvest.ProxmoxVE.Api.Console` login options: diag, report, autosnap, pepper, botgram, metrics-exporter |
| `TerminalTable.astro` | A tool's tabular output as the terminal shows it: command on top, monospace table, coloured severity badges; dark in the dark theme, light in the light one | Any tool printing tables (they share `TableGenerator`) |
| `FeatureGrid.astro` | Numbered feature cards, each linking to the page that explains it | Home pages |
| `CliResponseFiles.astro` | Options in a file passed with `@file` (System.CommandLine response files), for the section *Options in a file*. The example file holds the shared connection options (host, token, user and password, certificate) built from `user` and `token`, plus the tool's own `extra` lines; `lines` replaces it for tools with other options (node-protect); `after` puts `@file` after the command, for options that belong to a subcommand (cv4pve-cli). Rules verified on System.CommandLine 2.0.9 | Every .NET CLI tool (not vdi), on the Connection page |
| `CliTroubleshooting.astro` | The hidden `--debug` and `--log-level` options and what they log | Every .NET CLI tool (not vdi); `api={false}` for SSH-only tools (node-protect) |
| `Severity.astro` | Severity pill (Critical, Warning, Info, Ok; `Warning/Critical` gives two) with the same look as TerminalTable | Reference tables |
| `Suite.astro` | The whole cv4pve suite, grouped as on corsinvest.it, with Starlight cards | Any site |
| `CtaBand.astro` | Closing band: "Part of the cv4pve suite", get started, professional support, "official Proxmox partner" | Home pages |

**Home page extras** through plugin options: an install-and-run panel in the hero (`install`), a banner
pointing to the matching cv4pve-admin module (`admin`), and the product icon (`icon`). The `.accent-mark`
class highlights words in brand blue, as on the corsinvest.it home.

---

## Usage

The theme is installed straight from this repository — no npm registry — at the latest `v2.x` tag:

```bash
cd docs
npm install -D "github:Corsinvest/cv4pve-docs-theme#semver:^2.0.0"
```

`npm update` moves to newer `v2.x` tags; a `v3` tag means breaking changes and needs the range changed.

```js
// docs/astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import corsinvestTheme from '@corsinvest/cv4pve-docs-theme';

export default defineConfig({
  site: 'https://corsinvest.github.io',
  base: '/cv4pve-report',
  integrations: [
    starlight({
      title: 'cv4pve-report',
      plugins: [corsinvestTheme({ repo: 'cv4pve-report' })],
      sidebar: [ /* the tool's own pages — the Corsinvest group is appended */ ],
    }),
  ],
});
```

| Option | Default | |
|---|---|---|
| `repo` | *(required)* | Repository under `github.com/Corsinvest` |
| `branch` | `master` | Branch the "Edit page" links point to |
| `docsPath` | `docs` | Folder of the Starlight project in the repository |
| `admin` | — | cv4pve-admin module running the same engine, e.g. `{ module: 'diagnostics' }`: banner on the home page |
| `icon` | — | Product icon `{ light, dark? }`, paths in the site's `public/`: favicon and icon before the product name in the header |
| `install` | — | Install-and-run panel in the home hero, see below |
| `matomo` | — | `{ url, siteId }`: page views and outbound links sent to that Matomo instance, without cookies — no consent banner needed. Anonymise IPs on the Matomo server |

A logo, `social` or `editLink` set in the site's own config wins over the theme's.

### Install panel

The home hero shows a terminal with the commands to install and run the tool, one block per target,
with a picker when there is more than one. The visitor's operating system is selected when offered.

```js
corsinvestTheme({
  repo: 'cv4pve-diag',
  install: {
    targets: ['linux', 'macos', 'windows'],
    run: ['--host=pve01', "--api-token='diag@pve!audit=…'", 'execute'],
    output: [{ text: '2 critical', tone: 'critical' }, { text: '5 warning', tone: 'warning' }],
  },
});
```

- `linux`, `macos`, `windows` are the standard cv4pve release channels and are derived from `repo`:
  release zip, Homebrew tap (`brew install <repo>`), WinGet (`Corsinvest.cv4pve.<name>`, override with `winget`).
- Any other target is written out, e.g. Docker:
  `{ id: 'docker', label: 'Docker', icon: 'docker', lines: ['# run', 'docker run --rm corsinvest/…'] }`.
  Docker is never selected automatically, since the browser cannot tell.
- List only the targets the tool really ships. With a single target the picker is hidden.
- The panel goes on pages with a `hero` and no hero `image` — normally only the home page.

### Components

```mdx
import CliConnection from '@corsinvest/cv4pve-docs-theme/components/CliConnection.astro';
import CtaBand from '@corsinvest/cv4pve-docs-theme/components/CtaBand.astro';
import proxmoxLogo from '../../assets/proxmox-logo.svg';

<CliConnection user="report@pve" />


<CtaBand title="Run your first report" text="…" proxmoxLogo={proxmoxLogo} />
```

The Proxmox logo is a trademark of Proxmox Server Solutions and is **not** part of this package: each
site keeps its own copy of the media-kit file (the horizontal lockup, never recoloured) and passes it to
`CtaBand`. Without it the band shows no partner line.

---

## Starting a new site

[`templates/`](templates/) mirrors a tool repository: copy `templates/docs/` to the tool's `docs/`
folder and `templates/.github/workflows/docs.yml` to its workflows, replace `cv4pve-TOOL` and fill every
`TODO`. It gives the standard pages — home, Getting started, Connection, Permissions, Troubleshooting — already built from the
components above, plus `package.json`, `astro.config.mjs` and the deploy workflow. Add the tool's
`public/icon.svg` / `icon-dark.svg` and `src/assets/proxmox-logo.svg` (Proxmox media kit).

---

## Writing a cv4pve documentation site

The theme gives the look; these rules give the content the same quality on every site.

- **Start from the problem.** The home page says *why* the tool exists — which Proxmox VE problem it
  solves — before listing features.
- **Say how it runs.** cv4pve tools run outside the nodes and talk only to the Proxmox VE API: say so,
  and link the privileges the API token needs. A tool that connects over SSH instead (node-protect)
  says that, with the account and the access it needs on the nodes.
- **Verify every claim against the code.** Numbers, defaults, option names and behaviours come from the
  source, not from memory. No filler claims.
- **Stay stock Starlight.** New needs go into this theme as settings or components, not as overrides in
  one site.

---

## Publishing a site

The site's `docs.yml` calls the shared workflow
[`cv4pve-tools-docs.yml`](https://github.com/Corsinvest/.github/blob/main/.github/workflows/cv4pve-tools-docs.yml),
which builds it with `withastro/action` and deploys it with `actions/deploy-pages` on every push to
`master` that touches `docs/`. It takes two optional inputs: `path`, the folder of the site (default
`docs`), and `pre-build`, a command run before the build. GitHub Pages must use **GitHub Actions** as
source (*Settings → Pages*).

---

## Development

Work on the theme against a real site without publishing, with a local dependency:

```json
"devDependencies": {
  "@corsinvest/cv4pve-docs-theme": "file:../../cv4pve-docs-theme"
}
```

Release: bump `version` in `package.json`, commit, push a `vX.Y.Z` tag. Sites pick it up with `npm update`.

After changing the theme, refresh a site that uses the local copy with
`npm uninstall @corsinvest/cv4pve-docs-theme && npm i -D --install-links file:../../cv4pve-docs-theme`
(a `file:` dependency is a symlink, and the theme's own dependencies would not resolve from it).

---

## License

Code and styles: [MIT](LICENSE.md). The Corsinvest name and logo are trademarks of Corsinvest Srl and are
not covered by the license — see [LICENSE.md](LICENSE.md#trademarks). Barlow fonts: SIL Open Font License
1.1. Third-party components: [3rd-party-licenses.md](3rd-party-licenses.md).

---

Part of [cv4pve](https://www.corsinvest.it/cv4pve) suite | Made with ❤️ in Italy by [Corsinvest](https://www.corsinvest.it)

Copyright © Corsinvest Srl
