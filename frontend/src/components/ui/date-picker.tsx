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
          <ChakraDatePicker.Input _placeholder={{ color: "gray.400" }} />
          <ChakraDatePicker.IndicatorGroup>
           <ChakraDatePicker.Trigger asChild>
            <IconButton variant="ghost" aria-label="Open calendar" color="gray.400">
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


