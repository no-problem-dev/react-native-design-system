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

This package imports no platform effect. An adapter passes in a `MaterialAdapter` — the
capabilities it found and a renderer to use — and without one everything degrades to fills.
That is what lets it install into a project that has none of those libraries.

## Development

```sh
pnpm install
pnpm verify     # purity, build, typecheck, test
```

## Licence

MIT
