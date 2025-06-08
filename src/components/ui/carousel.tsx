import { Button } from "@/components/ui/button"
import { last, push } from "@/lib/utils"
import { navigate } from "astro:transitions/client"
import { ChevronLeft, ChevronRight, ArrowBigDown as LinkIcon, Loader2 } from "lucide-react"
import { DateTime } from "luxon"
import React, { useEffect, useRef, useState } from "react"

import { EdLCalendarDrawerTrigger } from "../EdLCalendarDrawerTrigger"

export type EdlItem = { date: Date; id: string; content: string }
export type EdlCarouselProps = { items: EdlItem[] }

function getSlidesPerPage() {
  if (typeof window === "undefined") return 1
  const sm = 640
  const lg = 1024

  if (window.innerWidth > lg) return 3
  if (window.innerWidth > sm) return 2
  return 1
}

const isAEdl = (item: unknown): item is EdlItem =>
  item !== null &&
  typeof item === "object" &&
  "id" in item &&
  typeof (item as { id: string }).id === "string" &&
  (item as { id: string }).id.length > 0 &&
  "content" in item &&
  (typeof (item as { content: string | undefined }).content === "string" ||
    (item as { content: string | undefined }).content === undefined)

export function EdlCarousel({ items }: EdlCarouselProps) {
  const limitedItems = items.slice(0, 10)
  const [page, setPage] = useState(0)
  const [slidesPerPage, setSlidesPerPage] = useState(() => getSlidesPerPage())
  const [loadingId, setLoadingId] = useState<string | null>(null)
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

  const editionsRegistered = [...limitedItems, { id: "" }]

  const totalPages = Math.ceil(editionsRegistered.length / slidesPerPage)
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
  const visibleItems = editionsRegistered.slice(start, end)

  return (
    <div className="w-full z-50 h-full">
      <div className="flex items-center gap-2">
        <Button
          className={`rounded-l-none hover:bg-emerald-700`}
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={!canPrev}
          aria-label="Précédent"
          variant="secondary"
          size="icon"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div
          className={`w-full flex-1 h-full`}
          ref={containerRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className={`relative flex gap-1 w-full h-full items-stretch justify-center `}>
            {visibleItems.map(item =>
              isAEdl(item) ? (
                <div
                  key={item.id}
                  className={`
                  relative flex flex-col items-stretch justify-start
                  overflow-hidden
                  mx-2
                  min-w-0
                  transition
                  shadow-neutral-950/30
                  shadow-2xl
                  prose-p:mb-0
                `}
                  style={{
                    width: `calc(100% / ${slidesPerPage})`,
                    minWidth: 0,
                  }}
                >
                  <div className="fold-corner-card text-center font-bold text-md">
                    {DateTime.fromFormat(item.id, "yyyyLLdd").setLocale("fr").toLocaleString(DateTime.DATE_MED)}
                  </div>
                  <div className="bg-stone-100 flex-1 flex flex-col justify-center items-center px-2 py-0">
                    <div className="text-gray-700 text-base text-center font-mono whitespace-pre-line">
                      <p className="mt-0 text-sm">
                        {(item.content as string).match(/\<p\>([^\<]+)\<\/p\>/i) ? (
                          (item.content as string).match(/\<p\>([^\<]+)\<\/p\>/i)![1].substring(29)
                        ) : item.content !== undefined ? (
                          <p>{item.content}</p>
                        ) : (
                          ""
                        )}
                      </p>
                    </div>
                    <Button
                      className="w-full bg-emerald-600 text-stone-100 m-3"
                      aria-label={`Voir la page de ${item.id}`}
                      onClick={e => {
                        setLoadingId(item.id)
                        navigate(`/Écho-des-labos/${item.id}`)
                      }}
                      disabled={loadingId === item.id}
                    >
                      {loadingId === item.id ? <Loader2 className="animate-spin" /> : <LinkIcon />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  key={`${last(visibleItems).id}-after`}
                  className={`
    flex flex-col items-stretch justify-center
    overflow-hidden
    mx-2
    min-w-0
    h-52
    prose-p:mb-0
  `}
                >
                  <EdLCalendarDrawerTrigger className="self-center bg-emerald-600 font-black" />
                </div>
              ),
            )}
          </div>
        </div>
        <Button
          className={`rounded-r-none hover:bg-emerald-700`}
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={!canNext}
          aria-label="Suivant"
          variant="secondary"
          size="icon"
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="flex justify-center mt-4 gap-1">
        {Array.from({ length: totalPages }).map((_, i) => (
          <Button
            key={i}
            className={`w-2 h-2 rounded-full p-0 ${i === page ? "bg-emerald-500" : "bg-emerald-900/20"}`}
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
