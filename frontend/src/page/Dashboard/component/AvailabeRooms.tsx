import { useFrappeGetCall } from "frappe-react-sdk";
import CountdownTimer from "./CountDown";
import { useEffect } from "react";
import CapsuleButton from "./CapsuleButton";

type TMeeting = {
  name: string;
  title: string;
  meeting_room: string;
  meeting_date: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
};

export const AvailableRooms = () => {
  const currentTime = new Date(); // Current time

  const {
    data: roomsData,
    error,
    mutate,
  } = useFrappeGetCall(
    "excel_meeting_booking.api.get_running_or_upcoming_meetings"
  );
  console.log({ roomsData });
  useEffect(() => {
    const intervalId = setInterval(() => {
      mutate(); // Refetch API data
    }, 60000); // 1 minute interval

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [mutate]);
  // Handle error or loading state
  if (error) {
    return <div>Error loading rooms: {error.message}</div>;
  }

  if (!roomsData) {
    return <div>Loading...</div>;
  }

  const meetingsWithRoomData = roomsData?.message;

  // Function to get room status
  const getMeetingsWithStatus = (meetings: TMeeting[]) => {
    if (meetings.length === 0) {
      return { type: 1, status: "Available" };
    }

    const runningMeeting = meetings.find((meeting) => {
      const startTime = new Date(meeting.start_datetime);
      const endTime = new Date(meeting.end_datetime);
      console.log({ startTime, endTime });
      return startTime <= currentTime && endTime >= currentTime;
    });

    if (runningMeeting) {
      const nextMeetingList = meetings.filter(
        (meeting) => meeting.name !== runningMeeting.name
      );
      return {
        type: 2,
        status: "Ongoing",
        meeting: runningMeeting,
        nextMeeting: nextMeetingList.length > 0 ? nextMeetingList : [],
      };
    }

    const upcomingMeeting = meetings.find((meeting) => {
      const currentDayEnd = new Date(currentTime);
      currentDayEnd.setHours(23, 59, 59, 999);
      const startTime = new Date(meeting.start_datetime);
      return startTime > currentTime && startTime <= currentDayEnd;
    });

    if (upcomingMeeting) {
      console.log({ meetings });
      console.log(typeof meetings);
      const nextMeetingList = meetings.filter(
        (meeting) => meeting.name !== upcomingMeeting.name
      );
      console.log({ nextMeetingList });
      return {
        type: 3,
        status: "Upcoming",
        meeting: upcomingMeeting,
        nextMeeting: nextMeetingList.length > 0 ? nextMeetingList : [],
      };
    }
    // If no meetings today, check for future meetings

    return { type: 1, status: "Free Today", nextMeeting: meetings.slice(0, 3) };
  };

  const shortedMeetingTitle = (title: string) => {
    if (title.length > 30) {
      return title.substring(0, 30) + "...";
    }
    return title;
  };
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Meeting Rooms</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
        {meetingsWithRoomData?.map((details: any, index: any) => {
          const roomStatus = getMeetingsWithStatus(details.meetings || []);
          return (
            <div
              key={index}
              className="p-4 rounded-lg shadow-lg backdrop-blur-md bg-white bg-opacity-10  text-white"
            >
              {roomStatus.type === 2 && roomStatus?.meeting ? (
                <div className="flex flex-row justify-between items-center gap-2 w-full">
                  <div className="flex flex-col justify-between items-center  p-2 gap-3">
                    <h3 className="text-lg font-bold">{details?.name}</h3>
                    <CapsuleButton status="Ongoing" />
                    <p className="text-sm text-gray-300">
                      {shortedMeetingTitle(roomStatus?.meeting?.title)}
                    </p>

                    {/* <p className="text-sm text-gray-300">
                    End Time:{" "}
                    {new Date(
                      roomStatus.meeting.start_datetime
                    ).toLocaleTimeString()}
                  </p> */}
                    <p className="text-sm text-gray-300">
                      <p className="text-sm text-gray-300">
                        Ends in{" "}
                        <CountdownTimer
                          key={roomStatus.meeting.end_datetime || "2"}
                          endTime={new Date(roomStatus.meeting.end_datetime)}
                        />
                      </p>
                    </p>
                  </div>
                  <div className=" flex flex-col justify-center items-center  p-2 gap-2">
                    {roomStatus?.nextMeeting?.map((meeting: any) => (
                      <p>
                        <span className="text-sm text-gray-300">
                          {shortedMeetingTitle(meeting?.title)} <br />
                          <span className="text-sm font-bold text-gray-300">
                            {formatDateTime(meeting?.start_datetime)}
                          </span>
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              ) : roomStatus?.type === 3 && roomStatus?.meeting ? (
                <div className="flex flex-row justify-between items-center   gap-2">
                  <div className="mt-2 flex flex-col justify-between items-center  p-2 gap-3">
                    <h3 className="text-lg font-bold">{details?.name}</h3>
                    <CapsuleButton status="Upcoming" />
                    <p className="text-sm text-gray-300">
                      {shortedMeetingTitle(roomStatus?.meeting?.title)}
                    </p>

                    <p className="text-sm text-gray-300">
                      Starts after{" "}
                      <CountdownTimer
                        key={roomStatus?.meeting?.start_datetime || "1"}
                        endTime={new Date(roomStatus?.meeting?.start_datetime)}
                      />
                    </p>
                  </div>
                  <div className=" flex flex-col justify-center items-center  p-2 gap-2">
                    {roomStatus?.nextMeeting?.map((meeting: any) => (
                      <p>
                        <span className="text-sm text-gray-300">
                          {shortedMeetingTitle(meeting?.title)} <br />
                          <span className="text-sm font-bold text-gray-300">
                            {formatDateTime(meeting?.start_datetime)}
                          </span>
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex flex-row justify-between items-center  p-2 gap-3">
                  <div className="flex flex-col gap-3 items-center">
                    <h3 className="text-lg font-bold">{details?.name}</h3>
                    <CapsuleButton status="Available" />
                    <p className="text-sm text-gray-300">Available all day</p>
                  </div>
                  <div className=" flex flex-col justify-center items-center  p-2 gap-2  ">
                    {roomStatus?.nextMeeting?.map((meeting: any) => (
                      <p>
                        <span className="text-sm text-gray-300">
                          {shortedMeetingTitle(meeting?.title)} <br />
                          <span className="text-sm font-bold text-gray-300">
                            {formatDateTime(meeting?.start_datetime)}
                          </span>
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvailableRooms;

function formatDateTime(dateString: any) {
  const date = new Date(dateString);
  const options = { hour: "2-digit", minute: "2-digit", hour12: true };
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-US", options);

  return `${day}-${month}-${year} ${time}`;
}
