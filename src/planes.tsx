import React from "react";
import { LOWFUEL, Plane } from "./model";
import { twMerge } from "tailwind-merge";
import { dirDeg, planeName } from "./update";

type Props = {
  className?: string | undefined;
  air: Plane[];
  ground: Plane[];
  clock: number;
  safePlanes: number;
};

export function Planes({ className, clock, air, ground, safePlanes }: Props) {
  return (
    <div className={twMerge("flex flex-col", className)}>
      <div className="flex flex-row gap-2">
        <div>Time:</div>
        <div className="w-8">{clock}</div>
        <div>Safe:</div>
        <div className="w-8">{safePlanes}</div>
      </div>
      <div className="flex flex-col rounded-md border h-full">
        <div className="flex flex-row px-1 bg-blue-300 dark:bg-blue-800">
          <div className="w-8">pl</div>
          <div className="w-8">dt</div>
          <div>command</div>
        </div>
        {air.map((plane) => (
          <Plane key={`air.${plane.planeNo}`} {...plane} />
        ))}
        {ground.map((plane) => (
          <Plane key={`ground.${plane.planeNo}`} {...plane} />
        ))}
      </div>
    </div>
  );
}

function Plane(plane: Plane) {
  const commands: string[] = [];
  if (plane.altitude == 0) {
    commands.push(`Holding & A${plane.originNo}`);
  } else if (plane.newDir >= 8 || plane.newDir < 0) {
    commands.push("Circle");
  } else if (plane.newDir != plane.dir) {
    commands.push(`${dirDeg(plane.newDir)}°`);
  }

  if (plane.delayed) {
    commands.push(` @ B${plane.delayedNo}`);
  }

  if (
    commands.length === 0 &&
    (plane.status === "unmarked" || plane.status === "ignored")
  ) {
    commands.push("---------");
  }
  return (
    <div className="flex flex-row px-1 odd:bg-blue-50 dark:odd:bg-blue-900">
      <div className="w-8">
        {planeName(plane)}
        {plane.altitude}
        {plane.fuel < LOWFUEL ? "*" : ""}
      </div>
      <div className="w-8">
        {plane.destType === "airport" ? "A" : "E"}
        {plane.destNo}
      </div>
      <div>{commands.join("")}</div>
    </div>
  );
}
