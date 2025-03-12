import React from "react";
import { Settings } from "./settings";
import { Button, Select } from "./controls";

type Props = {
  disabled?: boolean;
  gameNames: string[];
  onCommand: (cmd: "play" | "instructions" | "license") => void;
  updateSettings: (settings: Settings) => void;
} & Settings;

export function GameControls({
  isDark,
  isTouch,
  game,
  disabled,
  onCommand,
  updateSettings,
  gameNames,
}: Props) {
  const darkId = React.useId();
  const touchId = React.useId();
  const gamesId = React.useId();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 m-4 items-baseline">
        <label htmlFor={darkId}>Dark mode</label>
        <input
          id={darkId}
          type="checkbox"
          checked={isDark}
          onChange={() => updateSettings({ isDark: !isDark, isTouch, game })}
        />
        <label htmlFor={touchId}>Touch mode</label>
        <input
          id={touchId}
          type="checkbox"
          checked={isTouch}
          onChange={() => updateSettings({ isDark, isTouch: !isTouch, game })}
        />
        <label htmlFor={gamesId}>Games</label>
        <Select
          id={gamesId}
          value={game}
          onChange={(event) =>
            updateSettings({ isDark, isTouch, game: event.target.value })
          }
          disabled={disabled}
        >
          {gameNames.map((el) => (
            <option key={el} value={el}>
              {el}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-row gap-4 mx-4">
        <Button onClick={() => onCommand("play")} disabled={disabled}>
          Start
        </Button>
        <Button onClick={() => onCommand("instructions")}>Instructions</Button>
        <Button onClick={() => onCommand("license")}>License</Button>
      </div>
    </div>
  );
}
