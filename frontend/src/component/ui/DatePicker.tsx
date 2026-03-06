"use client"

import { DatePicker, Portal } from "@chakra-ui/react"
import { LuCalendar } from "react-icons/lu"


const DatePickerComponent = () => {
  return (
    <DatePicker.Root   maxWidth="20rem" >
      <DatePicker.Label className="">Date of birth</DatePicker.Label>
      <DatePicker.Control className="">
        <DatePicker.Input className="" />
        <DatePicker.IndicatorGroup>
          <DatePicker.Trigger>
            <LuCalendar />
          </DatePicker.Trigger>
        </DatePicker.IndicatorGroup>
      </DatePicker.Control>
      <Portal>
        <DatePicker.Positioner>
          <DatePicker.Content>
            <DatePicker.View view="day">
              <DatePicker.Header />
              <DatePicker.DayTable />
            </DatePicker.View>
            <DatePicker.View view="month">
              <DatePicker.Header />
              <DatePicker.MonthTable />
            </DatePicker.View>
            <DatePicker.View view="year">
              <DatePicker.Header />
              <DatePicker.YearTable />
            </DatePicker.View>
          </DatePicker.Content>
        </DatePicker.Positioner>
      </Portal>
    </DatePicker.Root>
  )
}

export default DatePickerComponent;