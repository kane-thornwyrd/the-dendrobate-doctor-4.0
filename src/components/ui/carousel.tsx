import { Button } from "@/components/ui/button"
import type { RenderedContent } from "astro:content"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DateTime } from "luxon"
import React, { useEffect, useRef, useState } from "react"

export type EdlItem = { date: Date; id: string; content: RenderedContent | string | undefined }
export type EdlCarouselProps = { items: EdlItem[]; height?: string }

function getSlidesPerPage() {
  if (typeof window === "undefined") return 1
  const sm = 640
  const lg = 1024

  if (window.innerWidth > lg) return 3
  if (window.innerWidth > sm) return 2
  return 1
}

export function EdlCarousel({ items, height = "h-48" }: EdlCarouselProps) {
  const limitedItems = items.slice(0, 10)
  const [page, setPage] = useState(0)
  const [slidesPerPage, setSlidesPerPage] = useState(() => getSlidesPerPage())
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Handler qui met à jour slidesPerPage selon la largeur courante
    const handleResize = () => setSlidesPerPage(getSlidesPerPage())
    // Appel initial pour s'assurer que la valeur est correcte au montage
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const totalPages = Math.ceil(limitedItems.length / slidesPerPage)

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1))
    }
  }, [slidesPerPage, totalPages, page])

  const canPrev = page > 0
  const canNext = page < totalPages - 1

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX
  }
  function onTouchEnd() {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const delta = touchEndX.current - touchStartX.current
      if (Math.abs(delta) > 50) {
        if (delta > 0 && canPrev) setPage(p => Math.max(0, p - 1))
        if (delta < 0 && canNext) setPage(p => Math.min(totalPages - 1, p + 1))
      }
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const start = page * slidesPerPage
  const end = start + slidesPerPage
  const visibleItems = limitedItems.slice(start, end)

  return (
    <div className="w-full z-50">
      <div className="flex items-center gap-2">
        <Button
          className={`px-2 rounded bg-gray-100 border disabled:opacity-40 transition-all ${height} min-h-[48px]`}
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={!canPrev}
          aria-label="Précédent"
          variant="outline"
          size="icon"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div
          className={`overflow-hidden w-full ${height} flex-1`}
          ref={containerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className={`flex gap-1 w-full h-full items-stretch justify-center`}>
            {visibleItems.map(item => (
              <div
                key={item.id}
                className={`
                  shadow-lg border border-gray-200
                  flex flex-col items-stretch justify-start
                  overflow-hidden
                  relative
                  mx-2
                  ${height}
                  min-w-0
                  transition
                `}
                style={{
                  width: `calc(100% / ${slidesPerPage})`,
                  minWidth: 0,
                }}
              >
                {/* Header date façon calendrier */}
                <div className="bg-emerald-800 text-white text-center py-2 px-2 font-bold text-md border-b-2 border-emerald-900">
                  {DateTime.fromFormat(item.id, "yyyyLLdd").setLocale("fr").toLocaleString(DateTime.DATE_MED)}
                </div>
                {/* Contenu façon note */}
                <div className="flex-1 flex flex-col justify-center items-center px-2 py-0">
                  <div className="text-gray-700 text-base text-center font-mono whitespace-pre-line">
                    <p className="mt-0 text-sm">
                      {(item.content as string).match(/\<p\>([^\<]+)\<\/p\>/i)
                        ? (item.content as string).match(/\<p\>([^\<]+)\<\/p\>/i)![1].substring(29)
                        : ""}
                    </p>
                  </div>
                </div>
                {/* Optionnel : effet coin plié */}
                <div className="absolute right-0 top-0 w-8 h-8 bg-blue-100 rounded-bl-xl -z-10"></div>
              </div>
            ))}
          </div>
        </div>
        <Button
          className={`px-2 rounded bg-gray-100 border disabled:opacity-40 transition-all ${height} min-h-[48px]`}
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={!canNext}
          aria-label="Suivant"
          variant="outline"
          size="icon"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
      <div className="flex justify-center mt-4 gap-1">
        {Array.from({ length: totalPages }).map((_, i) => (
          <Button
            key={i}
            className={`w-2 h-2 rounded-full p-0 ${i === page ? "bg-blue-500" : "bg-gray-300"}`}
            onClick={() => setPage(i)}
            aria-label={`Aller à la page ${i + 1}`}
            variant={i === page ? "default" : "ghost"}
            size="icon"
          />
        ))}
      </div>
    </div>
  )
}
