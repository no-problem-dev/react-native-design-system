/**
 * Turn a product's own token values into the forms a React Native toolchain reads.
 *
 * A product decides what its values are. This decides how those values reach each
 * consumer, because the consumers do not agree on a format:
 *
 *   TypeScript              wants a module, and wants the values typed
 *   Tailwind / NativeWind   is plain Node, and cannot read a TypeScript module
 *   the running app         needs colours that follow the appearance without every
 *                           screen that named one having to re-render
 *
 * That last consumer is why colours leave here as **CSS variables** rather than as
 * literals in the Tailwind theme. A literal is fixed when the stylesheet is built, so
 * a class like `bg-surface` would keep its light value in the dark; a variable is
 * resolved against `prefers-color-scheme`, which React Native reports from the OS.
 * Anything that does not change with the appearance — radii, font families — stays a
 * literal, because a variable buys nothing there and costs a level of indirection.
 *
 * CommonJS, and `.cjs` rather than `.js`, so that the same file can be read by a
 * Tailwind config, by a build script, and by a test runner without any of them
 * having to agree on a module system first.
 */

/** @typedef {Record<string, string>} Colors */

/**
 * @typedef {object} Brand
 * @property {Record<string, string>} [fonts]           Font family names.
 * @property {Record<string, string>} [radiusRoles]     Role name → a step in the radius scale.
 * @property {{ light: Colors, dark: Colors }} scheme   Overrides of the design system's colour roles.
 * @property {{ light: Colors, dark: Colors }} [product] Colours the design system has no role for.
 */

const HEADER = "// Generated from the brand tokens — do not edit by hand.";
const CSS_HEADER = "/* Generated from the brand tokens — do not edit by hand. */";

/** A colour that carries its own alpha cannot also take an alpha modifier. */
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * `#RRGGBB` as the three numbers Tailwind's `<alpha-value>` syntax needs.
 *
 * Returns null for anything else — a colour given as `rgba(…)` already has an alpha
 * of its own, and splitting it apart to re-attach a second one would change it.
 */
function rgbChannels(value) {
  if (!HEX.test(value)) return null;
  const hex = value.slice(1);
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)).join(" ");
}

/** camelCase → kebab-case, for the names Tailwind puts in a class. */
function kebab(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function assertSameKeys(a, b, what) {
  const missing = Object.keys(a).filter((k) => !(k in b));
  const extra = Object.keys(b).filter((k) => !(k in a));
  if (missing.length || extra.length) {
    throw new Error(
      `${what}: light and dark must name the same colours ` +
        `(dark is missing ${JSON.stringify(missing)}, and has extra ${JSON.stringify(extra)})`,
    );
  }
}

/**
 * Every colour this brand names, for one appearance.
 *
 * The design system's roles and the product's own colours share one namespace: a
 * class name cannot say which of the two it came from, so a collision between them
 * would silently resolve to whichever was merged last. Refuse it instead.
 */
function colorsFor(brand, appearance) {
  const scheme = brand.scheme[appearance] ?? {};
  const product = brand.product?.[appearance] ?? {};
  const clash = Object.keys(product).filter((k) => k in scheme);
  if (clash.length) {
    throw new Error(`the product re-uses colour names the scheme already has: ${clash.join(", ")}`);
  }
  return { ...scheme, ...product };
}

/**
 * What a Tailwind config needs: the theme it extends, and the base rules that give
 * the variables their values.
 *
 * `base` is written as a nested object rather than a stylesheet because that is what
 * Tailwind's `addBase` takes, which keeps the variables inside the config the app
 * already loads. A separate `.css` file would need the CSS pipeline to resolve an
 * `@import`, which is one more thing that can be configured wrongly and fail quietly.
 *
 * @param {Brand} brand
 * @param {Record<string, number>} radiusScale The design system's radius steps, in px.
 */
function tailwindArtifacts(brand, radiusScale) {
  assertSameKeys(brand.scheme.light, brand.scheme.dark, "scheme");
  if (brand.product) assertSameKeys(brand.product.light, brand.product.dark, "product");

  const light = colorsFor(brand, "light");
  const dark = colorsFor(brand, "dark");

  const variables = (colors) =>
    Object.fromEntries(
      Object.entries(colors).map(([name, value]) => [
        `--color-${name}`,
        rgbChannels(value) ?? value,
      ]),
    );

  const colors = Object.fromEntries(
    Object.entries(light).map(([name, value]) => [
      name,
      rgbChannels(value) ? `rgb(var(--color-${name}) / <alpha-value>)` : `var(--color-${name})`,
    ]),
  );

  const borderRadius = Object.fromEntries(
    Object.entries(brand.radiusRoles ?? {}).map(([name, step]) => {
      const px = radiusScale[step];
      if (px === undefined) throw new Error(`radius role "${name}" names a step that does not exist: ${step}`);
      return [name, `${px}px`];
    }),
  );

  const fontFamily = Object.fromEntries(
    Object.entries(brand.fonts ?? {}).map(([name, family]) => [kebab(name), [family]]),
  );

  return {
    theme: { colors, borderRadius, fontFamily },
    base: {
      ":root": variables(light),
      "@media (prefers-color-scheme: dark)": { ":root": variables(dark) },
    },
  };
}

/**
 * The same values as a TypeScript module.
 *
 * Literals, not an import of the JSON: a JSON import is resolved differently by
 * every bundler in this ecosystem — some hand back the object, some wrap it in a
 * `default` — and a module that reads its own values needs no such agreement.
 *
 * @param {Brand} brand
 */
function typeScriptModule(brand) {
  const literal = (value) => JSON.stringify(value, null, 2);
  const decl = (name, value) => `export const ${name} = ${literal(value)} as const;\n`;

  return [
    HEADER,
    "",
    decl("fonts", brand.fonts ?? {}),
    decl("radiusRoles", brand.radiusRoles ?? {}),
    decl("scheme", brand.scheme),
    decl("product", brand.product ?? { light: {}, dark: {} }),
  ].join("\n");
}

/**
 * The Tailwind artifacts as a module a config can require.
 *
 * @param {Brand} brand
 * @param {Record<string, number>} radiusScale
 */
function tailwindModule(brand, radiusScale) {
  const { theme, base } = tailwindArtifacts(brand, radiusScale);
  return [
    CSS_HEADER.replace("/*", "//").replace("*/", "").trimEnd(),
    "",
    `module.exports = ${JSON.stringify({ theme, base }, null, 2)};`,
    "",
  ].join("\n");
}

module.exports = {
  rgbChannels,
  kebab,
  tailwindArtifacts,
  tailwindModule,
  typeScriptModule,
};
