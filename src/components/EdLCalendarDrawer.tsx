"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { last } from "@/lib/utils"
import { navigate } from "astro:transitions/client"
import { Calendar } from "lucide-react"
import { useState } from "react"

import { EdLCalendar } from "./EdLCalendar"

export type Edition = {
  id: string
  date: Date
}

export const EdLCalendarDrawer = ({
  edlDates,
  routingParams,
}: {
  edlDates: Edition[]
  routingParams: { [key: string]: unknown }
}) => {
  const [currentEdition, setCurrentEdition] = useState<string>(
    routingParams?.date !== undefined ? (routingParams.date as string) : last(edlDates).id,
  )

  return (
    <Drawer dismissible={false}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="float-right">
          Agenda des éditions <Calendar />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="text-center">
            <DrawerTitle>Écho des Labos</DrawerTitle>
            <DrawerDescription>Choisissez une édition</DrawerDescription>
          </DrawerHeader>
          <EdLCalendar {...{ edlDates, currentEdition, setCurrentEdition }} />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button
                onClick={() => {
                  // Astro.redirect(`Écho-des-labos/${currentEdition}`)
                  navigate(`/Écho-des-labos/${currentEdition}`)
                }}
              >
                Submit
              </Button>
            </DrawerClose>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
