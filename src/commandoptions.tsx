import React from "react";
import { Plane } from "./model";
import { planeName } from "./update";
import { twJoin, twMerge } from "tailwind-merge";

type Props = {
  className?: string | undefined;
  options: { token: string; str: string }[];
  air: Plane[];
  ground: Plane[];
  onCommand: (token: string) => void;
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
}: Props) {
  const { filtered, hasEnter } = React.useMemo(() => {
    const seen = new Set<string>();
    seen.add("");
    const filtered = options.filter((option) => {
      if (seen.has(option.str)) {
        return false;
      }
      seen.add(option.str);
      return true;
    });
    return {
      filtered,
      hasEnter: options.some((option) => option.token === "Enter"),
    };
  }, [options]);
  return (
    <div className={twMerge("flex flex=row flex-wrap gap-2", className)}>
      <CommandContext.Provider value={{ onCommand }}>
        {filtered.map((option, index) => {
          switch (option.token) {
            case "alpha":
              return (
                <React.Fragment key={index}>
                  {air.map((plane) => (
                    <OptionButton
                      key={`${index}.plane.${planeName(plane)}`}
                      token={planeName(plane).toLowerCase()}
                    >
                      {planeName(plane)}
                    </OptionButton>
                  ))}
                  {ground.map((plane) => (
                    <OptionButton
                      key={`${index}.plane.${planeName(plane)}`}
                      token={planeName(plane).toLowerCase()}
                    >
                      {planeName(plane)}
                    </OptionButton>
                  ))}
                </React.Fragment>
              );
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
                >
                  {option.str}
                </OptionButton>
              );
          }
        })}
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
};

function OptionButton({ children, token }: OptionButtonProps) {
  const { onCommand } = React.useContext(CommandContext);
  return (
    <button
      className={twJoin(
        "border rounded-md p-1 min-w-8",
        token === "Enter"
          ? "bg-blue-500 hover:bg-blue-700 text-white dark:hover:bg-blue-400"
          : ["Backspace", "Escape"].includes(token)
          ? "bg-slate-500 hover:bg-slate-700 text-white dark:hover:bg-slate-400"
          : "hover:bg-gray-100 dark:hover:bg-slate-600"
      )}
      onClick={() => onCommand(token)}
    >
      {children}
    </button>
  );
}
