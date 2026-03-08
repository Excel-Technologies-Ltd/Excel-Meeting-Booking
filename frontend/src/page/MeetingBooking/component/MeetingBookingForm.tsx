import { Button, Input, SimpleGrid, Stack, createListCollection } from "@chakra-ui/react"
import { parseDate } from "@internationalized/date"
import { useState } from "react"
import { Controller } from "react-hook-form"
import {
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemText,
  ComboboxRoot,
} from "../../../components/ui/combobox"
import { DatePicker } from "../../../components/ui/date-picker"
import { Field } from "../../../components/ui/field"
import { useDebounce } from "../../../hooks/use-debounce"
import { useMeetingBookingForm } from "./useMeetingBookingForm"

type Props = {}

const MeetingBookingForm = ({}: Props) => {
  const [inputValue, setInputValue] = useState("")
  const debouncedSearchTerm = useDebounce(inputValue, 300)

  const [branchInputValue, setBranchInputValue] = useState("")
  const debouncedBranchSearchTerm = useDebounce(branchInputValue, 300)

  const { register, control, handleSubmit, errors, loading, meetingRooms, branches } =
    useMeetingBookingForm(debouncedSearchTerm, debouncedBranchSearchTerm)

  const meetingRoomsCollection = createListCollection({
    items:
      meetingRooms
        ?.filter((room) => room.name.toLowerCase().includes(inputValue.toLowerCase()))
        .map((room) => ({ label: room.name, value: room.name })) || [],
  })

  const branchesCollection = createListCollection({
    items:
      branches
        ?.filter((branch) => branch.name.toLowerCase().includes(branchInputValue.toLowerCase()))
        .map((branch) => ({ label: branch.name, value: branch.name })) || [],
  })

  return (
    <div className="px-6 py-2 max-w-7xl mx-auto border border-gray-400 backdrop-blur-xs rounded-lg">
      <Stack gap={6}>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={6}>
          <Field label="Meeting Title" invalid={!!errors.title} errorText={errors.title?.message}>
            <Input {...register("title")} placeholder="Meeting Title" />
          </Field>
          <Field
            label="Meeting Room"
            invalid={!!errors.meeting_room}
            errorText={errors.meeting_room?.message}
          >
            <Controller
              control={control}
              name="meeting_room"
              render={({ field }) => (
                <ComboboxRoot
                  name={field.name}
                  value={field.value ? [field.value] : []}
                  onValueChange={({ value }) => field.onChange(value[0])}
                  onInputValueChange={({ inputValue }) => setInputValue(inputValue)}
                  inputValue={inputValue}
                  collection={meetingRoomsCollection}
                >
                  <ComboboxControl>
                    <ComboboxInput placeholder="Select Meeting Room" />
                  </ComboboxControl>
                    <ComboboxContent maxHeight="200px" overflowY="auto" color={"black"}>
                    {meetingRoomsCollection.items.map((movie) => (
                      <ComboboxItem item={movie} key={movie.value}>
                        <ComboboxItemText>{movie.label}</ComboboxItemText>
                      </ComboboxItem>
                    ))}
                  </ComboboxContent>
                </ComboboxRoot>
              )}
            />
          </Field>
          <Field
            label="Branch"
            invalid={!!errors.excel_branch}
            errorText={errors.excel_branch?.message}
          >
            <Controller
              control={control}
              name="excel_branch"
              render={({ field }) => (
                <ComboboxRoot
                  name={field.name}
                  value={field.value ? [field.value] : []}
                  onValueChange={({ value }) => field.onChange(value[0])}
                  onInputValueChange={({ inputValue }) => setBranchInputValue(inputValue)}
                  inputValue={branchInputValue}
                  collection={branchesCollection}
                >
                  <ComboboxControl>
                    <ComboboxInput placeholder="Select Branch" />
                  </ComboboxControl>
                  <ComboboxContent maxHeight="200px" overflowY="auto" color={"black"}>
                    {branchesCollection.items.map((branch) => (
                      <ComboboxItem item={branch} key={branch.value}>
                        <ComboboxItemText>{branch.label}</ComboboxItemText>
                      </ComboboxItem>
                    ))}
                  </ComboboxContent>
                </ComboboxRoot>
              )}
            />
          </Field>
          <Field label="Date" invalid={!!errors.start_date} errorText={errors.start_date?.message}>
            <Controller
              control={control}
              name="start_date"
              render={({ field }) => (
                <DatePicker
                  name={field.name}
                  value={field.value ? [parseDate(field.value)] : []}
                  onValueChange={(e) => field.onChange(e.value[0] ? e.value[0].toString() : "")}
                />
              )}
            />
          </Field>
          <Field label="Start Time" invalid={!!errors.start_time} errorText={errors.start_time?.message}>
            <Input type="time" {...register("start_time")} />
          </Field>
          <Field label="End Time" invalid={!!errors.end_time} errorText={errors.end_time?.message}>
             <Input type="time" {...register("end_time")} />
          </Field>
           <Field label="Duration (minutes)" invalid={!!errors.duration} errorText={errors.duration?.message}>
            <Input
              type="number"
              {...register("duration")}
              placeholder="60"
            />
          </Field>
        </SimpleGrid>
        <Button onClick={handleSubmit} loading={loading} alignSelf="flex-end" colorPalette="white">
          Book Meeting
        </Button>
      </Stack>
    </div>
  )
}

export default MeetingBookingForm


