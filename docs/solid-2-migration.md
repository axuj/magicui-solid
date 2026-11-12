# Migrating a Solid 1.x component library to Solid 2

Notes from porting this repository's components from Solid 1.9 to Solid 2. Everything here was exercised in this repository.

Verified against:

| Package | Version |
| --- | --- |
| `solid-js` / `@solidjs/web` | `2.0.0-rc.21` |
| `@solidjs/vite-plugin` | `3.0.0-next.57` |
| `@kobalte/core` | `2.0.0-alpha.4` |
| `@solid-primitives/spring` | `1.0.0-next.5` |
| `astro-solid-next` | `0.1.0` |

Solid 2 is still a release candidate and the API moved between RCs (`@kobalte/core` 2.0.0-alpha.4 is pinned to `solid-js rc.16` while the runtime is `rc.21`). Treat these versions as part of the instructions and re-verify after every RC bump.

## Conventions

1. Defaults: `props.x ?? default`. `merge` treats an explicit `undefined` as an override, which breaks defaults on forwarded optional props (see 3).
2. Setup and teardown: `onSettled(() => { ...; return cleanup })`.
3. Reactive side effects: `createEffect(compute, apply)`. Read values from `apply`'s argument, not from accessors.
4. Passthrough props: `omit(props, ...consumed)`.
5. Types: `JSX`, `ComponentProps`, `ValidComponent` come from `@solidjs/web`; `Accessor` and `Component` stay in `solid-js`.
6. No signal writes in a component body or in an effect's compute phase.

## 1. Environment

### 1.1 Pin the core packages exactly

`latest` on npm still points at 1.9.x for `solid-js`, and a range such as `^2.0.0-rc.21` resolves back to 1.9.18, so the build silently compiles against the wrong runtime. Use exact versions for `solid-js` and `@solidjs/web`, and keep them identical.

### 1.2 JSX import source

```jsonc
// tsconfig.json
{ "compilerOptions": { "jsxImportSource": "@solidjs/web" } }
```

### 1.3 The `solid` condition

Packages that ship compiled output and JSX source expose a `solid` entry in `exports`: `solid` points at `dist/source/*.jsx`, while `import` / `browser` point at precompiled files. Without the condition the resolver takes the precompiled file, whose module scope calls `template()`. Under SSR `@solidjs/web` resolves to its server build, where `template` is `notSup`, so the import throws `Client-only API called on the server side` before any component renders. Astro reports it as `Unable to render <Component>` with no stack.

Both Solid integrations inject the condition in their `configEnvironment` hook (`vite-plugin-solid` through `@astrojs/solid-js`, `@solidjs/vite-plugin` through `astro-solid-next`), so `astro.config.mjs` needs no `conditions` entry — this port prerenders all 88 routes without one. Vite 6+ resolves the client and server environments separately, so a pipeline that has to supply it needs two entries: client `['solid', 'browser', ...]` and `environments.ssr` `['solid', 'node', ...]`.

Prerendering is the only layer that catches a missing condition, because the throw happens while importing a module.

### 1.4 Subpath aliases are a bridge

`solid-js/web` and `solid-js/store` are gone from the 2.x exports map. A dependency still compiled against 1.x needs the aliases:

```js
const alias = {
  'solid-js/web': '@solidjs/web',
  'solid-js/store': 'solid-js',
}
```

An alias fixes the import path, not the API: 1.x-compiled code also calls `splitProps`, which 2.0 removed. Prefer a release built for 2.x (see 5.3) and then delete the aliases — while they are in place they rewrite imports from every dependency that uses those subpaths, hiding which packages still need work.

## 2. API mapping

Removed from `solid-js@2.0.0-rc.21` (all `undefined` at runtime): `splitProps`, `mergeProps`, `onMount`, `Index`, `Dynamic`, `Suspense`, `ErrorBoundary`, `createResource`, `SuspenseList`, `batch`, `createComputed`, `on`, `useTransition`.

| 1.x | 2.0 | Note |
| --- | --- | --- |
| `mergeProps(defaults, props)` | `props.x ?? default` | `undefined` now wins by presence; see 3. |
| `const [local, rest] = splitProps(x, keys)` | `const rest = omit(x, ...keys)` | Only the remainder is returned. `local.k` reads become `x.k`. |
| `onMount(fn)` | `onSettled(fn)` | Return a cleanup instead of calling `onCleanup`. Runs after the first reactive settle, not the first paint. |
| `createEffect(fn)` | `createEffect(compute, apply)` | One-argument form removed; the dev build throws `MISSING_EFFECT_FN`. |
| `createEffect(on(dep, fn))` | `createEffect(() => dep(), fn, { defer })` | `on` removed. `defer: true` replaces `on(dep, fn, { defer: true })`. |
| `<Index each={xs}>` | `<For each={xs} keyed={false}>` | Same signature: the item stays an accessor, the index stays a `number`. |
| `import type { JSX } from 'solid-js'` | `from '@solidjs/web'` | Also `ComponentProps`, `ValidComponent`. |
| `import { Portal } from 'solid-js/web'` | `from '@solidjs/web'` | The subpath is gone; the export is not. |
| `createResource(source, fetcher)` | not available | Rebuild with a signal plus `createEffect(source, fn)` and a stale-write guard. |
| `<Ctx.Provider value={...}>` | `<Ctx value={...}>` | The context object is the provider component. |
| `class="a" classList={{ b: cond }}` | `class={['a', { b: cond }]}` | `classList` was folded into `class`, which accepts arrays and objects. |
| `tabIndex={0}` | `tabindex={0}` | JSX attribute names now match the DOM. |
| `aria-hidden={true}` / bare `aria-hidden` | `aria-hidden="true"` | `aria-*` booleans are strings. |
| JSX at module scope | wrap it in a function | The compiler emits `ssrHydrationKey()` next to the markup, and that call needs a hydrating context; prerendering a module that builds JSX at import time fails with `getNextContextId cannot be used under non-hydrating context`. Only `astro build` catches it. |
| `{...omit(props, ...)}` on a polymorphic component | `{...(omit(props, ...) as Record<string, unknown>)}` | `omit` no longer satisfies kobalte's `Omit<ComponentProps<T>, ...>`. Values are unchanged. |

`@solidjs/web` still exports `Portal`, `Dynamic`, `mergeProps`, `createComponent`, `spread`, `insert` and `template` so 1.x-compiled code runs; they are not the recommended API for new code. Still exported and unchanged: `For`, `Show`, `Switch`, `Match`, `children`, `createMemo`, `createSignal`, `createEffect`, `untrack`, `onCleanup`.

## 3. Default prop values

The runtime's JSDoc recommends `merge(defaults, props)` for this — "Use this in component bodies to merge defaults / overrides without losing Solid's per-property tracking" — and that is the official shape. It assumes the caller never passes `undefined` explicitly. The `??` form below is the one that holds when a wrapper forwards an optional prop, which is why this port uses it and why the choice is spelled out rather than assumed.

```text
export function Marquee(props: MarqueeProps) {
  const repeat = () => props.repeat ?? 4   // accessor when read more than once
  const rest = omit(props, 'repeat', 'class')

  return <For each={Array.from({ length: repeat() })}>{...}</For>
}
```

Inline `props.x ?? default` when the value is read once, an accessor when it is read more than once. No shared helper, no intermediate merged object, and never destructure in the signature — `{ repeat = 4 }` reads once and kills reactivity, and the dev build warns about it.

**Why not `merge`.** It resolves keys by presence, not by value: a later source wins even when its value is `undefined`. Measured on `merge({ repeat: 4 }, props)`:

| Call site | `Object.keys(props)` | `merged.repeat` |
| --- | --- | --- |
| `<Marquee>` | `[]` | `4` |
| `<Marquee repeat={4}>` | `['repeat']` | `4` |
| `<Marquee repeat={undefined}>` | `['repeat']` | `undefined` |

The third row is reachable without anyone typing `undefined`: a wrapper forwarding an optional prop always produces a key. This is documented behaviour, not a defect — `undefined` is a real value in 2.0, so `merge(defaults, props)` behaves like `{ ...defaults, ...props }`. `merge` still earns its keep when the defaults have to travel as an object (spreading onto a child or the DOM, layering several sources, accepting a function source), but no component here needs that.

**Defaults are the easiest thing to lose.** In 1.x they lived in one `mergeProps` call; replacing it with `omit` deletes that object, and every key has to be reintroduced at each read site. A missed key is silent — no type error (the prop is optional), no warning, no SSR diff. It surfaces as a different bug: `setInterval(fn, props.duration)` with `undefined` runs at 0 ms and the typing animation finishes in one frame, `props.sequence ? context : null` takes the false branch and disables a whole feature, and `` `${props.beamSize}%` `` becomes `"undefined%"`, which the browser drops. Check every default key from the pre-migration `mergeProps` call against the new reads; reads inside internal child components are usually fine because the parent passes the defaulted value down.

## 4. Effects and lifecycle

### 4.1 Two phases

```jsx
createEffect(
  () => props.theme, // compute: tracks, returns the value
  (theme) => { // apply: untracked, may return a cleanup
    document.documentElement.dataset.theme = theme
    return () => { /* cleanup for the previous value */ }
  },
)
```

`apply` runs on every `compute` run, including the first, unless `{ defer: true }` is passed. Effects never compare values; put a memo in `compute` when the effect should only run on a derived change.

### 4.2 Setup timing

`onSettled` replaces the `onMount` + `onCleanup` pair and is the recommended tool for one-time DOM work: measuring, and attaching a third-party widget to a ref. Return the cleanup so both halves stay in one block:

```jsx
onSettled(() => {
  const canvas = canvasRef
  if (!canvas) {
    return
  }
  const globe = createGlobe(canvas, config)
  return () => globe.destroy()
})
```

Ref callbacks run untracked and without an owner, so create effects and cleanup in the factory, not in the callback the factory returns. The official two-phase directive keeps the element in a plain `let` and reads it in `apply`, where the ref has already run:

```jsx
function titleDirective(source) {
  let el
  createEffect(source, (value) => {
    if (el) {
      el.title = value
    }
  })
  return (nextEl) => {
    el = nextEl
    el.title = source()
  }
}
```

Reading `() => el` in `compute` is the mistake: compute runs before the ref callback, captures `undefined` once, and has no dependency to re-run on.

When the element itself has to be reactive — re-observing a replaced node — store it in a signal and read that in compute:

```text
const [el, setEl] = createSignal()
createEffect(() => el(), (node) => { /* ... */ })
<div ref={setEl} />
```

This port uses that shape in `createInView`, which takes an `Accessor<Element | null | undefined>`. It is a valid two-phase effect but not an official recommendation for refs — the official examples use a plain `let`. The type cannot tell a signal getter from `() => letEl`, so a wrong call compiles and silently observes nothing; the contract lives in the helper's JSDoc.

### 4.3 The SSR boundary is not symmetric

- `createEffect` evaluates **compute** on the server (`serverEffect`) and calls `apply` with `undefined`, so the side effect never runs. DOM access in compute needs a `typeof document === 'undefined'` guard; DOM work in apply needs none.
- `onSettled` and `createTrackedEffect` are no-ops on the server.
- Compute runs on the server, so a read that produces JSX elements — an array of icon nodes held in a prop — creates them there, outside the client's hydration walk. The page fills with hydration key mismatches and the server reports no error. Keep element-producing reads out of compute; subscribe to a scalar derived from the value instead.

A server-side throw inside a component is reported as `Unable to render <Component>`, and that subtree renders as nothing.

### 4.4 `createTrackedEffect` and cleanup

`createTrackedEffect` keeps tracking and the side effect in one callback. It is marked **`@deprecated` / "Do not use in new code"** and retained solely to ease 1.x migration. The mark is only in the dev build's JSDoc, not in `signals.d.ts`, so neither `tsc` nor an editor flags existing calls. Replace it by intent:

| Shape | Use |
| --- | --- |
| one-time DOM / observer / animation setup with no reactive reads | `onSettled(() => { ...; return cleanup })` |
| side effect following reactive state | `createEffect(compute, apply)` |

For the two-phase form, `compute` must read **every** dependency unconditionally. 1.x tracked reads inside branch bodies and synchronous child callbacks, so copying that structure into compute silently drops subscriptions. A superset is safe — an extra run is undone by the previous cleanup — while a missing dependency is a silent regression. Read from `apply`'s argument, not from accessors.

`STRICT_READ_UNTRACKED` in the dev build means a reactive read landed in apply: *"Reactive value ... read directly in an effect callback will not update. Move it into a tracking scope."* Rewrite the read as a parameter read. Wrapping the body in `untrack(...)` silences the warning and keeps the hazard, so a later read added without a matching compute entry never updates and never warns.

`untrack` is legitimate in three places:

- a value in apply that must **not** become a dependency — start gates. Subscribing to `hasStarted()` would make `setHasStarted(true)` re-run the effect that just decided to start:

  ```text
  if (untrack(() => hasStarted())) return
  ```

- a one-time snapshot inside a `<For>` / `<Show>` callback (see 4.6).

- a value that has to exist **before the first render or before a constructor runs**, where an effect cannot help because effects run after render: a signal's initial value, options passed to a primitive or an animation library (`createSpring`, `createInView`), a context provider's `value`.

For the third case, ask first whether an effect already owns that value. If it does, the body read is redundant — the effect's first apply assigns the same value — so delete the read instead of wrapping it (`retro-grid` seeds its GL uniforms from constants for exactly this reason). Only when nothing else supplies the value is `untrack` the honest marker.

Two other places where reads are *runtime*-safe but still reported, so decide deliberately rather than by ear:

- rAF / timer / observer callbacks are not tracking scopes at runtime, but the lint rule still flags a function that contains reactive reads and is never handed to a tracked scope. Reading per frame is the correct design when a change must not rebuild the loop, so wrap those reads in `untrack` to state the intent.
- a one-shot read inside `onSettled` needs no `untrack`: the rule does not treat the callback as a tracking scope, and the read takes the value as it is when setup runs.

The lint exemption for snapshot variables keys off the **prop name** (`initial*`, `default*`, `static[A-Z]`), not the local variable name. Public component APIs cannot be renamed to satisfy a linter, which is why the third case above ends up as `untrack` rather than a rename.

`onCleanup` is not removed, but in user code it is rare. The type documentation reserves it for library and custom-primitive internals (`createRoot` bodies, `runWithOwner`); component-level teardown belongs in `onSettled` with a returned cleanup. It is a hard error inside `createTrackedEffect` / `onSettled` (`CLEANUP_IN_FORBIDDEN_SCOPE`) and in an effect's apply phase (`NO_OWNER_CLEANUP`).

**`return` ends the function.** `onCleanup(...)` was a statement, so code after it still ran; replacing it mechanically with `return () => { ... }` makes every following statement unreachable. Always put the returned cleanup last. Nothing catches this — no type error, no diagnostic, no SSR difference. One component unmounted its overlay from `animation.finished.then(...)`; with that line swallowed, a transparent `position: fixed; inset: 0; z-index: 50` layer stayed in the DOM, so the dialog opened once and every later click was absorbed by the invisible layer.

### 4.5 Writes go in event handlers or `onSettled`

Writing a signal from a component body, or from the compute phase of an effect or memo, throws in the dev build. `untrack` does not exempt a write, and neither does indirection: a child calling a parent-provided `register()` in its own body is writing from a component body. Make the registration side-effect free and publish once:

```jsx
let count = 0
const registerItem = () => count++ // no signal write
const [childrenCount, setChildrenCount] = createSignal(0)
onSettled(() => {
  setChildrenCount(count)
})
```

### 4.6 A `<For>` / `<Show>` callback is an owner, not a tracking scope

In 1.x a control-flow callback could read a signal and take a snapshot; it was rarely what you wanted, but it was silent. In 2.0 the callback body is an owner, so the same read freezes at first render and the dev build reports `STRICT_READ_UNTRACKED`. `ref` callbacks behave the same way.

JSX inside the callback is still a tracking scope: `{index()}` in a style object subscribes normally. Only reads in the function body and in ref callbacks are snapshots. Two repairs, in order of preference:

```text
// 1. derive the data in a memo, iterate over plain data
const tiles = createMemo(() => points().map(p => ({ p, offset: pickOffset(p, geometry().xStep) })))
<For each={tiles()}>{(tile) => <circle cx={tile.p.x + tile.offset} />}</For>

// 2. when the read really is a one-time snapshot, say so
ref={(el) => { if (untrack(index) === 0) firstEl = el }}
```

### 4.7 Do not create owners inside an effect

Reading a prop whose value is JSX creates the components it names. Inside `createTrackedEffect`, `onSettled` or an effect callback the dev build throws `PRIMITIVE_IN_FORBIDDEN_SCOPE`, and the throw halts the whole reactive system (`REACTIVITY_HALTED`), so every later update on the page stops and the failure surfaces as a hydration error rather than as the offending component. A component that accepts `JSX.Element[]` and paints to canvas is the usual victim: the lazy prop getter defers creation until the effect reads it.

Render the array into a hidden host and read the nodes back:

```jsx
<div ref={setIconHost} style={{ display: 'none' }} aria-hidden="true">{props.icons}</div>
```

That fixes both halves at once: the elements are created on the render path, where a component owner is legal, and they are part of the server output, so hydration keys line up. Creating them earlier in the component body looks like a fix and is not one — the server renders elements the client never hydrates.

## 5. Third-party packages

### 5.1 Audit a dependency before trusting it

```bash
grep -rhoE "from ['\"]solid-js[^'\"]*['\"]" node_modules/<pkg>/dist | sort | uniq -c
```

A package that imports `solid-js/web` is compiled against 1.x. Prefer a 2.x-ready release; when none exists, it needs the subpath alias from 1.4 and possibly an API shim.

### 5.2 Kobalte 2.x: namespace objects lost their parts

`Button` is `ButtonRoot`, and `Accordion` is `Object.assign(AccordionRoot, {...})`. `Button.Root`, `Accordion.Root` and `Tooltip.Root` are `undefined`, so 1.x-style namespace usage renders nothing. Import the parts directly, or keep the call sites with a namespace import:

```jsx
import { Content, Portal, Root, Trigger } from '@kobalte/core/tooltip'
import * as TooltipPrimitive from '@kobalte/core/tooltip' // also works
```

### 5.3 Prefer a 2.x-ready release instead of shimming

`lucide-solid@1.70.0` is compiled against Solid 1: its files import `solid-js/web`, and the icon component calls `splitProps`, so keeping it needs both the aliases from 1.4 and a package-scoped shim. `@lucide/solid` declares `solid-js: ^2.0.0-rc.0` as a peer and imports only `spread`, `mergeProps`, `insert`, `createComponent`, `Dynamic` and `template` from `@solidjs/web`, plus `omit` from `solid-js`. Switching to it removes the aliases and the shim.

Two consequences survive the switch:

- **The `solid` condition still decides whether the package works on the server** (1.3). Its compiled `dist/esm/*.mjs` calls `template()` at module scope and throws under SSR; the condition resolves to `dist/source/*.jsx`, which the project's compiler handles. Both integrations inject it, so no config change is needed.
- **Legacy names are still exported, but marked deprecated.** Prefer canonical names: `XIcon` → `X`, `FileIcon` → `File`, `FolderIcon` → `Folder`, `FolderOpenIcon` → `FolderOpen`, `Home` → `House`, `TriangleAlert` → `TriangleExclamationPoint`. If a component already exports one of those names — a `File` / `Folder` tree, for example — alias the icon import (`import { File as FileIcon }`) rather than renaming the component.

`components.json`'s `iconLibrary: "lucide"` is a shadcn label, not a package name, and needs no change. Registry item `dependencies` do name the package, so they change with the migration.

## 6. Verification

Type checking proves the code compiles, not that it behaves. Four layers did the work here, in increasing cost:

| Layer | Method | Catches | Misses |
| --- | --- | --- | --- |
| Type check | `tsc --noEmit` | API misuse, type import moves | everything about behaviour |
| Server render diff | Render one probe page on the 1.x baseline and the 2.x port, normalize, compare byte for byte | structure drift, lost attributes, class changes, wrong conditionals and `For` repetition | effect timing, leaks, hydration, post-interaction DOM |
| Interaction diff | Drive both versions in a real browser, compare state probes and the DOM before and after clicks | click handling, open/close state, counters, theme switches, console errors | canvas and animation output |
| Runtime audit | Load every route in a real browser against the dev build; collect diagnostics, page errors and rejected resources | halted reactivity, forbidden scopes, untracked reads, hydration mismatches, broken canvases | anything only visible after interaction |

Above them, `astro build` prerenders every route — the only layer that catches module-scope problems, because the failure happens while importing a module rather than while rendering a component.

Baseline: a second worktree at the commit before the migration, rendering the same temporary probe component, so any difference comes from the runtime rather than the markup. The first three layers all passed while nine components were still broken in the browser; the runtime audit found them, and it is not optional.

### 6.1 Normalize only what is provably noise

Strip hydration markers (`_hk`, `data-hk`), `data-solid-render-id`, the `<astro-island>` wrapper, ordering and whitespace inside `class`, `attr=""` versus `attr`, and `script` / `style` content. Renumber `createUniqueId` values by first appearance rather than deleting them, so id and reference relationships still have to match. Anything else is a real difference.

### 6.2 Failure modes of the harness itself

- **Coordinate clicks drift** during layout animation. Click the element directly when the handler, not hit testing, is under test.
- **Zero diff does not mean tested.** If both sides fail to respond because hydration has not finished, the comparison passes. Give each probe an expected value and a retry loop that records how many attempts it took.
- **Canvas output needs pixel sampling.** A correctly sized canvas can still be blank; count non-transparent pixels across two samples.
- **A silent console listener is suspicious.** Wait for a hydrated selector, use a fresh page per route, and keep one known-dirty page as a control. A fixed 2.5 s wait missed every diagnostic on a page that needed 3.5 s; a reused tab pool stopped delivering console events after about eighty pages, which reads as "no errors".
- **Nothing reports unreachable code.** A returned cleanup that swallowed the next statement produced no diagnostic on any audited route. Only state assertions see it — assert that close really removes the layer.

### 6.3 The dev build reports what the build cannot

Production drops the diagnostics; the dev build throws or warns on them. Five codes cover every failure this migration produced:

| Code | Meaning | Repair |
| --- | --- | --- |
| `CLEANUP_IN_FORBIDDEN_SCOPE` | `onCleanup` inside `createTrackedEffect` / `onSettled` | return the cleanup |
| `NO_OWNER_CLEANUP` | `onCleanup` in a callback with no owner (an effect's apply phase) | return the cleanup |
| `REACTIVE_WRITE_IN_OWNED_SCOPE` | signal write in a component body or computation | move it to `onSettled` / a handler (4.5) |
| `PRIMITIVE_IN_FORBIDDEN_SCOPE` | component or reactive primitive created inside an effect | create it on the render path (4.7) |
| `STRICT_READ_UNTRACKED` | reactive read outside a tracking scope | derive in a memo, or mark the read `untrack` (4.4, 4.6) |

`REACTIVITY_HALTED` is not a sixth problem: it is what the runtime does after any of the above throws. Fix the throw, not the halted state.

### 6.4 Lint configuration is version-aware

The official Solid 2 templates ship `eslint-plugin-solid/configs/v2`. It sets `settings.solid.version = 2`, which changes what the version-aware rules (`reactivity`, `imports`, `no-unknown-namespaces`, `event-handlers`, `jsx-no-undef`) report, and enables the 2.0-only rules (`removed-api`, `no-single-arg-create-effect`, `no-write-in-pure-computation`, `no-accessor-as-prop`, `no-store-mutation-outside-setter`, the server-function rules). A preset that only enables the old rule set reports none of the 2.0-specific problems.

When reusing a general-purpose preset, check that it does not resolve an older `eslint-plugin-solid` through its own peer dependency, and that its autofixes cannot emit removed APIs (`mergeProps`, `splitProps`, `<Index>`). `eslint-plugin-solid` 0.19.0 fixed those autofixes under `version = 2`; earlier versions can write 1.x code back into a 2.0 source tree during `--fix`.

## 7. Per-component checklist

1. Move type imports that belong to `@solidjs/web`.
2. Replace the `mergeProps` + `splitProps` pair with `props.x ?? default` plus `omit`. Carry over **every** key from the old defaults object (3).
3. Classify each `createEffect`: reactive dependency → compute/apply; one-shot DOM setup → `onSettled` or a ref directive with a plain `let`; DOM access in compute → keep the `document` guard. Never put `() => el` over a plain `let` in compute (4.2).
4. Replace `on(dep, fn)` with `createEffect(() => dep(), fn, { defer })`, matching the original defer flag.
5. Replace `<Index>` with `<For keyed={false}>`.
6. Turn every `onCleanup` inside an effect scope into a returned cleanup, and put that `return` last — anything after it is dead code (4.4).
7. Check `<For>` / `<Show>` / `ref` callbacks for reactive reads in the function body; derive in a memo or mark them `untrack` (4.6).
8. Check every prop that carries JSX: it must be created on the render path (4.7).
9. Put the component on a throwaway probe page, run `tsc` and lint, then the render diff, the interaction diff and the dev-build audit (6). The probe page is scaffolding: delete it before committing, or it ships as a route.
10. Run `astro build` — the only layer that catches module-scope failures.

## 8. Upstream logic worth re-reading

Porting code is not the same as copying its lifecycle. Three 1.x behaviours are worth confirming before carrying them over:

- **Canvas sizing can be self-referential.** A `height: 100%` canvas inside a container whose height the canvas determines, written back from `container.offsetHeight`, is a feedback loop whose result depends on how many passes run. Give the container an explicit height.
- **`ResizeObserver` on such a container never settles.** It fires on the size it just caused. Observe a container whose size does not depend on the child, or listen to `window.resize`.
- **A measurement right after mount can be early.** Styles and fonts may not have settled, so an offset read there can be a few pixels short. Defer the first read by one frame.

Also check for an init function that repopulates the same collection its caller then repopulates again.

## 9. Not verified

The audit proves every route loads, hydrates and runs without a diagnostic. It does not prove the components still look or behave right under interaction.

Exercised: every component route against the dev build; five components with positive assertions (file-tree expand/select, terminal line-by-line reveal, dither-field WebGL output, scroll-based-velocity frames, hero-video-dialog open/close/reopen) on both the 1.x baseline and the 2.x port; one hand-written probe page compared byte for byte (temporary, not kept in the repository).

Not covered:

- **Visual regression.** A pixel diff was considered and not built; it is worth doing for deterministic static components, excluding canvas and rAF-driven ones by construction.
- **Interaction beyond those five.** The remaining components have load-time guarantees only.
- `Dynamic` replacement (`solid-js` exports `dynamicComponent`; `@solidjs/web` still exports one), `Suspense` / `ErrorBoundary` replacements (`Loading`, `Errored`), `createResource` (one component rebuilt with signal + effect; the async-memo route was not tried), transitions (`useTransition`), stores and SolidStart.

## Appendix: tooling in this repository

| Path | Purpose |
| --- | --- |
| `scripts/smoke.ts` | Load every component route in a real browser; collect console and page errors |
| `scripts/smoke-preview.ts` | Build, start the preview server, then run the smoke sweep against it |
| `scripts/find-cleanup-scope.mjs [--json]` | AST scan for `onCleanup` inside forbidden effect scopes |
| `scripts/find-dead-after-cleanup.mjs` | AST scan for statements made unreachable by a returned cleanup |

```bash
nub run smoke -- --url http://localhost:4321
nub run smoke:preview
```

`playwright-core` drives a system Chrome or Edge and does not download a browser; `SMOKE_BROWSER_CHANNEL` and `SMOKE_CHROME_PATH` select the binary. The diagnostic audit only means something against the dev build, because production drops the diagnostics; `smoke:preview` is the separate check for runtime errors in the shipped bundle.

Two conditions the audit depends on: wait for a hydrated selector rather than a fixed delay, and use a fresh page per route. A reused pool stops delivering console events after about eighty pages, which reads as "no errors".
