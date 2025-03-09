export type ScreenPos = {
  x: number;
  y: number;
  dir?: number | undefined;
};

export type Line = {
  p1: ScreenPos;
  p2: ScreenPos;
};

export type Exit = { type: "exit"; dir: number } & ScreenPos;
export type Beacon = { type: "beacon" } & ScreenPos;
export type Airport = { type: "airport"; dir: number } & ScreenPos;

export type ScreenDefinition = {
  width: number;
  height: number;
  updateSeconds: number;
  newPlaneTime: number;
  exits: Exit[];
  lines: Line[];
  beacons: Beacon[];
  airports: Airport[];
};

export type PlaneStatus = "marked" | "unmarked" | "ignored" | "gone";
export type PlaneDest = "nodest" | "beacon" | "exit" | "airport";

export const LOWFUEL = 15;

export type Plane = {
  status: PlaneStatus;
  planeNo: number;
  planeType: number;
  originNo: number;
  originType: PlaneDest;
  destNo: number;
  destType: PlaneDest;
  altitude: number;
  newAltitude: number;
  dir: number;
  newDir: number;
  fuel: number;
  xpos: number;
  ypos: number;
  delayed: boolean;
  delayedNo: number;
};

/*
type Score = {
  name: string;
  host: string;
  game: string;
  planes: number;
  time: number;
  realTime: number;
};
*/

type Displacement = {
  dx: number;
  dy: number;
};

export const DISPLACEMENT = new Map<number, Displacement>([
  [0, { dx: 0, dy: -1 }],
  [1, { dx: 1, dy: -1 }],
  [2, { dx: 1, dy: 0 }],
  [3, { dx: 1, dy: 1 }],
  [4, { dx: 0, dy: 1 }],
  [5, { dx: -1, dy: 1 }],
  [6, { dx: -1, dy: 0 }],
  [7, { dx: -1, dy: -1 }],
]);
