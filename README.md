# Magic UI Solid

<p align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="Magic UI Solid" />
</p>

<p align="center">
  UI Library for Design Engineers — a <a href="https://solidjs.com">SolidJS</a> port of <a href="https://magicui.design">Magic UI</a>, distributed as a <a href="https://ui.shadcn.com/docs/registry">shadcn registry</a>.
</p>

<p align="center">
  <strong><a href="https://axuj.github.io/magicui-solid/v2/">Explore the Solid 2 preview →</a></strong><br />
  Rebuilt on Solid 2 with the official v2 reactivity model, lint preset and a self-hosted registry. Release candidate.
</p>

<div align="center">
  <a href="https://github.com/axuj/magicui-solid/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/axuj/magicui-solid"></a>
  <a href="https://github.com/axuj/magicui-solid/forks"><img alt="GitHub Forks" src="https://img.shields.io/github/forks/axuj/magicui-solid"></a>
  <a href="https://axuj.github.io/magicui-solid/v2/"><img alt="Solid 2 preview" src="https://img.shields.io/badge/Solid_2-preview-blueviolet"></a>
  <a href="https://github.com/axuj/magicui-solid/blob/master/LICENSE.md"><img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
</div>

## Features

- **SolidJS-native** — built with [SolidJS](https://solidjs.com) and [Kobalte](https://kobalte.dev) instead of React
- **76+ components** — ported from [magicui.design](https://magicui.design), including animations, text effects, buttons, and backgrounds
- **Copy-paste friendly** — install any component in seconds with the shadcn CLI
- **Tailwind CSS v4** — components ship with their own animations and keyframes

## Installation

> The registry and commands below target the stable Solid 1 build. For Solid 2, follow the [v2 installation guide](https://axuj.github.io/magicui-solid/v2/docs/installation/).

First add the `@magicui-solid` registry to your `components.json` (see the [Installation guide](https://axuj.github.io/magicui-solid/docs/installation) for prerequisites, registry setup and theme injection). Then install any component:

```sh
npx shadcn@latest add @magicui-solid/marquee
```

Each component installs its dependencies and injects the theme into your `app.css` automatically.

## Documentation

- **Stable (Solid 1)** — [https://axuj.github.io/magicui-solid](https://axuj.github.io/magicui-solid)
- **Solid 2 preview** — [https://axuj.github.io/magicui-solid/v2/](https://axuj.github.io/magicui-solid/v2/), built from the [`v2` branch](https://github.com/axuj/magicui-solid/tree/v2). See the [migration notes](https://github.com/axuj/magicui-solid/blob/v2/docs/solid-2-migration.md) for what changed.

The Solid 2 build targets a release candidate and is not the default install target.

## Local Development

```sh
nub install        # install dependencies (nub is the package manager, not pnpm)
nub run dev        # start dev server at localhost:4321
nub run build      # build registry + production site to ./dist/
nub run registry   # rebuild registry.json + public/r/*.json and validate the registry
nub run smoke      # smoke-test all component pages in the browser
```

Before submitting changes, run:

```sh
nub run lint:fix && nub run ts-check
```

## Tech Stack

- [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) — docs site
- [SolidJS](https://solidjs.com) + [Kobalte](https://kobalte.dev) — components
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- [shadcn registry](https://ui.shadcn.com/docs/registry) — distribution

## Project Structure

```text
/
├── src/
│   ├── components/        # Site-only UI helpers
│   ├── content/docs/      # Starlight docs (one page per component)
│   ├── demos/             # Live demos rendered on component pages
│   ├── registry/magicui/  # The actual registry components (source of truth)
│   └── styles/            # Global CSS
├── registry.ts            # Single source of truth for the registry
├── scripts/               # Registry build, check and smoke test scripts
└── public/r/              # Generated registry JSON consumed by the shadcn CLI
```

## Related

- [magicui](https://github.com/magicuidesign/magicui) — the original React library
- [magicui.design](https://magicui.design) — official Magic UI docs

## License

magicui-solid is a SolidJS port of [Magic UI](https://github.com/magicuidesign/magicui). The upstream MIT license and its copyright notice are preserved verbatim in [LICENSE.md](https://github.com/axuj/magicui-solid/blob/master/LICENSE.md); this port is distributed under the same terms.
