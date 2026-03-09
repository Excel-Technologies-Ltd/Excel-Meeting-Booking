
import { FormTimePicker } from "@/component/form-elements/FormTimePicker"
import { Checkbox } from "@/components/ui/checkbox"
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValueText } from "@/components/ui/select"
import { Button, CheckboxGroup, createListCollection, Input, SimpleGrid, Stack } from "@chakra-ui/react"
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

const repeatOptions = createListCollection({
  items: [
    { label: "Yes", value: "Yes" },
    { label: "No", value: "No" },
  ],
})

const repeatOnOptions = createListCollection({
  items: [
    { label: "Daily", value: "Daily" },
    { label: "Weekly", value: "Weekly" },
    { label: "Monthly", value: "Monthly" },
  ],
})

const daysOfWeek = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]


const MeetingBookingForm = ({}: Props) => {
  const [inputValue, setInputValue] = useState("")
  const debouncedSearchTerm = useDebounce(inputValue, 300)

  const [branchInputValue, setBranchInputValue] = useState("")
  const debouncedBranchSearchTerm = useDebounce(branchInputValue, 300)

  const { register, control, handleSubmit, errors, loading, meetingRooms, branches, watch } =
    useMeetingBookingForm(debouncedSearchTerm, debouncedBranchSearchTerm)

  const repeatThisMeeting = watch("repeat_this_meeting")

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
    <div className="px-5 my-2 border border-gray-400 max-w-7xl mx-auto p-4 rounded-lg shadow-lg backdrop-blur-md bg-white bg-opacity-10  text-white">
      <Stack gap={6}>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={6}>
          <Field required label="Meeting Title" invalid={!!errors.title} errorText={errors.title?.message}>
            <Input {...register("title")} placeholder="Meeting Title" _placeholder={{ color: "gray.400" }} />
          </Field>
          <Field
            label="Meeting Room"
            required
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
                    <ComboboxInput placeholder="Select Meeting Room" _placeholder={{ color: "gray.400" }} />
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
            required
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
                    <ComboboxInput placeholder="Select Branch"/>
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
          <Field required label="Date" invalid={!!errors.start_date} errorText={errors.start_date?.message}>
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
          <Field required label="Start Time" invalid={!!errors.start_time} errorText={errors.start_time?.message}>
            <FormTimePicker  name="start_time" control={control}  />
          </Field>
          <Field required label="End Time" invalid={!!errors.end_time} errorText={errors.end_time?.message}>
            <FormTimePicker name="end_time" control={control}  />
          </Field>
           <Field required label="Duration (minutes)" invalid={!!errors.duration} errorText={errors.duration?.message}>
            <Input
              type="number"
              {...register("duration")}
              placeholder="60"
              _placeholder={{ color: "gray.400" }}
            />
          </Field>
           <Field  required label="Repeat This Meeting" invalid={!!errors.repeat_this_meeting} errorText={errors.repeat_this_meeting?.message}>
            <Controller
              control={control}
              name="repeat_this_meeting"
              render={({ field }) => (
                <SelectRoot
                  collection={repeatOptions}
                  value={field.value ? [field.value] : []}
                  onValueChange={(e) => field.onChange(e.value[0])}
                  size="sm"
                >
                  <SelectTrigger>
                    <SelectValueText _placeholder={{ color: "gray.400" }} placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent color="black">
                    {repeatOptions.items.map((item) => (
                      <SelectItem item={item} key={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              )}
            />
           </Field>
           {repeatThisMeeting === "Yes" && (
            <>
           <Field  required label="Repeat On" invalid={!!errors.repeat_on} errorText={errors.repeat_on?.message}>
            <Controller
              control={control}
              name="repeat_on"
              render={({ field }) => (
                <SelectRoot
                  collection={repeatOnOptions}
                  value={field.value ? [field.value] : []}
                  onValueChange={(e) => field.onChange(e.value[0])}
                  size="sm"
                >
                  <SelectTrigger>
                    <SelectValueText  placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent color="black">
                    {repeatOnOptions.items.map((item) => (
                      <SelectItem item={item} key={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              )}
            />
           </Field>

           <Field  required label="Repeat Till" invalid={!!errors.end_date} errorText={errors.end_date?.message}>
            <Controller
              control={control}
              name="end_date"
              render={({ field }) => (
                <DatePicker
                  name={field.name}
                  value={field.value ? [parseDate(field.value)] : []}
                  onValueChange={(e) => field.onChange(e.value[0] ? e.value[0].toString() : "")}
                />
              )}
            />
           </Field>

           {/* <Field label="Repeat Days" invalid={!!errors.repeat_days} errorText={errors.repeat_days?.message}>
            <Stack direction="row" flexWrap="wrap" gap={3}></Stack>
            {daysOfWeek?.map((day) =>  (
              
            <Controller
              control={control}
              name="end_date"
              render={({ field }) => (
                <DatePicker
                  name={field.name}
                  value={field.value ? [parseDate(field.value)] : []}
                  onValueChange={(e) => field.onChange(e.value[0] ? e.value[0].toString() : "")}
                />
              )}
            />
            ))}
           </Field> */}
           <Field label="Repeat Days" invalid={!!errors.repeat_days} errorText={errors.repeat_days?.message}>
            <Controller
              control={control}
              name="repeat_days"
              render={({ field }) => (
                <CheckboxGroup
                  value={field.value || []}
                  onValueChange={(values) => field.onChange(values)}
                >
                  <Stack direction="row" flexWrap="wrap" gap={3}>
                    {daysOfWeek.map((day) => (
                      <Checkbox key={day} value={day} size="sm" colorPalette="green"
                        checked={(field.value || []).includes(day)}
                        onCheckedChange={(e) => {
                          const current = field.value || []
                          if (e.checked) {
                            field.onChange([...current, day])
                          } else {
                            field.onChange(current.filter((d: string) => d !== day))
                          }
                        }}
                      >
                        {day}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              )}
            />
           </Field>
            </>
           )}
        </SimpleGrid>
        <Button onClick={handleSubmit} loading={loading} alignSelf="flex-end" colorPalette="white" border={"fs.success"}>
          Book Meeting
        </Button>
      </Stack>

    </div>
  )
}

export default MeetingBookingForm


