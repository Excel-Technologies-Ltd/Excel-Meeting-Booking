import { DatePicker as ChakraDatePicker, IconButton, Portal } from "@chakra-ui/react"
import * as React from "react"
import { LuCalendar, LuChevronLeft, LuChevronRight } from "react-icons/lu"

export interface DatePickerProps extends ChakraDatePicker.RootProps {
    startOfWeek?: number
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(props, ref) {
    const { children, ...rest } = props

    return (
      <ChakraDatePicker.Root ref={ref} startOfWeek={1} {...rest}>
        <ChakraDatePicker.Control>
          <ChakraDatePicker.Input />
          <ChakraDatePicker.IndicatorGroup>
           <ChakraDatePicker.Trigger asChild>
            <IconButton variant="ghost" aria-label="Open calendar">
              <LuCalendar />
            </IconButton>
           </ChakraDatePicker.Trigger>
          </ChakraDatePicker.IndicatorGroup>
        </ChakraDatePicker.Control>
        <Portal>
          <ChakraDatePicker.Positioner>
            <ChakraDatePicker.Content>
              <ChakraDatePicker.View view="day">
                <ChakraDatePicker.Header>
                  <ChakraDatePicker.PrevTrigger asChild>
                    <IconButton variant="ghost" aria-label="Previous Month">
                      <LuChevronLeft />
                    </IconButton>
                  </ChakraDatePicker.PrevTrigger>
                  <ChakraDatePicker.ViewControl />
                  <ChakraDatePicker.NextTrigger asChild>
                    <IconButton variant="ghost" aria-label="Next Month">
                      <LuChevronRight />
                    </IconButton>
                  </ChakraDatePicker.NextTrigger>
                </ChakraDatePicker.Header>
                <ChakraDatePicker.DayTable />
              </ChakraDatePicker.View>
              <ChakraDatePicker.View view="month">
                <ChakraDatePicker.Header>
                  <ChakraDatePicker.PrevTrigger asChild>
                    <IconButton variant="ghost" aria-label="Previous Year">
                      <LuChevronLeft />
                    </IconButton>
                  </ChakraDatePicker.PrevTrigger>
                  <ChakraDatePicker.ViewControl />
                  <ChakraDatePicker.NextTrigger asChild>
                    <IconButton variant="ghost" aria-label="Next Year">
                      <LuChevronRight />
                    </IconButton>
                  </ChakraDatePicker.NextTrigger>
                </ChakraDatePicker.Header>
                <ChakraDatePicker.MonthTable />
              </ChakraDatePicker.View>
              <ChakraDatePicker.View view="year">
                <ChakraDatePicker.Header>
                  <ChakraDatePicker.PrevTrigger asChild>
                    <IconButton variant="ghost" aria-label="Previous Decade">
                      <LuChevronLeft />
                    </IconButton>
                  </ChakraDatePicker.PrevTrigger>
                  <ChakraDatePicker.ViewControl />
                  <ChakraDatePicker.NextTrigger asChild>
                    <IconButton variant="ghost" aria-label="Next Decade">
                      <LuChevronRight />
                    </IconButton>
                  </ChakraDatePicker.NextTrigger>
                </ChakraDatePicker.Header>
                <ChakraDatePicker.YearTable />
              </ChakraDatePicker.View>
            </ChakraDatePicker.Content>
          </ChakraDatePicker.Positioner>
        </Portal>
      </ChakraDatePicker.Root>
    )
  },
)


/**
 *       <DatePicker.Label className="">Date of birth</DatePicker.Label>
 * 
 *     <DatePicker.Root   maxWidth="20rem" >

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
 */