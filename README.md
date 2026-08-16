# react-native-design-system

A design system for React Native where components are asked for an **intent**, and each
platform answers with the material it actually has.

```tsx
<Surface elevation="floating" padding="lg">
  <Button variant="primary" onPress={submit}>Send</Button>
</Surface>
```

On a device that draws a glass material, that surface is glass. Where the reader turned
transparency down, or the platform has nothing to offer, it is a fill with the shadow that
reads as the same height. The caller writes one thing.

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

1. A flat surface needs no material — it is part of the page.
2. The reader asked for less transparency → an opaque fill wins, always.
3. The platform offers glass → glass, interactive only if it said so.
4. Otherwise → a fill with the shadow that matches the intent.

Version checks get this wrong twice: a version can ship without the interface, and a reader
can turn the effect off regardless of what the hardware supports.

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
      <Surface elevation="floating" padding="lg">…</Surface>
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

Three colour roles have no platform equivalent: warning, success and info are product
ideas, not platform ones. They keep the values this package ships even in `dynamic` mode,
so a device looks like itself while the product still says "this went wrong" in the colour
it always uses.

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
refracting what sits behind it, and a flat page gives it nothing to refract, so
`raised`, `floating` and `overlay` come out nearly the same tone as the page and the
sense of height disappears. Only `flat`, which is a fill by definition, reads clearly.

That is a design question rather than a defect: the material is meant to sit over
content. It is open, and listed below.

Contrast is checked twice: by the accessibility rules in the browser, which is the
honest check, and by a unit test over every appearance, variant and size, which runs
in milliseconds and names the exact pair that broke.

```sh
pnpm --filter catalog dev     # open the catalog
pnpm --filter catalog test    # run the stories as tests
```

## Open questions

**How a glass surface should behave over a plain background.** The material needs
content behind it to read as a material at all. Three ways out, none obviously right:
keep a hairline border and a shadow under the glass so height survives either way;
fall back to a fill when there is nothing behind; or say that glass is only for
surfaces that overlay content and leave the rest as fills. The last is closest to what
the platform intends and the furthest from "one component, every situation".

## Development

```sh
pnpm install
pnpm --filter catalog exec playwright install chromium
pnpm verify     # purity, build, typecheck, test, packaging
```

## Licence

MIT
