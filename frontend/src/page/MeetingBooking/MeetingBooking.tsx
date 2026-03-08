import Title from "../../component/title/Title"
import MeetingBookingForm from "./component/MeetingBookingForm"

type Props = {}

const MeetingBooking = ({}: Props) => {
  return (
    <div className="px-6 py-2 max-w-7xl mx-auto">
      <Title size="2xl" color="white" weight="semibold" className="">  
       New Meeting Booking
      </Title>

      <MeetingBookingForm />
    </div>
  )
}

export default MeetingBooking