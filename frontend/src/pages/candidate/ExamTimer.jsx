import { useEffect, useState } from "react";

export default function ExamTimer({ minutes, onTimeUp }) {
  const [seconds, setSeconds] = useState(minutes * 60);

  useEffect(() => {
    if (seconds <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;

  return (
    <div className="text-red-600 font-semibold">
      ⏱ {min}:{sec.toString().padStart(2, "0")}
    </div>
  );
}
