export const Tabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => (
  <div className="flex space-x-4 mb-6">
    <button
      onClick={() => setActiveTab("events")}
      className={`px-4 py-2 rounded-lg ${
        activeTab === "events"
          ? "bg-primaryColor text-white"
          : "bg-gray-800 text-gray-300"
      }`}
    >
      Events
    </button>
    <button
      onClick={() => setActiveTab("available")}
      className={`px-4 py-2 rounded-lg ${
        activeTab === "available"
          ? "bg-primaryColor text-white"
          : "bg-gray-800 text-gray-300"
      }`}
    >
      Available Rooms
    </button>
  </div>
);
