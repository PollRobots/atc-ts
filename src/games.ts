import gameList from "./games/Game_List?raw";
import {
  Airport,
  Beacon,
  Exit,
  Line,
  ScreenDefinition,
  ScreenPos,
} from "./model";

const GAMES: Record<string, string> = {
  default: require("./games/default?raw"),
  easy: require("./games/easy?raw"),
  crossover: require("./games/crossover?raw"),
  Killer: require("./games/Killer?raw"),
  game_2: require("./games/game_2?raw"),
  Atlantis: require("./games/Atlantis?raw"),
  OHare: require("./games/OHare?raw"),
  "Tic-Tac-Toe": require("./games/Tic-Tac-Toe?raw"),
  airports: require("./games/airports?raw"),
  box: require("./games/box?raw"),
  crosshatch: require("./games/crosshatch?raw"),
  game_3: require("./games/game_3?raw"),
  game_4: require("./games/game_4?raw"),
  novice: require("./games/novice?raw"),
  "two-corners": require("./games/two-corners?raw"),
};

export function defaultGame() {
  const games = listGames();
  const first = games[0];
  if (!first) {
    throw new Error("No default game is defined");
  }
  return first;
}

export function listGames() {
  return gameList.split("\n").filter((el) => Boolean(el));
}

const DEFINITIONS_RE = /^(update|newplane|width|height)\s*=\s*(\d+)\s*;$/;
const LINES_RE = /^(beacon|exit|line|airport)\s*:(.*)?;$/;

export function loadGame(name: string): ScreenDefinition {
  const raw = GAMES[name];
  if (!raw) {
    throw new Error(`No game file for ${name}`);
  }

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((el) => Boolean(el));

  const screen: Partial<ScreenDefinition> = {
    exits: [],
    lines: [],
    beacons: [],
    airports: [],
  };

  const accum = [];
  for (const line of lines) {
    accum.push(line);
    if (!line.endsWith(";")) {
      continue;
    }
    const declaration = accum.splice(0, accum.length).join(" ");

    const definition = declaration.match(DEFINITIONS_RE);
    if (definition) {
      const value = Number(definition[2]);
      switch (definition[1]) {
        case "update":
          if (screen.updateSeconds !== undefined) {
            throw new Error("Redefinition of 'update'.");
          }
          if (value < 1) {
            throw new Error("'update' is too small.");
          }
          screen.updateSeconds = value;
          break;
        case "newplane":
          if (screen.newPlaneTime !== undefined) {
            throw new Error("Redefinition of 'newplane'.");
          }
          if (value < 1) {
            throw new Error("'update' is too small.");
          }
          screen.newPlaneTime = value;
          break;
        case "width":
          if (screen.width !== undefined) {
            throw new Error("Redefinition of 'width'.");
          }
          if (value < 3) {
            throw new Error("'width' is too small.");
          }
          screen.width = value;
          break;
        case "height":
          if (screen.height !== undefined) {
            throw new Error("Redefinition of 'height'.");
          }
          if (value < 3) {
            throw new Error("'height' is too small.");
          }
          screen.height = value;
          break;
        default:
          throw new Error(`Unexpected line in ${name}: ${declaration}`);
      }
      continue;
    }

    const lineMatch = declaration.match(LINES_RE);
    if (lineMatch) {
      if (!screenIsNotPartial(screen)) {
        throw new Error("width, height, update, and newplane must be defined");
      }
      const pointList = lineMatch[2] ?? "";
      switch (lineMatch[1]) {
        case "beacon": {
          const beaconPoints = parsePointList(pointList, false);
          screen.beacons.push(
            ...beaconPoints.map<Beacon>((pt) => {
              checkPoint(screen, pt);
              return { type: "beacon", ...pt };
            })
          );
          break;
        }
        case "exit": {
          const exitPoints = parsePointList(pointList, true);
          screen.exits.push(
            ...exitPoints.map<Exit>((pt) => {
              checkEdge(screen, pt);
              checkEdgeDir(screen, pt);
              return { type: "exit", dir: pt.dir ?? 0, x: pt.x, y: pt.y };
            })
          );
          break;
        }
        case "line":
          const lineDefinitions = parseLineList(pointList);
          lineDefinitions.forEach((lineDef) => checkLine(screen, lineDef));
          screen.lines.push(...lineDefinitions);
          break;
        case "airport": {
          const airportPoints = parsePointList(pointList, true);
          screen.airports.push(
            ...airportPoints.map<Airport>((pt) => {
              checkPoint(screen, pt);
              return { type: "airport", dir: pt.dir ?? 0, x: pt.x, y: pt.y };
            })
          );
          break;
        }
        default:
          throw new Error(`Unexpected line in ${name}: ${declaration}`);
      }
      continue;
    }

    throw new Error(`Unexpected line in ${name}: ${declaration}`);
  }

  if (!screenIsNotPartial(screen)) {
    throw new Error("width, height, update, and newplane must be defined");
  }

  if (screen.exits.length + screen.airports.length < 2) {
    throw new Error("Need at least 2 airports and/or exits.");
  }

  return screen;
}

const POINT_RE = /\(\s*(\d+)\s+(\d+)\s*\)\s*/g;
const POINT_DIR_RE = /\(\s*(\d+)\s+(\d+)\s+([qweadzxc])\s*\)\s*/g;

export function dirNo(input: string): number {
  const dir = "wedcxzaq".indexOf(input.toLowerCase());
  if (input.length === 1 && dir >= 0) {
    return dir;
  }
  throw new Error(`'${input}' is not a valid direction`);
}

function parsePointList(input: string, hasDirections: boolean): ScreenPos[] {
  const re = hasDirections ? POINT_DIR_RE : POINT_RE;
  const getDir = hasDirections
    ? (match: RegExpExecArray) => dirNo(match[3] ?? "")
    : () => undefined;

  let match: RegExpExecArray | null = null;
  const points: ScreenPos[] = [];
  while ((match = re.exec(input)) !== null) {
    points.push({
      x: Number(match[1]),
      y: Number(match[2]),
      dir: getDir(match),
    });
  }
  return points;
}

const LINE_RE =
  /\[\s*\(\s*(\d+)\s+(\d+)\s*\)\s*\(\s*(\d+)\s+(\d+)\s*\)\s*\]\s*/g;

function parseLineList(input: string): Line[] {
  const lines: Line[] = [];
  let match: RegExpExecArray | null = null;
  while ((match = LINE_RE.exec(input)) !== null) {
    lines.push({
      p1: { x: Number(match[1]), y: Number(match[2]) },
      p2: { x: Number(match[3]), y: Number(match[4]) },
    });
  }
  return lines;
}

function checkLine(
  screen: Pick<ScreenDefinition, "width" | "height">,
  { p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } }: Line
) {
  checkLinePoint(screen, x1, y1);
  checkLinePoint(screen, x2, y2);

  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);

  if (dx != dy && dx != 0 && dy != 0) {
    throw new Error("Bad line endpoints");
  }
}

function checkLinePoint(
  { width, height }: Pick<ScreenDefinition, "width" | "height">,
  x: number,
  y: number
) {
  if (x < 0 || x >= width) {
    throw new Error(`X value(${x}) out of range(0-${width})`);
  }
  if (y < 0 || y >= height) {
    throw new Error(`Y value(${y}) out of range(0-${height})`);
  }
}

function screenIsNotPartial(
  screen: Partial<ScreenDefinition>
): screen is ScreenDefinition {
  return (
    screen.width !== undefined &&
    screen.height !== undefined &&
    screen.updateSeconds !== undefined &&
    screen.newPlaneTime !== undefined &&
    screen.beacons !== undefined &&
    screen.exits !== undefined &&
    screen.lines !== undefined &&
    screen.airports !== undefined
  );
}

function checkPoint(
  { width, height }: Pick<ScreenDefinition, "width" | "height">,
  { x, y }: ScreenPos
) {
  if (x < 1 || x >= width - 1) {
    throw new Error(`X value(${x}) out of range(0-${width}).`);
  }
  if (y < 1 || y >= height - 1) {
    throw new Error(`Y value9${y}) out of range(0-${height}).`);
  }
}

function checkEdge(
  screen: Pick<ScreenDefinition, "width" | "height">,
  pt: ScreenPos
) {
  if (
    !(
      pt.x == 0 ||
      pt.x == screen.width - 1 ||
      pt.y == 0 ||
      pt.y == screen.height - 1
    )
  ) {
    throw new Error("edge is not on an edge.");
  }
}

function checkEdgeDir(
  { width, height }: Pick<ScreenDefinition, "width" | "height">,
  { x, y, dir }: ScreenPos
) {
  const ex = x == 0 ? 0 : x == width - 1 ? 2 : 1;
  const ey = y == 0 ? 0 : y == height - 1 ? 2 : 1;

  const isBad = () => {
    if (dir === undefined) {
      return true;
    }
    // Directions are.
    //   7  0  1
    //    \ | /
    //   6-- --2
    //    / | \
    //   5  4  3

    // Edge combos are.
    //
    // 00---10---20
    // |          |
    // |          |
    // 01   11   21
    // |          |
    // |          |
    // 02---12---22
    switch (ex * 16 + ey) {
      case 0x00:
        return dir !== 3;
      case 0x01:
        return dir < 1 || dir > 3;
      case 0x02:
        return dir !== 1;
      case 0x10:
        return dir < 3 || dir > 5;
      case 0x11:
        return false;
      case 0x12:
        return dir > 1 && dir < 7;
      case 0x20:
        return dir !== 5;
      case 0x21:
        return dir < 5;
      case 0x22:
        return dir !== 7;
      default:
        return true;
    }
  };
  if (isBad()) {
    throw new Error("Bad direction for entrace at exit.");
  }
}
