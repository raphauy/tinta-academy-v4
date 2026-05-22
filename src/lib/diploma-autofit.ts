/**
 * Auto-fit del tamaño de un texto contra un ancho máximo. Se usa tanto en el
 * render Satori (server) como en el preview del editor (client) para que el
 * educador vea exactamente lo que va a salir.
 *
 * Usa una aproximación del ancho medio por carácter en fuentes Latin
 * proporcionales (~0.55 × fontSize en regular, ~0.62 en bold). Es preciso lo
 * suficiente para nombres latinos sin caracteres extremos. Si en el futuro
 * necesitamos exactitud, migrar a `opentype.js` (server-side `getAdvanceWidth`).
 */
export function autoFitFontSize(params: {
  text: string
  baseFontSize: number
  fontWeight: number
  maxWidth: number
  minScale?: number
}): number {
  const { text, baseFontSize, fontWeight, maxWidth, minScale = 0.5 } = params
  if (!text || maxWidth <= 0) return baseFontSize
  const boldFactor = fontWeight >= 600 ? 0.62 : 0.55
  const estimatedWidth = text.length * baseFontSize * boldFactor
  if (estimatedWidth <= maxWidth) return baseFontSize
  const scaled = baseFontSize * (maxWidth / estimatedWidth)
  const minSize = baseFontSize * minScale
  return Math.max(minSize, scaled)
}
