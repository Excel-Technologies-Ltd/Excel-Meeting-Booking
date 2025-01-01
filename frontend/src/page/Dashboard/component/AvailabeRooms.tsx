import { useFrappeAuth, useFrappeGetCall } from "frappe-react-sdk";
import CountdownTimer from "./CountDown";
import { useEffect } from "react";
import CapsuleButton from "./CapsuleButton";

type TMeeting = {
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
      return { type: 2, status: "Ongoing", meeting: runningMeeting };
    }

    const upcomingMeeting = meetings.find((meeting) => {
      const currentDayEnd = new Date(currentTime);
      currentDayEnd.setHours(23, 59, 59, 999);
      const startTime = new Date(meeting.start_datetime);
      return startTime > currentTime && startTime <= currentDayEnd;
    });

    if (upcomingMeeting) {
      return { type: 3, status: "Upcoming", meeting: upcomingMeeting };
    }
    // If no meetings today, check for future meetings

    return { type: 1, status: "Free Today" };
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Meeting Rooms</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetingsWithRoomData?.map((details: any, index: any) => {
          const roomStatus = getMeetingsWithStatus(details.meetings || []);

          return (
            <div
              key={index}
              className="p-4 rounded-lg shadow-lg backdrop-blur-md bg-white bg-opacity-10 border border-white/20 text-white"
            >
              {/* Room Name */}
              <h3 className="text-lg font-bold">{details.name}</h3>

              {/* Room Status */}
              {roomStatus.type === 2 && roomStatus.meeting ? (
                <div className="mt-2">
                  <CapsuleButton status="Ongoing" />

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
              ) : roomStatus.type === 3 && roomStatus.meeting ? (
                <div className="mt-2">
                  <CapsuleButton status="Upcoming" />

                  <p className="text-sm text-gray-300">
                    Starts after{" "}
                    <CountdownTimer
                      key={roomStatus.meeting.start_datetime || "1"}
                      endTime={new Date(roomStatus.meeting.start_datetime)}
                    />
                  </p>
                </div>
              ) : (
                <div className="mt-2">
                  <CapsuleButton status="Available" />
                  <p className="text-sm text-gray-300">Available all day</p>
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
