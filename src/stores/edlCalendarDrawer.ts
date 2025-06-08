import { useStore } from "@nanostores/react"
import { atom } from "nanostores"

export const $edlCalendarDrawerOpen = atom(false)

export function openEdlCalendarDrawer() {
  console.log("Opening EDL Calendar Drawer")
  $edlCalendarDrawerOpen.set(true)
}

export function closeEdlCalendarDrawer() {
  $edlCalendarDrawerOpen.set(false)
}
