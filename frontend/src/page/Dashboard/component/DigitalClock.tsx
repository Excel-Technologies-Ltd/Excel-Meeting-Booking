import React, { useState, useEffect } from "react";

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer); // Clean up on component unmount
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 hours to 12 (12-hour format)
    const formattedHours = hours.toString().padStart(2, "0");
    return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
  };

  return (
    <div
      className="text-xl "
      style={{
        fontFamily: "'Poppins', sans-serif",
        fontWeight: "600",
        color: "#FFFFFF",
        backgroundColor: "rgba(0, 0, 0, 0.75)", // Semi-transparent black
        padding: "10px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)", // Subtle shadow for depth
        border: "2px solid #00D084", // Matches the green used in your design
        textAlign: "center",
        display: "inline-block",
      }}
    >
      {formatTime(time)}
    </div>
  );
};

export default DigitalClock;
