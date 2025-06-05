import React, { type FC } from "react"

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

export type TitleEmbossedProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: HeadingTag
  children: React.ReactNode
  shadowStart?: string // e.g. "hsl(174,5%,80%)"
  shadowEnd?: string // e.g. "hsl(174,5%,60%)"
  minShadowDifference?: number // minimum difference in lightness (default: 10)
}

function hexToRgb(hex: string) {
  let c = hex.replace("#", "")
  if (c.length === 3)
    c = c
      .split("")
      .map(x => x + x)
      .join("")
  const num = parseInt(c, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function parseColor(str: string) {
  str = str.trim()
  // Hex
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(str)) {
    const { r, g, b } = hexToRgb(str)
    return { ...rgbToHsl(r, g, b), a: 1 }
  }
  // hsla()
  let m = str.match(/hsla\(\s*(\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\s*\)/i)
  if (m) return { h: +m[1], s: +m[2], l: +m[3], a: +m[4] }
  // hsl()
  m = str.match(/hsl\(\s*(\d+),\s*([\d.]+)%,\s*([\d.]+)%\s*\)/i)
  if (m) return { h: +m[1], s: +m[2], l: +m[3], a: 1 }
  // rgba()
  m = str.match(/rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)/i)
  if (m) return { ...rgbToHsl(+m[1], +m[2], +m[3]), a: +m[4] }
  // rgb()
  m = str.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/i)
  if (m) return { ...rgbToHsl(+m[1], +m[2], +m[3]), a: 1 }
  return null
}

function hslToString({ h, s, l, a }: { h: number; s: number; l: number; a?: number }) {
  if (a !== undefined && a < 1) return `hsla(${h},${s}%,${l}%,${a})`
  return `hsl(${h},${s}%,${l}%)`
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function generateTextShadow(start: string, end: string, minDiff: number = 10) {
  const startHSL = parseColor(start)
  const endHSL = parseColor(end)
  let shadowStart = start
  let shadowEnd = end
  let startAlpha = 1
  let endAlpha = 1

  if (startHSL && endHSL) {
    let s = startHSL
    let e = endHSL
    if (s.l < e.l) {
      ;[s, e] = [e, s]
    }
    if (s.l - e.l < minDiff) {
      e = { ...e, l: Math.max(0, s.l - minDiff) }
    }
    shadowStart = hslToString(s)
    shadowEnd = hslToString(e)
    startAlpha = s.a ?? 1
    endAlpha = e.a ?? 1
  }

  const steps = 8
  const shadows = []
  for (let i = 1; i <= steps; i++) {
    const ratio = i / steps
    const alpha = lerp(startAlpha, endAlpha, ratio)
    shadows.push(`0 ${i}px 0 color-mix(in srgb, ${shadowStart} ${100 - ratio * 100}%, ${shadowEnd} ${ratio * 100}%)`)
  }
  shadows.push(
    "0 0 5px rgba(0,0,0,0.2)",
    "0 1px 3px rgba(0,0,0,0.25)",
    "0 3px 5px rgba(0,0,0,0.25)",
    "0 5px 10px rgba(0,0,0,0.25)",
    "0 10px 10px rgba(0,0,0,0.25)",
    "0 20px 20px rgba(0,0,0,0.35)",
  )
  return shadows.join(",\n  ")
}

export const TitleEmbossed: FC<TitleEmbossedProps> = ({
  as: Component = "h1",
  style,
  children,
  shadowStart = "hsl(174,5%,80%)",
  shadowEnd = "hsl(174,5%,60%)",
  minShadowDifference = 10,
  ...rest
}) => (
  <Component
    style={{
      textShadow: generateTextShadow(shadowStart, shadowEnd, minShadowDifference),
      ...style,
    }}
    {...rest}
  >
    {children}
  </Component>
)
