import { Controller } from "react-hook-form"
import TimePicker, { TimeProps } from "./TimePicker"

type FormTimePickerProps = {
  name: string
  control: any
} & TimeProps

export function FormTimePicker({ name, control, ...props }: FormTimePickerProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TimePicker
          {...props}
          value={field.value}
          onChange={field.onChange}
          period="12"
        />
      )}
    />
  )
}