import type { DateValue } from "@chakra-ui/react";
import { DatePicker as ChakraDatePicker, Portal } from "@chakra-ui/react";
import { CalendarDate } from "@internationalized/date";
import * as React from "react";
import { LuCalendar } from "react-icons/lu";

export interface DatePickerProps extends ChakraDatePicker.RootProps {
  startOfWeek?: number;
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(props, ref) {
  const { ...rest } = props;

  return (
    <ChakraDatePicker.Root
      ref={ref}
      {...rest}
      format={format}
      parse={parse}
      placeholder="dd/mm/yyyy"
      // maxWidth="20rem"
    >
      <ChakraDatePicker.Control>
        <ChakraDatePicker.Input _placeholder={{ color: "gray.400" }} />
        <ChakraDatePicker.IndicatorGroup>
          <ChakraDatePicker.Trigger>
            <LuCalendar color="#efefef" />
          </ChakraDatePicker.Trigger>
        </ChakraDatePicker.IndicatorGroup>
      </ChakraDatePicker.Control>
      <Portal>
        <ChakraDatePicker.Positioner>
          <ChakraDatePicker.Content transform="scale(0.85)" transformOrigin="top right">
            <ChakraDatePicker.View view="day" fontSize="sm">
              <ChakraDatePicker.Header />
              <ChakraDatePicker.DayTable />
            </ChakraDatePicker.View>
            <ChakraDatePicker.View view="month" fontSize="sm">
              <ChakraDatePicker.Header />
              <ChakraDatePicker.MonthTable />
            </ChakraDatePicker.View>
            <ChakraDatePicker.View view="year" fontSize="sm">
              <ChakraDatePicker.Header />
              <ChakraDatePicker.YearTable />
            </ChakraDatePicker.View>
          </ChakraDatePicker.Content>
        </ChakraDatePicker.Positioner>
      </Portal>
    </ChakraDatePicker.Root>
  );
});

const parse = (value: string) => {
  const fullRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const fullMatch = value.match(fullRegex);
  if (fullMatch) {
    const [_, day, month, year] = fullMatch.map(Number);
    try {
      return new CalendarDate(year, month, day);
    } catch {
      return undefined;
    }
  }

  const partialRegex = /^(\d{1,2})\/(\d{1,2})$/;
  const partialMatch = value.match(partialRegex);
  if (partialMatch) {
    const [_, day, month] = partialMatch.map(Number);
    const currentYear = new Date().getFullYear();
    try {
      return new CalendarDate(currentYear, month, day);
    } catch {
      return undefined;
    }
  }

  const dayRegex = /^(\d{1,2})$/;
  const dayMatch = value.match(dayRegex);
  if (dayMatch) {
    const [_, day] = dayMatch.map(Number);
    const currentYear = new Date().getFullYear();
    return new CalendarDate(currentYear, 1, day);
  }

  return undefined;
};

const format = (date: DateValue) => {
  const day = date.day.toString().padStart(2, "0");
  const month = date.month.toString().padStart(2, "0");
  const year = date.year.toString().padStart(4, "0");
  return `${day}/${month}/${year}`;
};
