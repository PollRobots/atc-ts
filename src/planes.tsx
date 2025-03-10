import React from "react";
import { LOWFUEL, Plane } from "./model";
import { twJoin, twMerge } from "tailwind-merge";
import { dirDeg, planeName } from "./update";

type Props = {
  className?: string | undefined;
  air: Plane[];
  ground: Plane[];
  clock: number;
  safePlanes: number;
  height: string;
};

export function Planes({
  className,
  clock,
  air,
  ground,
  safePlanes,
  height,
}: Props) {
  return (
    <div className={twMerge("flex flex-col gap-2", className)}>
      <div className="flex flex-row gap-2">
        <div>Time:</div>
        <div className="w-8 text-right">{clock}</div>
        <div>Safe:</div>
        <div className="w-8">{safePlanes}</div>
      </div>
      <div
        className="flex flex-col rounded-md border"
        style={{ height: `calc(${height} - 2rem)` }}
      >
        <div className="flex flex-row px-1 bg-blue-300 dark:bg-blue-800 border-b">
          <div className="w-8">pl</div>
          <div className="w-8">dt</div>
          <div>command</div>
        </div>
        <div className="flex flex-col overflow-y-auto">
          <div className="text-gray-500 text-sm">Flying</div>
          {air.map((plane) => (
            <Plane key={`air.${plane.planeNo}`} {...plane} />
          ))}
          {air.length == 0 && <div>---- None ----</div>}
          <div className="text-gray-500 text-sm">Waiting for takeoff</div>
          {ground.map((plane) => (
            <Plane key={`ground.${plane.planeNo}`} {...plane} />
          ))}
          {ground.length == 0 && <div>---- None ----</div>}
        </div>
      </div>
    </div>
  );
}

function Plane(plane: Plane) {
  const commands = React.useMemo(() => {
    const commands: string[] = [];
    if (plane.altitude == 0) {
      commands.push(`Holding @ A${plane.originNo}`);
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
    return commands;
  }, [plane]);

  const hover = React.useRef<NodeJS.Timeout | number>(null);
  const popRef = React.useRef<HTMLDivElement>(null);
  const divRef = React.useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = React.useState<DOMRect>();

  const showPopover = React.useCallback(() => {
    if (hover.current !== null) {
      clearTimeout(hover.current);
    }
    hover.current = setTimeout(() => {
      hover.current = null;
      if (divRef.current) {
        const bounds = divRef.current.getBoundingClientRect();
        setBounds(bounds);
      }
      if (popRef.current) {
        popRef.current.showPopover();
      }
    }, 300);
  }, []);

  const hidePopover = React.useCallback(() => {
    if (hover.current !== null) {
      clearTimeout(hover.current);
      hover.current = null;
    }
    if (popRef.current) {
      popRef.current.hidePopover();
    }
  }, []);
  return (
    <div
      ref={divRef}
      className={twJoin(
        "flex flex-row px-1",
        plane.fuel < LOWFUEL
          ? "bg-red-100 dark:bg-red-900"
          : "odd:bg-blue-50 dark:odd:bg-blue-900"
      )}
      onMouseEnter={showPopover}
      onMouseLeave={hidePopover}
    >
      <div className="w-8">
        {planeName(plane)}
        {plane.altitude}
        {plane.fuel < LOWFUEL ? "*" : ""}
      </div>
      <div className="w-8">
        {plane.destType === "airport" ? "A" : "E"}
        {plane.destNo}:
      </div>
      <div>{commands.join("")}</div>
      <div
        popover="manual"
        ref={popRef}
        className="px-4 py-2 bg-white dark:bg-slate-800 text-black dark:text-white border rounded-lg shadow-lg gap-2"
        style={
          bounds !== undefined
            ? {
                left: `calc(${bounds.left}px + 0.5rem)`,
                ...(bounds.top < (window.visualViewport?.height ?? 1000 * 2) / 3
                  ? {
                      top: bounds.top + bounds.height,
                    }
                  : {
                      top: `calc(${bounds.top}px - 7rem)`,
                    }),
              }
            : undefined
        }
      >
        <div>Plane {planeName(plane)}</div>
        <div>
          Destination: {plane.destType} #{plane.destNo}
        </div>
        <div>
          Altitude: {plane.altitude},000 feet
          {plane.newAltitude != plane.altitude
            ? plane.altitude == 0
              ? ", taking off"
              : `, ${
                  plane.newAltitude > plane.altitude ? "climbing" : "descending"
                } to ${plane.newAltitude},000 feet`
            : ""}
        </div>
        <div>
          Heading: {dirDeg(plane.dir)}°
          {plane.newDir != plane.dir
            ? plane.newDir >= 0 && plane.newDir < 8
              ? `, turning to ${dirDeg(plane.newDir)}°`
              : ", circling"
            : ""}
          {plane.delayed ? `, at beacon #${plane.delayedNo}` : ""}
        </div>
      </div>
    </div>
  );
}
