#!/usr/bin/env node
import fs from "fs"
import colors from "tailwindcss/colors.js"

import { htmlTemplate } from "./htmlTemplate.js"

// flattenColors :: Object -> String -> [{ name, value, keys }]
const flattenColors = (obj, prefix = "", keys = []) =>
  Object.entries(obj).flatMap(([key, val]) =>
    typeof val === "string"
      ? [{ name: prefix ? `${prefix}.${key}` : key, value: val, keys: [...keys, key] }]
      : val && typeof val === "object"
        ? flattenColors(val, prefix ? `${prefix}.${key}` : key, [...keys, key])
        : [],
  )

const loadConfig = async () =>
  await import("../tailwind.config.js")
    .then(mod => mod.default || {})
    .catch(() => {
      console.warn(
        "⚠️  No tailwind.config.js found or failed to import. Only default Tailwind colors will be exported.",
      )
      return {}
    })

const formatRow = ({ name, value }) => name.padEnd(32) + value
const formatTable = (header, rows, footer) => [...header, ...rows, ...footer].join("\n")
const writeJson = (path, obj) => fs.writeFileSync(path, JSON.stringify(obj, null, 2), "utf-8")

const writeHtml = (path, flatColors, mergedColors) => {
  const colorJson = JSON.stringify(mergedColors, null, 2)
  const colorList = JSON.stringify(flatColors)
  fs.writeFileSync(path, htmlTemplate({ colorJson, colorList }))
}

const main = async () => {
  const tailwindConfig = await loadConfig()
  const customColors = tailwindConfig.theme?.colors || {}
  const mergedColors = { ...colors, ...customColors }

  writeJson("./src/components/tailwind-colors.json", mergedColors)

  const flatColors = flattenColors(mergedColors)

  const header = [
    "\nTailwind Color Palette:",
    "────────────────────────────────────────────────────────────",
    "Reference".padEnd(32) + "Value",
    "────────────────────────────────────────────────────────────",
  ]
  const rows = flatColors.map(formatRow)
  const footer = [
    "────────────────────────────────────────────────────────────",
    `Total: ${flatColors.length} colors`,
  ]

  console.log("✅ Tailwind colors exported to tailwind-colors.json")
  console.log(formatTable(header, rows, footer))

  writeHtml("tailwind-color-chart.html", flatColors, mergedColors)
  console.log("✅ HTML color chart generated: tailwind-color-chart.html")
}

main()
