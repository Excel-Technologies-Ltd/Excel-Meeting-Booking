
import { Slider } from "@/components/ui/slider"
import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Popover,
  Portal,
  Text,
  VStack,
  createListCollection,
} from "@chakra-ui/react"

import { useEffect, useMemo, useState } from "react"
import { LuClock } from "react-icons/lu"

interface TimeProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  period?: "12" | "24"
  viewFormat?: "hh:mm" | "hh:mm:ss"
}

type TimeState = {
  h: number
  m: number
  s: number
}

const parseTime = (timeStr: string): TimeState => {
  if (!timeStr) return { h: 0, m: 0, s: 0 }

  const is12 = timeStr.includes("AM") || timeStr.includes("PM")

  if (is12) {
    const [time, mod] = timeStr.split(" ")
    let [h, m, s] = time.split(":").map(Number)

    if (mod === "PM" && h < 12) h += 12
    if (mod === "AM" && h === 12) h = 0

    return { h, m, s: s || 0 }
  }

  const [h, m, s] = timeStr.split(":").map(Number)
  return { h: h || 0, m: m || 0, s: s || 0 }
}

const formatTime = (time: TimeState, period: "12" | "24", viewFormat: string) => {
  let { h, m, s } = time
  let suffix = ""

  if (period === "12") {
    suffix = h >= 12 ? " PM" : " AM"
    h = h % 12 || 12
  }

  const hh = String(h).padStart(2, "0")
  const mm = String(m).padStart(2, "0")
  const ss = String(s).padStart(2, "0")

  return viewFormat === "hh:mm"
    ? `${hh}:${mm}${suffix}`
    : `${hh}:${mm}:${ss}${suffix}`
}

const formatInput = ({ h, m, s }: TimeState, viewFormat: string) => {
  const hh = String(h).padStart(2, "0")
  const mm = String(m).padStart(2, "0")
  const ss = String(s).padStart(2, "0")

  return viewFormat === "hh:mm" ? `${hh}:${mm}` : `${hh}:${mm}:${ss}`
}

const TimePicker = ({
  value = "",
  onChange,
  placeholder = "Select Time",
  period = "24",
  viewFormat = "hh:mm",
}: TimeProps) => {

  const [time, setTime] = useState<TimeState>(() => parseTime(value))

  useEffect(() => {
    setTime(parseTime(value))
  }, [value])

  const updateTime = (newTime: TimeState) => {
    setTime(newTime)
    onChange?.(formatTime(newTime, period, viewFormat))
  }

  const handleChange = (key: keyof TimeState, val: number) => {
    updateTime({ ...time, [key]: val })
  }

  const hours = useMemo(
    () =>
      createListCollection({
        items: Array.from(
          { length: period === "12" ? 12 : 24 },
          (_, i) => {
            const v = period === "12" ? i + 1 : i
            return {
              label: String(v).padStart(2, "0"),
              value: String(v),
            }
          }
        ),
      }),
    [period]
  )

  const minutes = useMemo(
    () =>
      createListCollection({
        items: Array.from({ length: 60 }, (_, i) => ({
          label: String(i).padStart(2, "0"),
          value: String(i),
        })),
      }),
    []
  )

  const seconds = minutes

  const setNow = () => {
    const d = new Date()
    updateTime({
      h: d.getHours(),
      m: d.getMinutes(),
      s: d.getSeconds(),
    })
  }

  return (
    <Popover.Root>
      <Box position="relative" width="full">
        <Input
          value={formatInput(time, viewFormat)}
          placeholder={placeholder}
          type="time"
          step="1"
          paddingEnd="10"
          onChange={(e) => updateTime(parseTime(e.target.value))}
          css={{
            "&::-webkit-calendar-picker-indicator": {
              display: "none",
            },
          }}
        />

        <Popover.Trigger asChild>
          <IconButton
            position="absolute"
            insetEnd="0"
            top="0"
            height="full"
            variant="ghost"
            aria-label="time"
          >
            <LuClock />
          </IconButton>
        </Popover.Trigger>
      </Box>

      <Portal>
        <Popover.Positioner>
          <Popover.Content width="300px">
            <Popover.Arrow />

            <Popover.Body p={3}>
              <VStack gap={3}>

                <Text fontWeight="semibold">
                  {formatTime(time, period, viewFormat)}
                </Text>

                {/* Hour */}
                <Slider
                  min={period === "12" ? 1 : 0}
                  max={period === "12" ? 12 : 23}
                  value={[period === "12" ? time.h % 12 || 12 : time.h]}
                  onValueChange={(e) => {
                    let h = e.value[0]

                    if (period === "12") {
                      const isPM = time.h >= 12
                      h = isPM ? h + 12 : h
                      if (h === 24) h = 12
                    }

                    handleChange("h", h)
                  }}
                />

                {/* Minute */}
                <Slider
                  min={0}
                  max={59}
                  value={[time.m]}
                  onValueChange={(e) => handleChange("m", e.value[0])}
                />

                {viewFormat === "hh:mm:ss" && (
                  <Slider
                    min={0}
                    max={59}
                    value={[time.s]}
                    onValueChange={(e) => handleChange("s", e.value[0])}
                  />
                )}

                <HStack justify="space-between" width="full">

                  <Button size="xs" variant="outline" onClick={setNow}>
                    Now
                  </Button>

                  <Popover.CloseTrigger asChild>
                    <Button size="xs" colorPalette="green">
                      Ok
                    </Button>
                  </Popover.CloseTrigger>

                </HStack>

              </VStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}

export default TimePicker