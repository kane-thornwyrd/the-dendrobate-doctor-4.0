import React, { createContext, useCallback, useContext, useState } from "react"

type EdLCalendarDrawerContextType = {
  open: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const EdLCalendarDrawerContext = createContext<EdLCalendarDrawerContextType>({
  open: false,
  openDrawer: () => {
    console.warn("EdLCalendarDrawerContext not initialized")
  },
  closeDrawer: () => {
    console.warn("EdLCalendarDrawerContext not initialized")
  },
})

export const EdLCalendarDrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false)

  const openDrawer = useCallback(() => setOpen(true), [])
  const closeDrawer = useCallback(() => setOpen(false), [])

  return (
    <EdLCalendarDrawerContext.Provider value={{ open, openDrawer, closeDrawer }}>
      {children}
    </EdLCalendarDrawerContext.Provider>
  )
}

export function useEdLCalendarDrawer() {
  const ctx = useContext(EdLCalendarDrawerContext)
  return ctx
}
