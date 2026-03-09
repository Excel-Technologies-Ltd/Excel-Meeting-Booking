import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Box,
  Button,
  createListCollection,
  HStack,
  IconButton,
  Input,
  Popover,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import { LuClock } from "react-icons/lu"

export interface TimeProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  period?: "12" | "24"
  viewFormat?: "hh:mm" | "hh:mm:ss"
}

const TimePicker = ({
  value = "",
  onChange,
  placeholder = "Select Time",
  period = "24",
  viewFormat = "hh:mm",
}: TimeProps) => {

  const parseTime = (timeStr: string) => {
    if (!timeStr) return { h: 0, m: 0, s: 0 }

    const is12Hour = timeStr.includes("AM") || timeStr.includes("PM")

    if (is12Hour) {
      const parts = timeStr.split(" ")
      const time = parts[0]
      const modifier = parts[1]

      let [h, m, s] = time.split(":").map(Number)

      if (modifier === "PM" && h < 12) h += 12
      if (modifier === "AM" && h === 12) h = 0

      return {
        h: isNaN(h) ? 0 : h,
        m: isNaN(m) ? 0 : m,
        s: isNaN(s) ? 0 : s,
      }
    }

    const [h, m, s] = timeStr.split(":").map(Number)

    return {
      h: isNaN(h) ? 0 : h,
      m: isNaN(m) ? 0 : m,
      s: isNaN(s) ? 0 : s,
    }
  }

  const [timeState, setTimeState] = useState(parseTime(value))
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const hours = useMemo(() => createListCollection({
  items: Array.from({ length: period === "12" ? 12 : 24 }, (_, i) => {
    const val = period === "12" ? i + 1 : i
    return {
      label: val.toString().padStart(2, "0"),
      value: val.toString(),
    }
  }),
}), [period])

  const minutes = useMemo(() =>  createListCollection({
    items: Array.from({ length: 60 }, (_, i) => ({
      label: i.toString().padStart(2, "0"),
      value: i.toString(),
    })),
  }), [period])

  const seconds = useMemo(() => createListCollection({
    items: Array.from({ length: 60 }, (_, i) => ({
      label: i.toString().padStart(2, "0"),
      value: i.toString(),
    })),
  }), [period])

  useEffect(() => {
    setTimeState(parseTime(value))
  }, [value])

  const formatTime = ({ h, m, s }: { h: number; m: number; s: number }) => {
    let formattedH = h
    let suffix = ""

    if (period === "12") {
      suffix = h >= 12 ? " PM" : " AM"
      formattedH = h % 12 || 12
    }

    const hh = formattedH.toString().padStart(2, "0")
    const mm = m.toString().padStart(2, "0")
    const ss = s.toString().padStart(2, "0")

    if (viewFormat === "hh:mm") {
      return `${hh}:${mm}${suffix}`
    }

    return `${hh}:${mm}:${ss}${suffix}`
  }

  const updateTime = (newState: { h: number; m: number; s: number }) => {
    setTimeState(newState)
    // Always emit 24h HH:MM format for form/validation compatibility
    const hh = newState.h.toString().padStart(2, "0")
    const mm = newState.m.toString().padStart(2, "0")
    const ss = newState.s.toString().padStart(2, "0")
    // const formValue = viewFormat === "hh:mm:ss" ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`
    // always emit seconds for consistent parsing, even if viewFormat is hh:mm
    const formValue = `${hh}:${mm}:${ss}` 
    onChange?.(formValue)
  }

  const handleTimeChange = (type: "h" | "m" | "s", val: number) => {
    const newState = { ...timeState, [type]: val }
    updateTime(newState)
  }

  const setNow = () => {
    const now = new Date()

    const newState = {
      h: now.getHours(),
      m: now.getMinutes(),
      s: now.getSeconds(),
    }

    updateTime(newState)
  }

  return (
    <Popover.Root>
      <Box position="relative" width="full">
        <Input
          value={isEditing ? inputValue : (value ? formatTime(timeState) : "")}
          paddingEnd="10"
          placeholder={placeholder}
          css={{ cursor: "pointer" }}
          onFocus={() => {
            setIsEditing(true)
            setInputValue(value ? formatTime(timeState) : "")
          }}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => {
            setIsEditing(false)
            if (inputValue.trim()) {
              const parsed = parseTime(inputValue.trim())
              updateTime(parsed)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur()
            }
          }}
        />

        <Popover.Trigger asChild>
          <IconButton
            variant="ghost"
            aria-label="Open time picker"
            position="absolute"
            top="0"
            insetEnd="0"
            zIndex="5"
            height="full"
            roundedStart="0"
            color={"fg.success"}
          >
            <LuClock />
          </IconButton>
        </Popover.Trigger>
      </Box>

      <Portal>
        <Popover.Positioner>
          <Popover.Content width="300px" color={"black"}>
            <Popover.Arrow />

            <Popover.Body padding={3}>
              <VStack gap={1} align="stretch" width="full">

                <Text fontSize="lg" fontWeight="semibold" textAlign="center" color="fg.muted">
                  {formatTime(timeState)}
                </Text>

                <VStack gap={3} width="full" paddingY={1}>

                  {/* Hour */}
                  <HStack justify="space-between" width="full" gap={3}>

                    <VStack gap={0} width="full" align="stretch"  rounded="md">
                      <Text fontSize="sm" color="fg.muted">
                        Hour
                      </Text>

                      <Slider
                        value={[
                          period === "12"
                            ? timeState.h % 12 || 12
                            : timeState.h
                        ]}
                        min={period === "12" ? 1 : 0}
                        max={period === "12" ? 12 : 23}
                        step={1}
                        size="sm"
                        onValueChange={(e) => {
                          const val = e.value[0]

                          if (period === "12") {
                            const isPM = timeState.h >= 12
                            let newH = val

                            if (val === 12) {
                              newH = isPM ? 12 : 0
                            } else {
                              newH = isPM ? val + 12 : val
                            }

                            handleTimeChange("h", newH)
                          } else {
                            handleTimeChange("h", val)
                          }
                        }}
                        width="full"
                        colorPalette="green"
                      />
                    </VStack>

                    <SelectRoot
                      collection={hours}
                      value={[
                        String(
                          period === "12"
                            ? timeState.h % 12 || 12
                            : timeState.h
                        ),
                      ]}
                      onValueChange={(e) => {
                        const val = Number(e.value[0])
                        let newH = val

                        if (period === "12") {
                          const isPM = timeState.h >= 12

                          if (val === 12) {
                            newH = isPM ? 12 : 0
                          } else {
                            newH = isPM ? val + 12 : val
                          }
                        }

                        handleTimeChange("h", newH)
                      }}
                      size={"xs"}
                      width="85px"
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="HH" />
                      </SelectTrigger>

                      <SelectContent maxH="200px" color={"black"}>
                        {hours.items.map((item) => (
                          <SelectItem item={item} key={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>

                  </HStack>

            

                  {/* Minute */}
                  <HStack justify="space-between" width="full" gap={3}>

                    <VStack gap={0} width="full" align="stretch">
                      <Text fontSize="sm" color="fg.muted">
                        Minute
                      </Text>

                      <Slider
                        value={[timeState.m]}
                        min={0}
                        max={59}
                        step={1}
                        size="sm"
                        onValueChange={(e) =>
                          handleTimeChange("m", e.value[0])
                        }
                        width="full"
                        colorPalette="green"
                      />
                    </VStack>

                    <SelectRoot
                      collection={minutes}
                      value={[String(timeState.m ?? 0)]}
                      onValueChange={(e) =>
                        handleTimeChange("m", Number(e.value[0]))
                      }
                      size="xs"
                      width="85px"
                    >
                      <SelectTrigger>
                        <SelectValueText placeholder="MM" />
                      </SelectTrigger>

                      <SelectContent maxH="200px" color={"black"}>
                        {minutes.items.map((item) => (
                          <SelectItem item={item} key={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectRoot>

                  </HStack>

                  {/* Second */}
                  {viewFormat === "hh:mm:ss" && (
                    <HStack justify="space-between" width="full" gap={3}>

                      <VStack gap={0} width="full" align="stretch">
                        <Text fontSize="sm" color="fg.muted">
                          Second
                        </Text>

                        <Slider
                          value={[timeState.s]}
                          min={0}
                          max={59}
                          step={1}
                          size="sm"
                          onValueChange={(e) =>
                            handleTimeChange("s", e.value[0])
                          }
                          width="full"
                          colorPalette="green"
                        />
                      </VStack>

                      <SelectRoot
                        collection={seconds}
                        value={[String(timeState.s ?? 0)]}
                        onValueChange={(e) =>
                          handleTimeChange("s", Number(e.value[0]))
                        }
                        size="xs"
                        width="85px"
                      >
                        <SelectTrigger>
                          <SelectValueText placeholder="SS" />
                        </SelectTrigger>

                        <SelectContent maxH="200px" color={"black"}>
                          {seconds.items.map((item) => (
                            <SelectItem item={item} key={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>

                    </HStack>
                  )}

                        {/* AM PM */}
                  {period === "12" && (
                    <HStack width="full" justify="center">

                      <Button
                        size="xs"
                        variant={timeState.h >= 12 ? "outline" : "solid"}
                           height="auto"
                        py={1}
                        colorPalette="green"
                        onClick={() => {
                          if (timeState.h >= 12) {
                            handleTimeChange("h", timeState.h - 12)
                          }
                        }}
                      >
                        AM
                      </Button>

                      <Button
                        size="xs"
                        variant={timeState.h >= 12 ? "solid" : "outline"}
                        height="auto"
                        py={1}
                        colorPalette="green"
                        onClick={() => {
                          if (timeState.h < 12) {
                            handleTimeChange("h", timeState.h + 12)
                          }
                        }}
                      >
                        PM
                      </Button>

                    </HStack>
                  )}

                </VStack>

                <HStack width="full" gap={3} justify="space-between">

                  <Button
                    size="xs"
                    variant="outline"
                    onClick={setNow}
                    color={"green"}
                    height="auto"
                    py={1}
                  >
                    Now
                  </Button>

                  <Popover.CloseTrigger asChild>
                    <Button
                      size="xs"
                      height="auto"
                      py={1}
                      colorPalette="green"
                    >
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