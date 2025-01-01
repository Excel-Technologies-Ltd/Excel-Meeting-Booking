import React, { useEffect, useState } from "react";

type CountdownTimerProps = {
  endTime: Date;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const now = new Date();
    const diff = Math.max(0, endTime.getTime() - now.getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  return (
    <span>
      {timeLeft.hours ? timeLeft.hours + "h " : ""}
      {timeLeft.minutes ? timeLeft.minutes + "m " : ""}
      {timeLeft.seconds ? timeLeft.seconds + "s" : ""}
    </span>
  );
};

export default CountdownTimer;
