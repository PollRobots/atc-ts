import { dirNo } from "./games";
import { DISPLACEMENT, Plane, PlaneDest, ScreenDefinition } from "./model";

export const VERASE = "Backspace";
export const VKILL = "Escape";

type Context = {
  screen: ScreenDefinition;
  air: Plane[];
  ground: Plane[];
  plane?: Plane;
  destType?: PlaneDest;
  destNo?: number;
  dir?: "left" | "right" | "up" | "down";
  altitude?: number;
};

export type RuleType =
  | "plane"
  | "benum"
  | "dir"
  | "dirRel"
  | "altitude"
  | "cmd"
  | "meta";

type Rule = {
  token: string;
  toState: number;
  str: string;
  func?: (context: Context, input: string) => string;
  type: RuleType;
};

type State = Rule[];

type Stack = {
  str: string;
  rule: Rule;
  ch: string;
};

const st: State[] = [
  // 0 - specify plane
  [
    { token: "alpha", toState: 1, str: "%c:", func: setplane, type: "plane" },
    { token: "Enter", toState: -1, str: "", type: "meta" },
    { token: "?", toState: 12, str: " [a-z]<ret>", type: "meta" },
  ],
  // 1 action
  [
    { token: "t", toState: 2, str: " turn", func: turn, type: "cmd" },
    { token: "a", toState: 3, str: " altitude", type: "cmd" },
    { token: "c", toState: 4, str: " circle", func: circle, type: "cmd" },
    { token: "m", toState: 7, str: " mark", func: mark, type: "cmd" },
    { token: "u", toState: 7, str: " unmark", func: unmark, type: "cmd" },
    { token: "i", toState: 7, str: " ignore", func: ignore, type: "cmd" },
    { token: "?", toState: 12, str: " tacmui", type: "meta" },
  ],
  // 2 turn
  [
    { token: "l", toState: 6, str: " left", func: left, type: "cmd" },
    { token: "r", toState: 6, str: " right", func: right, type: "cmd" },
    { token: "L", toState: 4, str: " left 90", func: leftNinety, type: "cmd" },
    {
      token: "R",
      toState: 4,
      str: " right 90",
      func: rightNinety,
      type: "cmd",
    },
    { token: "t", toState: 11, str: " towards", type: "cmd" },
    { token: "w", toState: 4, str: " to 0", func: toDir, type: "dir" },
    { token: "e", toState: 4, str: " to 45", func: toDir, type: "dir" },
    { token: "d", toState: 4, str: " to 90", func: toDir, type: "dir" },
    { token: "c", toState: 4, str: " to 135", func: toDir, type: "dir" },
    { token: "x", toState: 4, str: " to 180", func: toDir, type: "dir" },
    { token: "z", toState: 4, str: " to 225", func: toDir, type: "dir" },
    { token: "a", toState: 4, str: " to 270", func: toDir, type: "dir" },
    { token: "q", toState: 4, str: " to 315", func: toDir, type: "dir" },
    { token: "?", toState: 12, str: " lrLRt<dir>", type: "meta" },
  ],
  // 3 altitude
  [
    { token: "+", toState: 10, str: " climb", func: climb, type: "cmd" },
    { token: "c", toState: 10, str: " climb", func: climb, type: "cmd" },
    { token: "-", toState: 10, str: " descend", func: descend, type: "cmd" },
    { token: "d", toState: 10, str: " descend", func: descend, type: "cmd" },
    {
      token: "number",
      toState: 7,
      str: " %c000 feet",
      func: setAlt,
      type: "altitude",
    },
    { token: "?", toState: 12, str: " +-cd[0-9]", type: "meta" },
  ],
  // 4 check for delay
  [
    { token: "@", toState: 9, str: " at", type: "cmd" },
    { token: "a", toState: 9, str: " at", type: "cmd" },
    { token: "Enter", toState: -1, str: "", type: "meta" },
    { token: "?", toState: 12, str: " @a<ret>", type: "meta" },
  ],
  // 5 delay target
  [
    { token: "number", toState: 7, str: "%c", func: delayb, type: "benum" },
    { token: "?", toState: 12, str: " [0-9]", type: "meta" },
  ],
  // 6  delay or direction
  [
    { token: "@", toState: 9, str: " at", type: "cmd" },
    { token: "a", toState: 9, str: " at", type: "cmd" },
    { token: "w", toState: 4, str: " 0", func: relDir, type: "dirRel" },
    { token: "e", toState: 4, str: " 45", func: relDir, type: "dirRel" },
    { token: "d", toState: 4, str: " 90", func: relDir, type: "dirRel" },
    { token: "c", toState: 4, str: " 135", func: relDir, type: "dirRel" },
    { token: "x", toState: 4, str: " 180", func: relDir, type: "dirRel" },
    { token: "z", toState: 4, str: " 225", func: relDir, type: "dirRel" },
    { token: "a", toState: 4, str: " 270", func: relDir, type: "dirRel" },
    { token: "q", toState: 4, str: " 315", func: relDir, type: "dirRel" },
    { token: "Enter", toState: -1, str: "", type: "meta" },
    { token: "?", toState: 12, str: " @a<dir><ret>", type: "meta" },
  ],
  // 7 done
  [
    { token: "Enter", toState: -1, str: "", type: "meta" },
    { token: "?", toState: 12, str: " <ret>", type: "meta" },
  ],
  // 8 number
  [
    { token: "number", toState: 4, str: "%c", func: benum, type: "benum" },
    { token: "?", toState: 12, str: " [0-9]", type: "meta" },
  ],
  // 9 beacon
  [
    { token: "b", toState: 5, str: " beacon #", type: "cmd" },
    { token: "*", toState: 5, str: " beacon #", type: "cmd" },
    { token: "?", toState: 12, str: " b*", type: "meta" },
  ],
  // 10 rel alt
  [
    {
      token: "number",
      toState: 7,
      str: " %c000 feet",
      func: setRelAlt,
      type: "altitude",
    },
    { token: "?", toState: 12, str: " [0-9]", type: "meta" },
  ],
  // 11 towards
  [
    { token: "b", toState: 8, str: " beacon #", func: beacon, type: "cmd" },
    { token: "*", toState: 8, str: " beacon #", func: beacon, type: "cmd" },
    { token: "e", toState: 8, str: " exit #", func: exit, type: "cmd" },
    { token: "a", toState: 8, str: " airport #", func: airport, type: "cmd" },
    { token: "?", toState: 12, str: " b*ea", type: "meta" },
  ],
  // 12 help
  [{ token: "", toState: -1, str: "", type: "meta" }],
];

const ALPHA = "abcdefghijklmnopqrstuvwxyz";
const NUMBER = "0123456789";

export class CommandProcessor {
  stack: Stack[] = [];

  constructor() {}

  rezero() {
    this.stack.splice(0, this.stack.length);
  }

  pop() {
    if (this.stack.length === 0) {
      return false;
    }
    this.stack.pop();
    return true;
  }

  push(rule: Rule, ch: string) {
    this.stack.push({
      str: rule.str.includes("%c") ? rule.str.replace("%c", ch) : rule.str,
      rule: rule,
      ch: ch,
    });
  }

  processToken(token: string) {
    const tokenType = ALPHA.includes(token)
      ? "alpha"
      : NUMBER.includes(token)
      ? "number"
      : "other";

    if (token === VERASE) {
      this.pop();
    } else if (token === VKILL) {
      this.rezero();
    } else {
      const rules = st[this.topState] ?? [];
      const match = rules.find(
        (rule) => rule.token === token || rule.token === tokenType
      );
      if (match) {
        this.push(match, token);
      }
    }
    return this.topState === -1;
  }

  get topState() {
    const top = this.stack.at(-1);
    if (top) {
      return top.rule.toState;
    } else {
      return 0;
    }
  }

  get skipState() {
    return this.topState === 0;
  }

  get display() {
    return this.stack.map((stack) => stack.str).join("");
  }

  get options(): Pick<Rule, "token" | "str" | "type">[] {
    const rules = st[this.topState] ?? [];
    return rules
      .map((rule) => ({ token: rule.token, str: rule.str, type: rule.type }))
      .filter(({ token }) => token !== "?");
  }

  get benumTarget(): "beacon" | "exit" | "airport" | undefined {
    if (this.options.some((option) => option.type === "benum")) {
      const target = this.stack.at(-1);
      if (target !== undefined) {
        switch (target.ch) {
          case "b":
          case "*":
            return "beacon";
          case "e":
            return "exit";
          case "a":
            return "airport";
        }
      }
    }
    return;
  }

  applyCommand(
    screen: ScreenDefinition,
    air: Plane[],
    ground: Plane[]
  ):
    | { type: "error"; message: string }
    | { type: "update"; plane: Plane }
    | { type: "skip" }
    | undefined {
    if (this.topState !== -1) {
      return;
    }

    const context: Context = {
      screen,
      air,
      ground,
    };

    for (const stack of this.stack) {
      if (stack.rule.func !== undefined) {
        const result = stack.rule.func(context, stack.ch);
        if (result.length) {
          this.rezero();
          return { type: "error", message: result };
        }
      }
    }

    this.rezero();

    const updated = context.plane;
    if (updated) {
      return { type: "update", plane: updated };
    }
    return { type: "skip" };
  }
}

function setplane(context: Context, ch: string): string {
  const plane = findplane(
    context,
    ch.toLowerCase().charCodeAt(0) - "a".charCodeAt(0)
  );
  if (!plane) {
    return "Unknown Plane";
  }
  context.plane = { ...plane };
  return "";
}

function turn(context: Context): string {
  if (context.plane && context.plane.altitude == 0) {
    return "Planes at airports may not change direction";
  }
  return "";
}

function circle(context: Context) {
  if (context.plane) {
    if (context.plane.altitude == 0) {
      return "Planes cannot circle on the ground";
    }
    context.plane.newDir = 8;
  }
  return "";
}

function left(context: Context) {
  if (context.plane) {
    context.dir = "left";
    context.plane.newDir = context.plane.dir - 1;
    if (context.plane.newDir < 0) {
      context.plane.newDir += 8;
    }
  }
  return "";
}

function right(context: Context) {
  if (context.plane) {
    context.dir = "right";
    context.plane.newDir = (context.plane.dir + 1) % 8;
  }
  return "";
}

function leftNinety(context: Context) {
  if (context.plane) {
    context.plane.newDir = context.plane.dir - 2;
    if (context.plane.newDir < 0) {
      context.plane.newDir += 8;
    }
  }
  return "";
}

function rightNinety(context: Context) {
  if (context.plane) {
    context.plane.newDir = (context.plane.dir + 2) % 8;
  }
  return "";
}

function delayb(context: Context, ch: string) {
  const plane = context.plane;
  if (!plane) {
    return "";
  }
  const num = Number(ch);

  const beacon = context.screen.beacons.at(num);
  if (!beacon) {
    return "Unknown beacon";
  }

  const xdiff = Math.sign(beacon.x - plane.xpos);
  const ydiff = Math.sign(beacon.y - plane.ypos);
  const displacement = DISPLACEMENT.get(plane.dir) ?? { dx: 0, dy: 0 };
  if (xdiff != displacement.dx || ydiff != displacement.dy) {
    return "Beacon is not in flight path";
  }
  plane.delayed = true;
  plane.delayedNo = num;

  if (context.destType !== undefined && context.destNo !== undefined) {
    const dest =
      context.destType === "beacon"
        ? context.screen.beacons.at(context.destNo)
        : context.destType === "exit"
        ? context.screen.exits.at(context.destNo)
        : context.destType === "airport"
        ? context.screen.airports.at(context.destNo)
        : undefined;
    if (!dest) {
      return "Bad case in delayb! Get help!";
    }
    const xdiff = dest.x - beacon.x;
    const ydiff = dest.y - beacon.y;

    if (xdiff === 0 && ydiff === 0) {
      return "Would already be there";
    }
    const newDir = dirFromDxDy(xdiff, ydiff);
    if (newDir === plane.dir) {
      return "Already going in that direction";
    }
    plane.newDir = newDir;
  }
  return "";
}

function beacon(context: Context) {
  context.destType = "beacon";
  return "";
}

function exit(context: Context) {
  context.destType = "exit";
  return "";
}

function airport(context: Context) {
  context.destType = "airport";
  return "";
}

function climb(context: Context) {
  context.dir = "up";
  return "";
}

function descend(context: Context) {
  context.dir = "down";
  return "";
}

function setAlt(context: Context, ch: string) {
  if (context.plane) {
    const altitude = Number(ch);
    if (
      context.plane.altitude === altitude &&
      context.plane.newAltitude === context.plane.altitude
    ) {
      return "Already at that altitude";
    }
    context.plane.newAltitude = altitude;
  }
  return "";
}

function setRelAlt(context: Context, ch: string) {
  if (context.plane) {
    const num = Number(ch);
    if (num === 0) {
      return "altitude not changed";
    }

    switch (context.dir) {
      case "up":
        context.plane.newAltitude = context.plane.altitude + num;
        break;
      case "down":
        context.plane.newAltitude = context.plane.altitude - num;
        break;
    }
    if (context.plane.newAltitude < 0) {
      return "Altitude would be too low";
    } else if (context.plane.newAltitude > 9) {
      return "Altitude would be too high";
    }
  }
  return "";
}

function benum(context: Context, ch: string) {
  context.destNo = Number(ch);

  const targets =
    context.destType === "beacon"
      ? context.screen.beacons
      : context.destType === "exit"
      ? context.screen.exits
      : context.destType === "airport"
      ? context.screen.airports
      : undefined;
  if (targets === undefined) {
    return "Unknown case in benum! Get help!";
  }
  const target = targets.at(context.destNo);
  if (!target) {
    return `Unknown ${context.destType}`;
  }
  if (context.plane) {
    context.plane.newDir = dirFromDxDy(
      target.x - context.plane.xpos,
      target.y - context.plane.ypos
    );
  }
  return "";
}

function toDir(context: Context, ch: string) {
  if (context.plane) {
    context.plane.newDir = dirNo(ch);
  }
  return "";
}

function relDir(context: Context, ch: string) {
  if (context.plane) {
    const angle = dirNo(ch);

    switch (context.dir) {
      case "left":
        context.plane.newDir = context.plane.dir - angle;
        if (context.plane.newDir < 0) {
          context.plane.newDir += 8;
        }
        break;
      case "right":
        context.plane.newDir = (context.plane.dir + angle) % 8;
        break;
    }
  }
  return "";
}

function mark(context: Context) {
  if (context.plane) {
    if (context.plane.altitude === 0) {
      return "Cannot mark planes on the ground";
    }
    if (context.plane.status === "marked") {
      return "Already marked";
    }
    context.plane.status = "marked";
  }
  return "";
}

function unmark(context: Context) {
  if (context.plane) {
    if (context.plane.altitude === 0) {
      return "Cannot unmark planes on the ground";
    }
    if (context.plane.status === "unmarked") {
      return "Already unmarked";
    }
    context.plane.status = "unmarked";
  }
  return "";
}

function ignore(context: Context) {
  if (context.plane) {
    if (context.plane.altitude === 0) {
      return "Cannot ignore planes on the ground";
    }
    if (context.plane.status === "ignored") {
      return "Already ignored";
    }
    context.plane.status = "ignored";
  }
  return "";
}

function dirFromDxDy(dx: number, dy: number) {
  const angle = Math.atan2(dy, dx);

  return Math.round((angle * 4) / Math.PI + 10) % 8;
}

function findplane(context: Context, planeNo: number): Plane | undefined {
  return (
    context.air.find((plane) => plane.planeNo === planeNo) ||
    context.ground.find((plane) => plane.planeNo === planeNo)
  );
}
