
import DatePickerComponent from "@/component/ui/DatePicker"

type Props = {}

const MeetingBookingForm = ({}: Props) => {
  return (
    <div className="p-6 border border-gray-300 rounded-lg bg-white/10 mt-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="">
          <DatePickerComponent />
        </div>
      </div>
    </div>

  )
}

export default MeetingBookingForm