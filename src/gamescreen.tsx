import React from "react";
import { Plane, ScreenDefinition } from "./model";
import { dirDeg, planeName } from "./update";

type Props = {
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  screen: ScreenDefinition;
  air: Plane[];
  gridColor?: string | undefined;
  lineColor?: string | undefined;
  backgroundColor?: string | undefined;
  planeColor: string;
  wantBenum: "beacon" | "exit" | "airport" | undefined;
  onBenum: (benum: number) => void;
};

export function GameScreen({
  className,
  style,
  screen,
  air,
  gridColor,
  lineColor,
  backgroundColor,
  planeColor,
  wantBenum,
  onBenum,
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
      <g stroke={gridColor ?? "currentColor"} strokeDasharray="25 50 25 0">
        {vertical}
        {horizontal}
      </g>
    );
  }, [screen.width, screen.height, gridColor]);

  return (
    <svg
      className={className}
      viewBox={`-50 -50 ${100 * screen.width} ${100 * screen.height}`}
      style={style}
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
            wantBenum={wantBenum === "beacon"}
            onClick={() => onBenum(i)}
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
            wantBenum={wantBenum === "exit"}
            onClick={() => onBenum(i)}
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
            wantBenum={wantBenum === "airport"}
            onClick={() => onBenum(i)}
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
  wantBenum,
  onClick,
}: {
  index: number;
  x: number;
  y: number;
  color: string;
  backgroundColor: string;
  wantBenum: boolean;
  onClick: () => void;
}) {
  // 30 * cos(30) = 25.98
  // 30 * sin(30) = 15
  return (
    <>
      <circle
        cx={x * 100}
        cy={y * 100}
        r={50}
        fill={backgroundColor}
        stroke={wantBenum ? "red" : undefined}
        strokeWidth={4}
      />
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
      {wantBenum && (
        <circle
          cx={x * 100}
          cy={y * 100}
          r={100}
          fill="transparent"
          onClick={wantBenum ? onClick : undefined}
        />
      )}
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
  wantBenum,
  onClick,
}: {
  index: number;
  x: number;
  y: number;
  dir: number;
  color: string;
  backgroundColor: string;
  wantBenum: boolean;
  onClick: () => void;
}) {
  // 30 * cos(30) = 25.98
  // 30 * sin(30) = 15
  return (
    <>
      <circle
        cx={x * 100}
        cy={y * 100}
        r={50}
        fill={backgroundColor}
        stroke={wantBenum ? "red" : undefined}
        strokeWidth={4}
      />
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
      {wantBenum && (
        <circle
          cx={x * 100}
          cy={y * 100}
          r={100}
          fill="transparent"
          onClick={wantBenum ? onClick : undefined}
        />
      )}
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
  wantBenum,
  onClick,
}: {
  x: number;
  y: number;
  index: number;
  color: string;
  backgroundColor: string;
  wantBenum: boolean;
  onClick: () => void;
}) {
  return (
    <>
      <circle
        cx={x * 100}
        cy={y * 100}
        r={50}
        fill={backgroundColor}
        stroke={wantBenum ? "red" : undefined}
        strokeWidth={4}
      />
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
      {wantBenum && (
        <circle
          cx={x * 100}
          cy={y * 100}
          r={100}
          fill="transparent"
          onClick={wantBenum ? onClick : undefined}
        />
      )}
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
        r={50}
        fill="none"
        stroke={plane.status === "marked" ? color : undefined}
        strokeWidth={4}
      />
      <PlaneIcon
        backgroundColor={backgroundColor}
        color={color}
        cx={plane.xpos * 100}
        cy={plane.ypos * 100}
        size={100}
        angle={dirDeg(plane.dir)}
        marked={plane.status === "marked"}
        type={plane.planeType === 0 ? "prop" : "jet"}
      />
      <text
        fill={color}
        x={plane.xpos * 100}
        y={plane.ypos * 100 + 80}
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

const PROP_PATH =
  "m 426,222 c -19,0 -38,-4 -57,-4 -1,0 -1,-16 -2,-17 l 0,-71 -12,-63 C 354,65 352,64 349,64 H 292 L 278,144 277,217 c 1,2 -0,3 -2,3 l -154,10 c -3,0 -5,-1 -7,-3 l -15,-45 c -3,-4 -9,-6 -14,-6 H 41 c -1,0 -1,1 -1,2 l -8,71 c 0,0 -0,8 0,12 L 40,333 c -1,2 -1,3 2,3 H 86 c 8,0 9,-1 13,-6 l 16,-46 c 2,-2 4,-3 7,-3 l 153,11 c 2,0 3,2 2,4 l 2,72 L 292,448 h 57 c 3,-0 5,-1 7,-4 L 367,382 367,295 c 0,-1 2,-1 3,-1 19,-1 37,-4 56,-4 22,0 36,-1 36,-12 C 461,269 471,261 480,256 471,251 461,245 462,234 462,223 448,222 426,222 Z";
const JET_PATH =
  "M407.72,224c-3.4,0-14.79.1-18,.3l-64.9,1.7a1.83,1.83,0,0,1-1.69-.9L193.55,67.56A9,9,0,0,0,186.89,64H160l73,161a2.35,2.35,0,0,1-2.26,3.35l-121.69,1.8a8.06,8.06,0,0,1-6.6-3.1l-37-45c-3-3.9-8.62-6-13.51-6H33.08c-1.29,0-1.1,1.21-.75,2.43L52.17,249.9a16.3,16.3,0,0,1,0,11.9L32.31,333c-.59,1.95-.52,3,1.77,3H52c8.14,0,9.25-1.06,13.41-6.3l37.7-45.7a8.19,8.19,0,0,1,6.6-3.1l120.68,2.7a2.7,2.7,0,0,1,2.43,3.74L160,448h26.64a9,9,0,0,0,6.65-3.55L323.14,287c.39-.6,2-.9,2.69-.9l63.9,1.7c3.3.2,14.59.3,18,.3C452,288.1,480,275.93,480,256S452.12,224,407.72,224Z";

function PlaneIcon({
  backgroundColor,
  color,
  cx,
  cy,
  size,
  angle,
  marked,
  type,
}: {
  backgroundColor: string;
  color: string;
  cx: number;
  cy: number;
  size: number;
  angle: number;
  marked: boolean;
  type: "jet" | "prop";
}) {
  return (
    <g
      transform={`translate(${cx - size / 2} ${cy - size / 2}) rotate(${
        angle - 90
      } ${size / 2} ${size / 2}) scale(${size / 512})  `}
    >
      <path
        d={type === "jet" ? JET_PATH : PROP_PATH}
        fill={backgroundColor}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={marked ? 32 : 16}
      />
    </g>
  );
}
