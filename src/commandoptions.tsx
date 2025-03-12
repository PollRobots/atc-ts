import React from "react";
import { Plane } from "./model";
import { planeName } from "./update";
import { twJoin, twMerge } from "tailwind-merge";
import { RuleType } from "./input";

type Props = {
  className?: string | undefined;
  options: { token: string; str: string; type: RuleType }[];
  air: Plane[];
  ground: Plane[];
  onCommand: (token: string) => void;
  getBenum: (benum: boolean) => void;
  skipState: boolean;
};

const CommandContext = React.createContext<Pick<Props, "onCommand">>({
  onCommand: () => {},
});

export function CommandOptions({
  className,
  options,
  air,
  ground,
  onCommand,
  skipState,
  getBenum,
}: Props) {
  const { filtered, hasEnter, hasPlanes, hasDir, hasAltitude, hasBenum } =
    React.useMemo(() => {
      const seen = new Set<string>();
      seen.add("");
      const filtered = options.filter((option) => {
        if (seen.has(option.str)) {
          return false;
        }
        seen.add(option.str);
        return option.type === "cmd";
      });
      return {
        filtered,
        hasEnter: options.some((option) => option.token === "Enter"),
        hasPlanes: options.some((option) => option.type === "plane"),
        hasDir: options.some(
          (option) => option.type === "dir" || option.type === "dirRel"
        ),
        hasAltitude: options.some((option) => option.type === "altitude"),
        hasBenum: options.some((option) => option.type === "benum"),
      };
    }, [options]);

  React.useEffect(() => getBenum(hasBenum), [getBenum, hasBenum]);

  return (
    <div className={twMerge("flex flex=row flex-wrap gap-2", className)}>
      <CommandContext.Provider value={{ onCommand }}>
        {hasPlanes && (
          <>
            {air.map((plane) => (
              <OptionButton
                key={`plane.${planeName(plane)}`}
                token={planeName(plane).toLowerCase()}
              >
                {planeName(plane)}
              </OptionButton>
            ))}
            {ground.map((plane) => (
              <OptionButton
                key={`plane.${planeName(plane)}`}
                token={planeName(plane).toLowerCase()}
              >
                {planeName(plane)}
              </OptionButton>
            ))}
          </>
        )}
        {filtered.map((option, index) => {
          switch (option.token) {
            case "number":
              return (
                <React.Fragment key={index}>
                  {new Array(10).fill(0).map((_, i) => (
                    <OptionButton
                      key={`${index}.number.${i}`}
                      token={i.toString()}
                    >
                      {option.str.replace("%c", i.toString())}
                    </OptionButton>
                  ))}
                </React.Fragment>
              );
            default:
              return (
                <OptionButton
                  key={`${index}.action.${option.token}`}
                  token={option.token}
                  capitalize
                >
                  {option.str}
                </OptionButton>
              );
          }
        })}
        {hasAltitude && <AltitudeButton />}
        {hasDir && <DirButton />}
        {hasEnter && (
          <OptionButton token="Enter">
            {skipState ? "Skip" : "Send"}
          </OptionButton>
        )}
        {!skipState && (
          <>
            <OptionButton token="Backspace">Undo</OptionButton>
            <OptionButton token="Escape">Reset</OptionButton>
          </>
        )}
      </CommandContext.Provider>
    </div>
  );
}

type OptionButtonProps = {
  children: React.ReactNode;
  token: string;
  capitalize?: boolean;
};

function OptionButton({ children, token, capitalize }: OptionButtonProps) {
  const { onCommand } = React.useContext(CommandContext);
  return (
    <button
      className={twJoin(
        "border rounded-md p-1 min-w-8 pointer-events-auto",
        token === "Enter"
          ? "bg-blue-500 hover:bg-blue-700 text-white dark:hover:bg-blue-400"
          : ["Backspace", "Escape"].includes(token)
          ? "bg-slate-500 hover:bg-slate-700 text-white dark:hover:bg-slate-400"
          : "hover:bg-gray-100 dark:hover:bg-slate-600",
        capitalize && "capitalize"
      )}
      onClick={() => onCommand(token)}
    >
      {children}
    </button>
  );
}

function AltitudeButton() {
  const { onCommand } = React.useContext(CommandContext);
  return (
    <div className="flex flex-row border rounded-md pointer-events-auto">
      {new Array(10).fill(0).map((_, i) => (
        <div
          className={twJoin(
            "hover:bg-gray-100 dark:hover:bg-slate-600 py-1 px-2",
            "border-r last:border-none"
          )}
          key={i}
          onClick={() => onCommand(i.toString())}
        >
          {i}
        </div>
      ))}
    </div>
  );
}

type Direction = {
  token: "w" | "e" | "d" | "c" | "x" | "z" | "a" | "q";
  degrees: number;
  arrow: string;
};

const DIRECTIONS: Direction[] = [
  { token: "w", degrees: 0, arrow: "🡱" },
  { token: "e", degrees: 45, arrow: "🡵" },
  { token: "d", degrees: 90, arrow: "🡲" },
  { token: "c", degrees: 135, arrow: "🡶" },
  { token: "x", degrees: 180, arrow: "🡳" },
  { token: "z", degrees: 215, arrow: "🡷" },
  { token: "a", degrees: 270, arrow: "🡰" },
  { token: "q", degrees: 315, arrow: "🡴" },
];

function Arrow({ angle, size }: { angle: number; size: string | number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512">
      <g transform={`rotate(${angle} 256 256)`}>
        <path
          d="M 112,244 L 256,100 400,244 M 256,120 V 412"
          fill="none"
          points="112 244 256 100 400 244"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={48}
        />
      </g>
    </svg>
  );
}

function DirButton() {
  const { onCommand } = React.useContext(CommandContext);
  return (
    <div className="flex flex-row border rounded-md pointer-events-auto">
      {DIRECTIONS.map((dir) => (
        <div
          className={twJoin(
            "hover:bg-gray-100 dark:hover:bg-slate-600 py-1 px-2",
            "border-r last:border-none grid items-center justify-items-center"
          )}
          key={dir.token}
          onClick={() => onCommand(dir.token)}
        >
          <Arrow size="1.5rem" angle={dir.degrees} />
        </div>
      ))}
    </div>
  );
}
