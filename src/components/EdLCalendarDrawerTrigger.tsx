import { Button } from "@/components/ui/button"
import { openEdlCalendarDrawer } from "@/stores/edlCalendarDrawer"
import { Calendar } from "lucide-react"

export function EdLCalendarDrawerTrigger({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <Button onClick={openEdlCalendarDrawer} className={className}>
      {children ?? (
        <>
          Agenda des éditions <Calendar />
        </>
      )}
    </Button>
  )
}
