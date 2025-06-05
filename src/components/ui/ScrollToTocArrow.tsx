import { ChevronUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function ScrollToTocArrow() {
  const shouldDisplay = (): boolean =>
    !!(window.scrollY - window.innerHeight / 2 > 0) && document.querySelector("#toc_container") !== null

  const [shouldShow, setShouldShow] = useState(shouldDisplay())
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onScroll() {
      setShouldShow(shouldDisplay())
    }
    window.addEventListener("scroll", onScroll)
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const btn = btnRef.current
    if (!btn) return
    if (shouldShow) {
      btn.classList.add("translate-y-0", "pointer-events-auto")
      btn.classList.remove("translate-y-24", "pointer-events-none")
    } else {
      btn.classList.remove("translate-y-0", "pointer-events-auto")
      btn.classList.add("translate-y-24", "pointer-events-none")
    }
  }, [shouldShow])

  function handleClick() {
    const toc = document.querySelector("#toc_container")
    if (toc) {
      toc.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <button
      ref={btnRef}
      aria-label="Scroll to Table of Contents"
      onClick={handleClick}
      className={`
        sticky bottom-6 right-6 z-50
        bg-emerald-700 text-white rounded-full shadow-lg p-3
        transition-transform duration-1000
        ml-auto translate-y-24 pointer-events-none
      `}
      style={{ transitionProperty: "opacity, transform" }}
    >
      <ChevronUp className="w-7 h-7" />
    </button>
  )
}
