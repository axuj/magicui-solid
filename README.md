# Magic UI Solid

<p align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="Magic UI Solid" />
</p>

<p align="center">
  UI Library for Design Engineers — a <a href="https://solidjs.com">SolidJS</a> port of <a href="https://magicui.design">Magic UI</a>, distributed as a <a href="https://ui.shadcn.com/docs/registry">shadcn registry</a>.
</p>

<div align="center">
  <a href="https://github.com/axuj/magicui-solid/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/axuj/magicui-solid"></a>
  <a href="https://github.com/axuj/magicui-solid/forks"><img alt="GitHub Forks" src="https://img.shields.io/github/forks/axuj/magicui-solid"></a>
  <a href="https://github.com/axuj/magicui-solid/blob/master/LICENSE.md"><img alt="License" src="https://img.shields.io/badge/License-MIT-yellow.svg"></a>
</div>

## Features

- **SolidJS-native** — built with [SolidJS](https://solidjs.com) and [Kobalte](https://kobalte.dev) instead of React
- **76+ components** — ported from [magicui.design](https://magicui.design), including animations, text effects, buttons, and backgrounds
- **Copy-paste friendly** — install any component in seconds with the shadcn CLI
- **Tailwind CSS v4** — components ship with their own animations and keyframes

## Installation

First add the `@magicui-solid` registry to your `components.json` (see the [Installation guide](https://axuj.github.io/magicui-solid/docs/installation) for prerequisites, registry setup and theme injection). Then install any component:

```sh
npx shadcn@latest add @magicui-solid/marquee
```

Each component installs its dependencies and injects the theme into your `app.css` automatically.

## Documentation

Visit [https://axuj.github.io/magicui-solid](https://axuj.github.io/magicui-solid) to browse the components and view usage examples for each one.

A [Solid 2 preview](https://axuj.github.io/magicui-solid/v2/) is built from the `v2` branch. It targets a release candidate and is not the default install target.

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
