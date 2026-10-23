import { colors } from '@clavis-via/shared'
import { THEME_VARIABLES } from '../../constants/theme.constant'

type PaletteValue = string | readonly unknown[] | { readonly [key: string]: PaletteValue }

function toKebabCase(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

// Flattens the palette into CSS declarations: `navy` -> `--color-navy`, `emotions.atPeace.tile` ->
// `--color-emotions-at-peace-tile`. Gradient stops (arrays) are not single colors and stay out.
function toDeclarations(prefix: string, value: PaletteValue): string[] {
  if (typeof value === 'string') {
    return [`${prefix}: ${value};`]
  }
  if (Array.isArray(value)) {
    return []
  }
  return Object.entries(value as { readonly [key: string]: PaletteValue }).flatMap(
    ([key, nested]) =>
      toDeclarations(`${prefix}${THEME_VARIABLES.SEPARATOR}${toKebabCase(key)}`, nested),
  )
}

const THEME_CSS = `${THEME_VARIABLES.ROOT_SELECTOR} {${toDeclarations(
  THEME_VARIABLES.COLOR_PREFIX,
  colors,
).join('')}}`

// Writes the shared palette on :root as CSS variables, so the app and the web have a single source of colors.
// Tailwind's tokens (see styles/global.css) read these variables.
export function ThemeVariables() {
  return <style>{THEME_CSS}</style>
}
