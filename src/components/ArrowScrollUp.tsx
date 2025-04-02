import { ArrowBigUpDash } from "lucide-react"

export const ScrollUpButton = () => {
  return (
    <div className="back-to-top-wrapper absolute right-4 bottom-6 w-16 pointer-events-none">
      <a aria-label="Scroll to Top" className="back-to-top-link backdrop-blur-md" href="#top">
        <ArrowBigUpDash />
      </a>
    </div>
  )
}
