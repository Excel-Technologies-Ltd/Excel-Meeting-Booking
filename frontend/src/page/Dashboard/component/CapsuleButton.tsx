import React from "react";

type CapsuleButtonProps = {
  status: "Available" | "Ongoing" | "Upcoming" | "Free Today";
};

const CapsuleButton: React.FC<CapsuleButtonProps> = ({ status }) => {
  // Define colors for each status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
      case "Free Today":
        return "bg-green-500 text-white";
      case "Ongoing":
        return "bg-red-500 text-white";
      case "Upcoming":
        return "bg-blue-700 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const statusColor = getStatusColor(status);

  return (
    <div
      className={`px-4 py-2 rounded-full font-semibold text-sm shadow-md ${statusColor} w-24 mb-2`}
    >
      {status}
    </div>
  );
};

export default CapsuleButton;
