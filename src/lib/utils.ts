import { clsx, type ClassValue } from "clsx"
import { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const ucFirst = (s: string, locales?: Intl.LocalesArgument): string =>
  `${s.substring(0, 1).toLocaleUpperCase()}${s.substring(1)}`

export const head = <T>([head, ..._]: T[]): T => head
export const tail = <T>([_, ...tail]: T[]): T[] => tail
export const last = <T>(a: T[]): T => a[a.length - 1]

export const useWindow = (): Window | undefined => {
  const [win, setWin] = useState<Window | undefined>(undefined)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWin(window)
    }
  }, [])

  return win
}
