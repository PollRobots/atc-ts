import React from "react";
import { Loss, planeName } from "./update";
import { Button } from "./controls";

type Props = {
  clock: number;
  safePlanes: number;
  startTime: number;
  onClose: () => void;
} & Loss;

export function Lost({
  plane,
  message,
  clock,
  safePlanes,
  onClose,
  startTime,
  timeStamp,
}: Props) {
  const duration = React.useMemo(() => {
    const totalSeconds = Math.round((timeStamp - startTime) / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60);
    const parts: string[] = [];
    if (hours > 0) {
      parts.push(`${hours} ${pluralize(hours, "hour", "hours")}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} ${pluralize(minutes, "minute", "minutes")}`);
    }
    parts.push(
      `${parts.length > 0 ? "and " : ""}${seconds} ${pluralize(
        seconds,
        "second",
        "seconds"
      )}`
    );
    return parts.join(", ");
  }, [startTime, timeStamp]);
  return (
    <div className="w-fit mt-32 mx-auto dark:bg-slate-700 flex flex-col p-8 bg-slate-100 border rounded-lg gap-4">
      <div>
        You lost because plane '{planeName(plane)}' {message}
      </div>
      <div>
        You survived for {clock} turns and played for {duration}.
      </div>
      {safePlanes > 0 ? (
        <div>
          You safely directed {safePlanes}{" "}
          {pluralize(safePlanes, "plane", "planes")} to{" "}
          {pluralize(safePlanes, "its", "their")}{" "}
          {pluralize(safePlanes, "destination", "destinations")}.
        </div>
      ) : (
        <div>You did not direct any plane safely to a destination.</div>
      )}
      <div>
        <Button onClick={onClose}>Try again</Button>
      </div>
    </div>
  );
}

function pluralize(value: number, singular: string, plural: string) {
  return value === 1 ? singular : plural;
}
