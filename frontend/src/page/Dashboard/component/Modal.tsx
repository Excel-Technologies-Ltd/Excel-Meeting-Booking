export const AvailableRoomModal = ({
  selectedRoom,
  meetings,
  closeModal,
}: {
  selectedRoom: string;
  meetings: any[];
  closeModal: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
    <div className="relative bg-white bg-opacity-10 backdrop-blur-lg border border-white/20 rounded-lg p-6 w-96 shadow-lg">
      {/* Close Button */}
      <button
        onClick={closeModal}
        className="absolute top-2 right-2 text-gray-200 hover:text-white"
      >
        ✕
      </button>
      {/* Modal Title */}
      <h2 className="text-xl font-bold text-white mb-4">
        Meetings in {selectedRoom}
      </h2>
      {/* Meeting List */}
      <ul className="space-y-2">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <li
              key={meeting.id}
              className="p-2 rounded-lg bg-white bg-opacity-20 backdrop-blur-md shadow border border-gray-300 text-gray-100"
            >
              <h3 className="text-lg font-semibold">{meeting.title}</h3>
              <p className="text-sm text-gray-300">
                {new Date(meeting.startTime).toLocaleTimeString()} -{" "}
                {new Date(meeting.endTime).toLocaleTimeString()}
              </p>
              <p className="text-sm text-gray-300">
                {new Date(meeting.startTime).toLocaleDateString()} 
              </p>
            </li>
          ))
        ) : (
          <p className="text-sm text-gray-300">No meetings scheduled.</p>
        )}
      </ul>
    </div>
  </div>
);
