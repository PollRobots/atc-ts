import {
  Airport,
  DISPLACEMENT,
  Exit,
  Plane,
  PlaneDest,
  ScreenDefinition,
} from "./model";
import { randomInteger } from "./random";

export function addPlane(
  screen: ScreenDefinition,
  air: Plane[],
  ground: Plane[]
): PlaneDest | undefined {
  const status = "marked";
  const planeType = randomInteger(0, 2);

  const numStarts = screen.exits.length + screen.airports.length;

  // pick a destination
  const rnd = randomInteger(0, numStarts);
  const [destType, destNo]: [PlaneDest, number] =
    rnd < screen.exits.length
      ? ["exit", rnd]
      : ["airport", rnd - screen.exits.length];

  // loop until we get a plane not near another
  for (let i = 0; i < numStarts; i++) {
    let rnd2 = 0;
    // loop until we get a different start point
    while ((rnd2 = randomInteger(0, numStarts)) == rnd);
    const partialPlane =
      rnd2 < screen.exits.length
        ? posAndDirFromDest(screen.exits, rnd2)
        : posAndDirFromDest(screen.airports, rnd2 - screen.exits.length);
    if (
      partialPlane.originType === "exit" &&
      air.some((airborne) => tooClose(airborne, partialPlane, 4))
    ) {
      continue;
    }

    const planeNo = nextPlane(air, ground);
    if (planeNo < 0) {
      return;
    }

    const plane: Plane = {
      status,
      planeType,
      planeNo,
      destNo,
      destType,
      delayed: false,
      delayedNo: 0,
      fuel: screen.width + screen.height,
      ...partialPlane,
    };

    if (plane.originType == "airport") {
      ground.push(plane);
    } else {
      air.push(plane);
    }
    return destType;
  }
  return;
}

function posAndDirFromDest(
  dests: Exit[] | Airport[],
  index: number
): Pick<
  Plane,
  | "originType"
  | "originNo"
  | "xpos"
  | "ypos"
  | "dir"
  | "newDir"
  | "altitude"
  | "newAltitude"
> {
  const dest = dests[index];
  return dest === undefined
    ? {
        originType: "exit",
        originNo: index,
        xpos: 0,
        ypos: 0,
        dir: 0,
        newDir: 0,
        altitude: 0,
        newAltitude: 0,
      }
    : {
        originType: dest.type,
        originNo: index,
        xpos: dest.x,
        ypos: dest.y,
        dir: dest.dir,
        newDir: dest.dir,
        altitude: dest.type === "exit" ? 7 : 0,
        newAltitude: dest.type === "exit" ? 7 : 0,
      };
}

function tooClose(
  p1: Pick<Plane, "altitude" | "xpos" | "ypos">,
  p2: Pick<Plane, "altitude" | "xpos" | "ypos">,
  dist: number
): boolean {
  return (
    Math.abs(p1.altitude - p2.altitude) <= dist &&
    Math.abs(p1.xpos - p2.xpos) <= dist &&
    Math.abs(p1.ypos - p2.ypos) <= dist
  );
}

let last_plane = -1;

function nextPlane(air: Plane[], ground: Plane[]): number {
  last_plane++;
  for (let i = 0; i != 26; i++) {
    const candidate = (last_plane + i) % 26;
    if (
      air.some((plane) => plane.planeNo == candidate) ||
      ground.some((plane) => plane.planeNo == candidate)
    ) {
      continue;
    } else {
      last_plane = candidate;
      return candidate;
    }
  }
  return -1;
}

export function planeName(plane: Plane) {
  if (plane.planeType == 0) {
    return String.fromCharCode("A".charCodeAt(0) + plane.planeNo);
  } else {
    return String.fromCharCode("a".charCodeAt(0) + plane.planeNo);
  }
}

const DEGREES = new Map([
  [0, 0],
  [1, 45],
  [2, 90],
  [3, 135],
  [4, 180],
  [5, 225],
  [6, 270],
  [7, 315],
]);

export function dirDeg(dir: number) {
  return DEGREES.get(dir) ?? -1;
}

export type Loss = {
  type: "loss";
  plane: Plane;
  message: string;
  timeStamp: number;
};

export type Update = {
  type: "success";
  clock: number;
  safePlanes: number;
};

export function update(
  screen: ScreenDefinition,
  air: Plane[],
  ground: Plane[],
  clock: number,
  safePlanes: number
): Update | Omit<Loss, "timeStamp"> {
  clock += 1;

  // put some planes in the air
  const readyForTakeOff = ground.filter((plane) => plane.newAltitude > 0);
  for (const plane of readyForTakeOff) {
    const index = ground.indexOf(plane);
    if (index >= 0) {
      ground.splice(index, 1);
    }
  }
  air.push(...readyForTakeOff);

  // altitude change and basic movement
  for (const plane of air) {
    // type 0 only move on even turns
    if (plane.planeType === 0 && (clock & 1) == 1) {
      continue;
    }

    plane.fuel--;
    if (plane.fuel < 0) {
      return { type: "loss", plane, message: "ran out of fuel." };
    }

    plane.altitude += Math.sign(plane.newAltitude - plane.altitude);

    if (!plane.delayed) {
      let dirDiff = plane.newDir - plane.dir;

      // allow for circle commands
      if (plane.newDir >= 0 && plane.newDir < 8) {
        if (dirDiff > 4) {
          dirDiff -= 8;
        } else if (dirDiff < -4) {
          dirDiff += 8;
        }
      }
      if (dirDiff > 2) {
        dirDiff = 2;
      } else if (dirDiff < -2) {
        dirDiff = -2;
      }
      plane.dir += dirDiff;
      if (plane.dir >= 8) {
        plane.dir -= 8;
      } else if (plane.dir < 0) {
        plane.dir += 8;
      }
    }

    const displacement = DISPLACEMENT.get(plane.dir) ?? { dx: 0, dy: 0 };

    plane.xpos += displacement.dx;
    plane.ypos += displacement.dy;

    if (plane.delayed) {
      const target = screen.beacons[plane.delayedNo];
      if (target && plane.xpos === target.x && plane.ypos === target.y) {
        plane.delayed = false;
        if (plane.status === "unmarked") {
          plane.status = "marked";
        }
      }
    }

    switch (plane.destType) {
      case "airport":
        const airport = screen.airports[plane.destNo];
        if (
          airport &&
          plane.xpos === airport.x &&
          plane.ypos === airport.y &&
          plane.altitude === 0
        ) {
          if (plane.dir != airport.dir) {
            return {
              type: "loss",
              plane,
              message: "landed in the wrong direction.",
            };
          } else {
            plane.status = "gone";
            continue;
          }
        }
        break;
      case "exit":
        const exit = screen.exits[plane.destNo];
        if (exit && plane.xpos === exit.x && plane.ypos === exit.y) {
          if (plane.altitude !== 9) {
            return {
              type: "loss",
              plane,
              message: "exited at the wrong altitude",
            };
          } else {
            plane.status = "gone";
            continue;
          }
        }
        break;
      default:
        return {
          type: "loss",
          plane,
          message: "has a bizarre destination, get help!",
        };
    }

    if (plane.altitude > 9) {
      return { type: "loss", plane, message: "xceeded flight ceiling." };
    }
    if (plane.altitude <= 0) {
      const airport = screen.airports.find(
        (airport) => airport.x === plane.xpos && airport.y === plane.ypos
      );
      if (airport) {
        if (plane.destType === "airport") {
          return {
            type: "loss",
            plane,
            message: "landed at the wrong airport.",
          };
        } else {
          return { type: "loss", plane, message: "landed instead of exiting." };
        }
      } else {
        return { type: "loss", plane, message: "crashed on the ground." };
      }
    }
    if (
      plane.xpos < 1 ||
      plane.xpos >= screen.width - 1 ||
      plane.ypos < 1 ||
      plane.ypos >= screen.height - 1
    ) {
      const exit = screen.exits.find(
        (exit) => exit.x === plane.xpos && exit.y === plane.ypos
      );
      if (exit) {
        if (plane.destType === "exit") {
          return { type: "loss", plane, message: "exited via the wrong exit." };
        } else {
          return { type: "loss", plane, message: "exited instead of landing." };
        }
      } else {
        return {
          type: "loss",
          plane,
          message: "illegally left the flight arena.",
        };
      }
    }
  }

  const gone = air.filter((plane) => plane.status === "gone");
  for (const goner of gone) {
    const index = air.indexOf(goner);
    if (index >= 0) {
      air.splice(index, 1);
    }
    safePlanes++;
  }

  for (let i = 0; i < air.length; i++) {
    const p1 = air[i];
    if (!p1) continue;
    for (let j = i + 1; j < air.length; j++) {
      const p2 = air[j];
      if (!p2) continue;
      if (tooClose(p1, p2, 1)) {
        return {
          type: "loss",
          plane: p1,
          message: `collided with plane '${planeName(p2)}'`,
        };
      }
    }
  }

  if (randomInteger(0, screen.newPlaneTime) == 0) {
    addPlane(screen, air, ground);
  }

  return { type: "success", clock, safePlanes };
}
