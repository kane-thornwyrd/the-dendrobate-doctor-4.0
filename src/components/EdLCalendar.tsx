import { Calendar } from "@/components/ui/calendar"
import { last, ucFirst } from "@/lib/utils"
import { isAfter, isWithinInterval, parse } from "date-fns"
import { DateTime } from "luxon"
import { useState, type Dispatch } from "react"

import type { Edition } from "./EdLCalendarDrawer"

const cleanDateToDateTime = (d: Date): DateTime => DateTime.fromJSDate(d).setZone("Europe/Paris").setLocale("fr")

export const EdLCalendar = ({
  edlDates,
  currentEdition,
  setCurrentEdition,
}: {
  edlDates: Edition[]
  currentEdition: string
  setCurrentEdition: Dispatch<React.SetStateAction<string>>
}) => {
  const [month, setMonth] = useState<Date>(parse(currentEdition, "yyyyLLdd", new Date()))

  const getEdition = (id: string): Edition => edlDates.find(e => e.id === id) ?? last(edlDates)

  const selectEdition = (id?: string): void =>
    setCurrentEdition(!!id && getEdition(id) !== undefined ? id : last(edlDates).id)

  const getNextEditionFromDay = (day: Date) => edlDates.find(e => isAfter(e.date, day)) ?? last(edlDates)

  const getPreviousEdition = (id: string) => edlDates[Math.max(0, edlDates.findIndex(v => v.id === id) - 1)]

  return (
    <Calendar
      className="mx-auto w-fit"
      mode="single"
      month={month}
      onMonthChange={setMonth}
      selected={edlDates.find(e => e.id === currentEdition)!.date}
      onDayClick={(day, modifiers) => {
        const ed = getNextEditionFromDay(day)
        selectEdition(ed.id)
        setMonth(ed.date)
      }}
      footer={`Édition du ${cleanDateToDateTime(getEdition(currentEdition).date).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}`}
      captionLayout="dropdown"
      weekStartsOn={1}
      formatters={{
        formatCaption: (date: Date, options) => {
          return ucFirst(DateTime.fromJSDate(date, { zone: "Europe/Paris" }).setLocale("fr").toFormat("LLLL yyyy"))
        },
      }}
      modifiers={{
        selected: getEdition(currentEdition).date,
        range_start: getPreviousEdition(currentEdition).date,
        range_end: getEdition(currentEdition).date,
        range_middle: (date: Date) =>
          isWithinInterval(date, {
            start: getPreviousEdition(currentEdition).date as Date,
            end: getEdition(currentEdition).date,
          }),
      }}
    />
  )
}
