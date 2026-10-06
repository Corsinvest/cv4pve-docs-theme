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

> **The shared look and settings of every cv4pve documentation site**: one [Starlight](https://starlight.astro.build) plugin, so brand, links and layout change in one place for the whole suite.

---

## Why

Each cv4pve tool (cv4pve-diag, cv4pve-report, cv4pve-autosnap, …) publishes its own documentation site
next to its code, at `https://corsinvest.github.io/<tool>/`. Without a shared theme every site carries
its own copy of the colours, fonts, logo, links and components, and a change to any of them has to be
repeated in every repository.

This package holds that shared part. A site installs it, adds one line to its Starlight config and
keeps only its own pages.

---

## What it provides

**Settings** (through the plugin: only the theme switch and the footer replace a Starlight component,
through Starlight's own `components` setting, so sites stay stock Starlight and upgrade with it):

- Corsinvest brand: colours and Barlow fonts from [corsinvest.it](https://www.corsinvest.it), light and dark theme
- Header with the product icon and name (no company logo: Corsinvest is in the suite link and in the footer), GitHub link for the tool's repository. No "Edit page" link and no "Last updated" date under the pages
- Link to the cv4pve suite in the header, beside GitHub: the round Corsinvest logo
  wide screens, linking to the suite on corsinvest.it
- A **Corsinvest** sidebar group: cv4pve suite, professional support
- External links opening in a new tab, the header ones included (with their label as tooltip); internal
  links unchanged
- Optional Matomo statistics without cookies (`matomo` option)

**Components**: use Starlight's own components first (`CardGrid`, `LinkCard`, `Tabs`, `Badge`, `Aside`,
`Steps`, `Code`); these cover only what is shared by the cv4pve sites. They are self-contained, with scoped
styles, and touch no Starlight internals:

| Component | What it shows | For |
|---|---|---|
| `CliInstall.astro` | Installation commands, one tab per system and one per channel, with copy button: release zips, deb, rpm, AUR, WinGet, Homebrew, macOS pkg; names derived from the repository, as the shared release workflow publishes them | Tools released with `cv4pve-tools-publish.yml`; pass `channels` / `winget` for the exceptions; `run` adds the command to run the tool (home pages, under the motto) |
| `CliGettingStarted.astro` | The numbered steps of the Getting started page: install (`CliInstall`), create an API token (link to Permissions), run the first command (`run`), read the result (`result` is its title, the content comes from the page). Slots `token` and `notes` (under the command) for the tool's own text | Tools with the shared login options, see `CliConnection`. Keep the hero `steps` in the same order and words |
| `CliConnection.astro` | Connection options: `--host` (several nodes), `--api-token`, `--username`/`--password`, `--validate-certificate` | Tools built on `Corsinvest.ProxmoxVE.Api.Console` login options: diag, report, autosnap, pepper, botgram, metrics-exporter |
| `TerminalTable.astro` | A tool's tabular output as the terminal shows it: command on top, monospace table, coloured severity badges; dark in the dark theme, light in the light one | Any tool printing tables (they share `TableGenerator`) |
| `TerminalOutput.astro` | A tool's output that is not a table, line by line: the command on top, then the lines in monospace, each with an optional tone (`ok`, `warning`, `critical`, `info`, `muted`, `accent`, `code`) to tell the parts of the output apart, and an optional note under it. Same frame and light theme as `TerminalTable` | The log of a run, a start-up message, a list of files written. On the home page under the command, so the reader sees what the tool gives |
| `FeatureGrid.astro` | Feature cards: icon beside the title (a Starlight one, Material Design with `mdi:`, Material Symbols with `ms:`), text and an optional `color`; with `href` the whole card is a link, or with `action` a button at its bottom. The text can hold paragraphs and lists (lines starting with "- "). In the text: `[EE]` `[CE]` edition badges, `[[Ctrl+K]]` a key or a label (a badge variant after a vertical bar: `tip`, `note`, …), backticks for code, `**bold**`, `*italic*`, `[text](href)` links | Home pages and the lists of features inside the pages |
| `Footer.astro` | Footer: Starlight's own (previous and next page), then the motto of the suite ("By sysadmins, for sysadmins."), the Corsinvest wordmark and one line: "Part of the cv4pve suite", "Made with ❤️ in Italy", "Copyright © Corsinvest Srl", linked to the suite and to corsinvest.it; last, the trademark notice ("Proxmox® is a registered trademark of Proxmox Server Solutions GmbH. cv4pve is developed by Corsinvest and is not a Proxmox product."). On the home page it leaves out the motto and the suite, already under the hero (`Motto`) and in the `CtaBand` | Registered by the theme on every site: nothing to import |
| `ThemeSelect.astro` | Theme switch: one icon button in place of the Starlight drop-down. A click goes to the next mode: auto (system setting), light, dark | Registered by the theme on every site: nothing to import |
| `CliResponseFiles.astro` | Options in a file passed with `@file` (System.CommandLine response files), for the section *Options in a file*. The example file holds the shared connection options (host, token, user and password, certificate) built from `user` and `token`, plus the tool's own `extra` lines; `lines` replaces it for tools with other options (node-protect); `after` puts `@file` after the command, for options that belong to a subcommand (cv4pve-cli). Rules verified on System.CommandLine 2.0.9 | Every .NET CLI tool (not vdi), on the Connection page |
| `CliTroubleshooting.astro` | The hidden `--debug` and `--log-level` options and what they log | Every .NET CLI tool (not vdi); `api={false}` for SSH-only tools (node-protect) |
| `AiSkill.astro` | The tool's skill for AI assistants (`skills/<tool>/SKILL.md`): what it is, what it tells the assistant (the tool's list, in the slot), install with `npx skills add` or `curl` | Page *AI assistants* of any tool that ships a skill |
| `AiSandbox.astro` | Deprecated, kept so that sites importing it still build: the *AI assistants* pages no longer have a sandbox section; the token is the only real limit, said in the token section | - |
| `Collapse.astro` | Collapsible block for long reference content (`title`, optional `kind`, `open` and a `badge` slot): a native `<details>` drawn as a box with a header bar, Starlight's chevron and a Show / Hide label, so it reads as something to click | Long tables of settings, tools or examples that would bury the page |
| `Severity.astro` | Severity pill (Critical, Warning, Info, Ok; `Warning/Critical` gives two) with the same look as TerminalTable | Reference tables |
| `Suite.astro` | The whole cv4pve suite, grouped as on corsinvest.it, with Starlight cards | Any site |
| `Motto.astro` | Who makes the tools: the motto of the suite, "By sysadmins, for sysadmins.", and under it the fact behind it, "Built by Corsinvest, official Proxmox partner.", linked to Corsinvest's entry in the Proxmox partner directory. A statement at reading size, not a banner. No props: it is the same on every site | Home pages, right under the hero |
| `CtaBand.astro` | Closing band: "Part of the cv4pve suite", get started, professional support, "official Proxmox partner" | Home pages |

**Home page extras** through plugin options: a steps panel in the hero (`steps`, or the older
install-and-run panel, `install`), a link
to the matching cv4pve-admin module, as a button of the hero (`admin`), and the product icon (`icon`). The `.accent-mark`
class highlights words in brand blue, as on the corsinvest.it home.

---

## Usage

The theme is installed straight from this repository (no npm registry) at the latest `v2.x` tag:

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
      sidebar: [ /* the tool's own pages; the Corsinvest group is appended */ ],
    }),
  ],
});
```

| Option | Default | |
|---|---|---|
| `repo` | *(required)* | Repository under `github.com/Corsinvest` |
| `branch` | - | No longer used: the theme sets no "Edit page" link. Accepted so that sites passing it still build |
| `docsPath` | - | No longer used, as `branch` |
| `admin` | - | cv4pve-admin module running the same engine, e.g. `{ module: 'diagnostics' }`: a "Web interface (cv4pve-admin)" button, with the cv4pve-admin icon, as last button of the home hero, linking that module's documentation |
| `icon` | - | Product icon `{ light, dark? }`, paths in the site's `public/`: favicon and icon before the product name in the header |
| `steps` | - | Steps panel in the home hero, see below |
| `install` | - | Older install-and-run panel in the home hero, used when `steps` is not set, see below |
| `matomo` | - | `{ url, siteId }`: page views and outbound links sent to that Matomo instance, without cookies; no consent banner needed. Anonymise IPs on the Matomo server |

A logo or `social` set in the site's own config wins over the theme's. A site that wants the "Edit page" link sets `editLink` in its own config.

### Steps panel

The home hero shows a short title and the numbered steps from nothing to a first result, with a link
to Getting started. The commands are not in the panel: they are in the pages, in code blocks that can
be copied (`CliInstall` on the home page, `CliGettingStarted` on Getting started).

```js
corsinvestTheme({
  repo: 'cv4pve-report',
  steps: {
    items: [
      'Install cv4pve-report',
      { text: 'Create an API token', href: 'permissions/#user-and-token' },
      'Run `cv4pve-report export`',
      'Open the report',
    ],
  },
});
```

- `items`: three or four short lines. Text between backticks is shown as code; an item with `href`
  (relative to the home page) links to the page that explains it.
- The items are steps of the Getting started page, in the same order and with the same words. That
  page can have more steps than the panel, never different ones. `CliGettingStarted` writes the
  standard four.
- `title` and `highlight` (default "Up and running in" and the number of steps, e.g. "4 steps") and `link` (default: Getting
  started) change the text around the steps.
- The panel goes on pages with a `hero` and no hero `image` (normally only the home page).

### Install panel

The older panel, used when `steps` is not set. The home hero shows a terminal with the commands to install and run the tool, one block per target,
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
- The panel goes on pages with a `hero` and no hero `image` (normally only the home page).

### Components

```mdx
import CliConnection from '@corsinvest/cv4pve-docs-theme/components/CliConnection.astro';
import AiSkill from '@corsinvest/cv4pve-docs-theme/components/AiSkill.astro';
import CtaBand from '@corsinvest/cv4pve-docs-theme/components/CtaBand.astro';
import proxmoxLogo from '../../assets/proxmox-logo.svg';

<CliConnection user="report@pve" />

<AiSkill tool="cv4pve-report">

- read `issues.json` first;
- …

</AiSkill>


<CtaBand title="Run your first report" text="…" proxmoxLogo={proxmoxLogo} />
```

The Proxmox logo is a trademark of Proxmox Server Solutions and is **not** part of this package: each
site keeps its own copy of the media-kit file (the horizontal lockup, never recoloured) and passes it to
`CtaBand`. Without it the band shows no partner line.

---

## Starting a new site

[`templates/`](templates/) mirrors a tool repository: copy `templates/docs/` to the tool's `docs/`
folder and `templates/.github/workflows/docs.yml` to its workflows, replace `cv4pve-TOOL` and fill every
`TODO`. It gives the standard pages (home, Getting started, Connection, Permissions, Troubleshooting) already built from the
components above, plus `package.json`, `astro.config.mjs` and the deploy workflow. Add the tool's
`public/icon.svg` / `icon-dark.svg` and `src/assets/proxmox-logo.svg` (Proxmox media kit).

---

## Writing a cv4pve documentation site

The theme gives the look; these rules give the content the same quality on every site.

- **Start from the problem.** The home page says *why* the tool exists (which Proxmox VE problem it
  solves) before listing features.
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
not covered by the license: see [LICENSE.md](LICENSE.md#trademarks). Barlow fonts: SIL Open Font License
1.1. Third-party components: [3rd-party-licenses.md](3rd-party-licenses.md).

---

Part of [cv4pve](https://www.corsinvest.it/cv4pve) suite | Made with ❤️ in Italy by [Corsinvest](https://www.corsinvest.it)

Copyright © Corsinvest Srl
