import React from "react";
import { Plane, ScreenDefinition } from "./model";
import { planeName } from "./update";

type Props = {
  className?: string | undefined;
  screen: ScreenDefinition;
  air: Plane[];
  gridColor?: string | undefined;
  lineColor?: string | undefined;
  backgroundColor?: string | undefined;
  planeColor: string;
};

export function GameScreen({
  className,
  screen,
  air,
  gridColor,
  lineColor,
  backgroundColor,
  planeColor,
}: Props) {
  const grid = React.useMemo(() => {
    const vertical = new Array(screen.width)
      .fill(0)
      .map((_, i) => (
        <line
          key={`vert.${i}`}
          x1={i * 100}
          y1={0}
          x2={i * 100}
          y2={(screen.height - 1) * 100}
        />
      ));
    const horizontal = new Array(screen.height)
      .fill(0)
      .map((_, i) => (
        <line
          key={`horz.${i}`}
          y1={i * 100}
          x1={0}
          y2={i * 100}
          x2={(screen.width - 1) * 100}
        />
      ));
    return (
      <g stroke={gridColor} strokeDasharray="25 50 25 0">
        {vertical}
        {horizontal}
      </g>
    );
  }, [screen.width, screen.height]);

  return (
    <svg
      className={className}
      viewBox={`-50 -50 ${100 * screen.width} ${100 * screen.height}`}
    >
      <rect
        x={-50}
        y={-50}
        width={100 * screen.width}
        height={100 * screen.height}
        fill={backgroundColor}
      />
      {grid}
      <g stroke={lineColor ?? gridColor ?? "currentColor"} strokeWidth={2}>
        {screen.lines.map((line, i) => (
          <line
            key={`line.${i}`}
            x1={line.p1.x * 100}
            y1={line.p1.y * 100}
            x2={line.p2.x * 100}
            y2={line.p2.y * 100}
          />
        ))}
      </g>
      <g>
        {screen.beacons.map((beacon, i) => (
          <Beacon
            key={`beacon.${i}`}
            index={i}
            {...beacon}
            color={lineColor ?? gridColor ?? "currentColor"}
            backgroundColor={backgroundColor ?? "white"}
          />
        ))}
      </g>
      <g>
        {screen.exits.map((exit, i) => (
          <Exit
            key={`exit.${i}`}
            index={i}
            {...exit}
            color={lineColor ?? gridColor ?? "currentColor"}
            backgroundColor={backgroundColor ?? "white"}
          />
        ))}
      </g>
      <g>
        {screen.airports.map((airport, i) => (
          <Airport
            key={`airport.${i}`}
            index={i}
            {...airport}
            color={lineColor ?? gridColor ?? "currentColor"}
            backgroundColor={backgroundColor ?? "white"}
          />
        ))}
      </g>
      <g>
        {air.map((plane) => (
          <Plane
            key={`plane.${plane.planeNo}`}
            plane={plane}
            color={planeColor}
            backgroundColor={backgroundColor || "white"}
          />
        ))}
      </g>
    </svg>
  );
}

function Beacon({
  index,
  x,
  y,
  color,
  backgroundColor,
}: {
  index: number;
  x: number;
  y: number;
  color: string;
  backgroundColor: string;
}) {
  // 30 * cos(30) = 25.98
  // 30 * sin(30) = 15
  return (
    <>
      <circle cx={x * 100} cy={y * 100} r={40} fill={backgroundColor} />
      <path
        d={`M ${x * 100} ${
          y * 100
        } m 0 -30 v 60 m 0 -30 m -25.98 -15 l 51.96 30 m -25.98 -15 m 25.98 -15 l -51.96 30`}
        stroke={color}
        fill="none"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <text x={x * 100 + 30} y={y * 100 + 70} fill={color} fontSize={70}>
        {index}
      </text>
    </>
  );
}

function Airport({
  index,
  x,
  y,
  dir,
  color,
  backgroundColor,
}: {
  index: number;
  x: number;
  y: number;
  dir: number;
  color: string;
  backgroundColor: string;
}) {
  // 30 * cos(30) = 25.98
  // 30 * sin(30) = 15
  return (
    <>
      <circle cx={x * 100} cy={y * 100} r={40} fill={backgroundColor} />
      <path
        d={`M ${x * 100} ${y * 100} ${directionArrow(dir)}`}
        stroke={color}
        fill="none"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <text x={x * 100 + 30} y={y * 100 + 70} fill={color} fontSize={70}>
        {index}
      </text>
    </>
  );
}

function directionArrow(dir: number): string {
  switch (dir) {
    case 0:
      // north
      return "m -15,30 v -30 m -15,15 l 30,-30 30,30 m -15,-15 v 30";
    case 2:
      // east
      return "m -30,15 h 30 m -15,15 l 30,-30 -30,-30 m 15,15, h -30";
    case 4:
      // south
      return "m -15,-30 v 30 m -15,-15 l 30,30 30,-30 m -15,15 v -30";
    case 6:
      // west
      return "m 30,15 h -30 m 15,15 l -30,-30 30,-30 m -15,15, h 30";
  }
  return "";
}

function Exit({
  x,
  y,
  index,
  color,
  backgroundColor,
}: {
  x: number;
  y: number;
  index: number;
  color: string;
  backgroundColor: string;
}) {
  return (
    <>
      <circle cx={x * 100} cy={y * 100} r={40} fill={backgroundColor} />
      <text
        x={x * 100}
        y={y * 100}
        fill={color}
        fontSize={70}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {index}
      </text>
    </>
  );
}

function Plane({
  plane,
  color,
  backgroundColor,
}: {
  plane: Plane;
  color: string;
  backgroundColor: string;
}) {
  return (
    <>
      <circle
        cx={plane.xpos * 100}
        cy={plane.ypos * 100}
        r={40}
        fill={backgroundColor}
        stroke={plane.status === "marked" ? color : undefined}
        strokeWidth={4}
      />
      <text
        fill={color}
        x={plane.xpos * 100}
        y={plane.ypos * 100}
        fontSize={70}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {planeName(plane)}
        {plane.altitude}
      </text>
    </>
  );
}
