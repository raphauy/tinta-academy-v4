import { emailTheme } from '@/components/emails/email-theme'

/**
 * Fuente única de verdad para el aspecto del contenido de un email.
 *
 * El mismo HTML (el que produce el editor de plantillas) se muestra en tres
 * lugares y los tres tienen que verse igual:
 *
 * 1. El editor de plantillas -> CSS generado con `buildEmailContentCss()`
 * 2. La vista previa         -> HTML procesado con `prepareEmailContentHtml()`
 * 3. El email que recibe el destinatario -> mismo HTML procesado
 *
 * En el email los estilos van inline porque los clientes de correo (Gmail,
 * Outlook) ignoran o recortan las hojas de estilo. En el editor no se puede
 * escribir inline sobre el contenido de TipTap, así que se generan las mismas
 * reglas como CSS a partir de este mismo mapa.
 *
 * Criterio de los estilos: el editor manda. Los párrafos no tienen margen
 * automático, el espacio entre bloques lo da el autor con líneas en blanco
 * (igual que mientras escribe). Por eso los párrafos vacíos se rellenan con
 * `&nbsp;`: sin contenido tendrían altura cero en el email y la línea en
 * blanco que el autor ve en el editor desaparecería.
 */

export const emailContentTypography = {
  color: emailTheme.colors.foreground,
  fontFamily: emailTheme.fonts.sans,
  fontSize: '14px',
  lineHeight: '24px',
} as const

const TAG_STYLES: Record<string, string> = {
  p: 'margin:0;',
  ul: 'margin:0;padding-left:24px;list-style-type:disc;',
  ol: 'margin:0;padding-left:24px;list-style-type:decimal;',
  li: 'margin:0;',
  h1: 'margin:0;font-size:22px;line-height:32px;font-weight:700;',
  h2: 'margin:0;font-size:18px;line-height:28px;font-weight:700;',
  h3: 'margin:0;font-size:16px;line-height:26px;font-weight:700;',
  h4: 'margin:0;font-size:15px;line-height:24px;font-weight:700;',
  h5: 'margin:0;font-size:14px;line-height:24px;font-weight:700;',
  h6: 'margin:0;font-size:14px;line-height:24px;font-weight:700;',
  blockquote: `margin:0;padding-left:16px;border-left:3px solid ${emailTheme.colors.border};color:${emailTheme.colors.mutedForeground};`,
  hr: `border:0;border-top:1px solid ${emailTheme.colors.border};margin:16px 0;`,
  a: `color:${emailTheme.colors.primary};text-decoration:underline;`,
  img: 'max-width:100%;height:auto;',
  code: `font-family:${emailTheme.fonts.mono};font-size:13px;`,
  pre: `margin:0;font-family:${emailTheme.fonts.mono};font-size:13px;white-space:pre-wrap;`,
  table: 'border-collapse:collapse;width:100%;',
  th: `padding:6px 8px;border:1px solid ${emailTheme.colors.border};text-align:left;`,
  td: `padding:6px 8px;border:1px solid ${emailTheme.colors.border};`,
}

// Ítems de lista sin contenido: TipTap los deja al presionar Enter y no
// escribir nada. En el editor casi no se notan, pero en el email salen como
// una viñeta suelta.
const EMPTY_LIST_ITEM_RE =
  /<li\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>|<p\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>)*<\/li>/gi

const EMPTY_LIST_RE = /<(ul|ol)\b[^>]*>\s*<\/\1>/gi

const EMPTY_PARAGRAPH_RE = /<p\b([^>]*)>(?:\s|<br\s*\/?>)*<\/p>/gi

const OPEN_TAG_RE = /<([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g

const STYLE_ATTR_RE = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/i

/**
 * Quita basura que el editor deja y que solo se nota en el email:
 * ítems de lista vacíos (viñeta suelta) y listas que quedan sin ítems.
 */
export function cleanEmailContentHtml(html: string): string {
  return html
    .replace(EMPTY_LIST_ITEM_RE, '')
    .replace(EMPTY_LIST_RE, '')
}

/**
 * Deja el HTML del cuerpo listo para enviarse o previsualizarse:
 * lo limpia, preserva las líneas en blanco y aplica los estilos inline.
 *
 * Es una función pura (sirve en el server y en el cliente) para que la vista
 * previa muestre exactamente el mismo HTML que se manda por email.
 */
export function prepareEmailContentHtml(html: string): string {
  if (!html) return ''

  const withoutEmptyItems = cleanEmailContentHtml(html)

  // Un párrafo vacío es una línea en blanco intencional del autor: sin
  // contenido tendría altura cero en el email.
  const withBlankLines = withoutEmptyItems.replace(
    EMPTY_PARAGRAPH_RE,
    (_match, attrs: string) => `<p${attrs}>&nbsp;</p>`
  )

  return applyInlineStyles(withBlankLines)
}

/**
 * Genera las mismas reglas como CSS, para el editor de plantillas.
 * `scope` es el selector del contenedor, por ejemplo `.email-content`.
 */
export function buildEmailContentCss(scope: string): string {
  const root = [
    `color:${emailContentTypography.color}`,
    `font-family:${emailContentTypography.fontFamily}`,
    `font-size:${emailContentTypography.fontSize}`,
    `line-height:${emailContentTypography.lineHeight}`,
  ].join(';')

  const rules = Object.entries(TAG_STYLES).map(
    ([tag, styles]) => `${scope} ${tag}{${styles}}`
  )

  return [`${scope}{${root};}`, ...rules].join('\n')
}

function applyInlineStyles(html: string): string {
  return html.replace(OPEN_TAG_RE, (match, rawTag: string, rawAttrs: string) => {
    const styles = TAG_STYLES[rawTag.toLowerCase()]
    if (!styles) return match

    const trimmed = rawAttrs.trimEnd()
    const selfClosing = trimmed.endsWith('/')
    const attrs = selfClosing ? trimmed.slice(0, -1) : rawAttrs

    return `<${rawTag}${mergeStyleAttribute(attrs, styles)}${selfClosing ? ' /' : ''}>`
  })
}

/**
 * Agrega los estilos base al atributo `style`. Los que ya venían en el HTML
 * quedan después, para que sigan ganando.
 */
function mergeStyleAttribute(attrs: string, styles: string): string {
  const existing = attrs.match(STYLE_ATTR_RE)
  if (!existing) {
    return `${attrs} style="${escapeAttributeValue(styles)}"`
  }

  const previous = (existing[1] ?? existing[2] ?? '').trim()
  const merged = previous ? `${styles}${previous}` : styles

  return attrs.replace(STYLE_ATTR_RE, ` style="${escapeAttributeValue(merged)}"`)
}

/**
 * El valor va dentro de un atributo entre comillas dobles y algunos estilos
 * las usan (por ejemplo `font-family:"IBM Plex Mono"`), así que hay que
 * escaparlas o el atributo se corta a la mitad.
 */
function escapeAttributeValue(value: string): string {
  return value.replace(/"/g, '&quot;')
}
