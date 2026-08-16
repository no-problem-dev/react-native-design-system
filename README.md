# react-native-design-system

A design system for React Native where components are asked for an **intent**, and each
platform answers with the material it actually has.

```tsx
<Surface elevation="overlay" padding="lg">
  <Button variant="primary" onPress={submit}>Send</Button>
</Surface>
```

On a device that draws a glass material, a surface that overlays content is glass. Where
the reader turned transparency down, or the platform has nothing to offer, it is a fill
with the shadow that reads as the same height. The caller writes one thing.

The companion of [`swift-design-system`](https://github.com/no-problem-dev/swift-design-system):
same token values, same colour roles, so an app that ships both platforms looks like one product.

## Status

Early. Tokens, theming and two components (`Surface`, `Button`) are in place, and the
architecture they establish is the point — the remaining components follow the same shape.

## Install

```sh
pnpm add @no-problem/design-system
```

`react` and `react-native` are peer dependencies. Nothing else is required: with no platform
adapter installed, every surface falls back to a plain fill that works anywhere, including
on the web.

## Use

```tsx
import { ThemeProvider, Surface, Button } from '@no-problem/design-system'

export default function App() {
  return (
    <ThemeProvider colorSource="auto">
      <Surface elevation="raised" padding="lg" radius="md">
        <Button variant="primary" onPress={() => {}}>Continue</Button>
      </Surface>
    </ThemeProvider>
  )
}
```

### Where colours come from

`colorSource` is a product decision, so it is yours to make:

| Value | Behaviour |
| --- | --- |
| `brand` | Always the colours this package ships. The product looks the same on every device. |
| `dynamic` | Colours the platform supplies. On Android those follow the wallpaper. |
| `auto` | Dynamic when offered, brand otherwise. The default. |

## How it is put together

### Tokens come in three layers

Primitive values feed semantic ones (`spacing.lg`, `scheme.light.surface`), which feed
component ones. **Only the semantic layer is exported.** The primitives are generated —
the build needs them to resolve aliases — but they are not reachable from the public API.
A layer that cannot be reached is a stronger rule than a layer that should not be used.

The source is [DTCG](https://tr.designtokens.org/) JSON, built by Style Dictionary into
TypeScript constants, a Tailwind preset, and CSS custom properties. One definition, three
consumers. A test pins the generated values against what the Swift implementation publishes,
so the two cannot drift apart quietly.

### Components split at the material

Every component is two pieces:

```
Surface/
├─ SurfaceCore.tsx   everything it looks like — no platform APIs at all
└─ Surface.tsx       reads the theme, resolves a material, hands it to the core
```

`resolveMaterial()` returns a plain value describing what to draw. That has a practical
consequence: because the material is data, both platforms' outcomes can be rendered side by
side in one browser window. What is left for a real device is only whether the platform
truly offered glass — a handful of screenshots rather than a whole suite.

### Capabilities, not versions

The resolver never asks which operating system it is on. It asks what the platform offers,
in order:

1. The surface is part of the page → a fill with the shadow that matches its height.
2. The reader asked for less transparency → an opaque fill wins, always.
3. The platform offers glass → glass, interactive only if it said so.
4. Otherwise → a fill.

Version checks get this wrong twice: a version can ship without the interface, and a reader
can turn the effect off regardless of what the hardware supports.

Step 1 is not a capability question, and it was learned from a device — see *Testing* below.

### Adapters supply the platform, not the package

The design system imports no platform effect. An adapter passes in a `MaterialAdapter` —
the capabilities it found and a renderer to use — and without one everything degrades to
fills. That is what lets it install into a project that has none of those libraries.

`@no-problem/design-system-expo` is that adapter for Expo:

```tsx
import { DesignSystemProvider } from '@no-problem/design-system-expo'

export default function App() {
  return (
    <DesignSystemProvider colorSource="auto">
      <Surface elevation="overlay" padding="lg">…</Surface>
    </DesignSystemProvider>
  )
}
```

It is also the only place in the repository that splits by platform, and each file is a
few lines long:

```
platform.ios.tsx      asks whether glass exists, and renders it
platform.android.tsx  takes the palette the device derived from its wallpaper
platform.tsx          everywhere else: offers nothing
```

Those files *decide*. They do not draw. Anything longer belongs in the shared core, where
it can be seen in a browser — which is the whole reason the split sits this low.

### The chrome belongs to the platform, not to the app

A tab bar drawn in JavaScript can be made to look like either platform and will
still be neither. iOS 26 draws a material behind its bar that shrinks as you scroll
and animates the selection like a drop of water; Android draws a Material 3 bar with
a selection pill and a ripple. Both handle hit testing, the screen reader and text
scaling. None of that is styling, and none of it is reachable from a view you drew.

```tsx
<NavigationTabs
  tabs={[
    { name: 'index', label: 'Home', icon: 'home' },
    { name: 'search', label: 'Search', icon: 'search' },
  ]}
/>
```

`icon` is an idea, not a glyph. The package keeps the table that turns `favorite`
into `heart.fill` on one platform and `favorite` on the other, typed against both
real glyph sets so a name that does not exist fails to compile. Colours come from
the theme, so a product that changed its accent changed its tab bar with it.

The one platform difference that matters is who owns the background: iOS draws its
own material and painting a colour over it opts the app out; Android expects the app
to supply the surface. `resolveTabBar` is that decision, as a plain value, tested
without a device like everything else.

Three colour roles have no platform equivalent: warning, success and info are product
ideas, not platform ones. They keep the values this package ships even in `dynamic` mode,
so a device looks like itself while the product still says "this went wrong" in the colour
it always uses.

## Copying instead of depending

Some projects should not carry a dependency on a package one person controls. A fix
they need would wait on someone else's review, and that is a poor thing to hand a team
that has to ship. For those, copy the source in:

```sh
npx @no-problem/design-system-cli add surface button --dest src/design-system
```

Whatever an item needs comes with it, imports are rewritten to point at the copied
files, and the result compiles on its own — no dependency on this package at all.
Files you have already changed are left alone unless you pass `--force`.

The weakness of copying is that upstream fixes never arrive. That is what `diff` is for:

```sh
npx @no-problem/design-system-cli diff surface button --dest src/design-system
```

It reports which files have moved apart, so taking a change or leaving it is a choice
rather than an oversight. Each copied file carries one line naming the version it came
from — no paths, no accounts, no links, because the file is going to live in someone
else's repository.

File extensions are dropped from relative imports on the way out. The source writes
`'./types.js'` because it is published as ESM and compiled first; a copy has no build
step and joins the receiving project's own module graph, where that names a file which
does not exist. Bundlers forgive it. Test runners do not — and the first copy into a
real project found exactly that, one runner in.

## Testing

The catalog under `apps/catalog` is the test suite. Every story runs in a real
browser through Vitest, with the accessibility rules applied to each one. There is
no second suite to keep in step — writing the catalog *is* writing the regression
tests.

Splitting components at the material was done for this. Measured on what is here now:

| Path | Where it can be checked |
| --- | --- |
| Layout, spacing, radii, every variant and state | Browser |
| Colour contrast, roles, focus, labels | Browser |
| **The glass outcome, rendered from its resolved value** | **Browser** |
| **The fill outcome, at every height** | **Browser** |
| Whether the platform truly offers glass | Device only |
| Platform-supplied colours | Device only |
| Native shadow and tonal elevation fidelity | Device only |

Every rendering path is reachable without a device. What is left for a real one is
capability detection and platform fidelity — a handful of screenshots rather than a
whole suite.

`apps/example` is that handful. It prints what the device answered and then draws
every surface and button below it, so one screenshot settles both questions at once.

### What the device said that the browser could not

Running it on iOS 27 confirmed the ladder — glass available, interactive, renderer
supplied — and surfaced something no browser would have shown:

**A glass surface over a plain background is almost invisible.** The material works by
refracting what sits behind it, and a flat page gives it nothing to refract, so every
raised surface came out the same tone as the page and the sense of height vanished.

That changed the design rather than the code around it. Glass is now used only for
`overlay` — the one intent that means "this sits over other content" — and everything
in the page flow is a fill with the shadow that matches its height. The vocabulary
already knew which surfaces float; the device is what made that worth acting on.

Contrast is checked twice: by the accessibility rules in the browser, which is the
honest check, and by a unit test over every appearance, variant and size, which runs
in milliseconds and names the exact pair that broke.

```sh
pnpm --filter catalog dev     # open the catalog
pnpm --filter catalog test    # run the stories as tests
```

## Development

```sh
pnpm install
pnpm --filter catalog exec playwright install chromium
pnpm verify     # purity, build, typecheck, test, packaging
```

## Licence

MIT
