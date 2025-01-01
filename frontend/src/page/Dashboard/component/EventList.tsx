export const EventsList = ({
  meetingsData,
  classifyMeeting,
}: {
  meetingsData: any[];
  classifyMeeting: (meeting: any) => string;
}) => (
  <div>
    <h2 className="text-xl font-semibold text-white mb-4">Events</h2>
    <div className="space-y-4">
      {meetingsData.map((meeting) => {
        const status = classifyMeeting(meeting);
        return (
          <div
            key={meeting.id}
            className="flex justify-between items-center p-4 rounded-lg shadow-lg backdrop-blur-md bg-white bg-opacity-10 border border-white/20"
          >
            <div>
              <h3 className="text-lg font-bold text-white">
                {new Date(meeting.startTime).toLocaleTimeString()} -{" "}
                {new Date(meeting.endTime).toLocaleTimeString()}
              </h3>
              <p className="text-sm text-gray-400">
                {new Date(meeting.startTime).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{meeting.room}</h3>
              <p className="text-sm text-gray-400">{meeting.title}</p>
            </div>
            <div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  status === "Running"
                    ? "bg-red-600 text-white"
                    : status === "Upcoming"
                    ? "bg-green-600 text-white"
                    : "bg-gray-600 text-gray-300"
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
