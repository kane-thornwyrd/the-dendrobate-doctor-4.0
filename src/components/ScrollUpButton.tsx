import { ArrowBigUpDash } from "lucide-react"
import { useRef } from "react"

export const ScrollUpButton = ({ triggerScrollToTop }: { triggerScrollToTop: () => void }) => {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null)
  return (
    <button
      aria-label="Scroll to Top"
      data-twe-ripple-init
      data-twe-ripple-color="light"
      className="!fixed bottom-5 end-5 hidden rounded-full bg-red-600 p-3 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-red-700 hover:shadow-lg focus:bg-red-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-800 active:shadow-lg back-to-top-link"
      onClick={triggerScrollToTop}
    >
      <ArrowBigUpDash />
    </button>
  )
}
