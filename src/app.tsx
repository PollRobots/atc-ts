import React from "react";
import { defaultGame, listGames, loadGame } from "./games";
import { GameScreen } from "./gamescreen";
import { Plane, ScreenDefinition } from "./model";
import { addPlane, Loss, planeName, update } from "./update";
import { Button } from "./controls";
import { Planes } from "./planes";
import { CommandProcessor } from "./input";

type GameState = {
  screen: ScreenDefinition;
  air: Plane[];
  ground: Plane[];
  clock: number;
  safePlanes: number;
};

export function App() {
  const [isDark, setIsDark] = React.useState(false);
  const darkId = React.useId();

  React.useEffect(() => {
    const body = document.body;
    if (body.classList.contains("dark") != isDark) {
      body.classList.toggle("dark");
    }
  }, [isDark]);

  const gameNames = React.useMemo(() => listGames(), []);
  const [game, setGame] = React.useState(gameNames[0] ?? "Unknown");
  const gamesId = React.useId();

  const [gameState, setGameState] = React.useState(
    initGame(defaultGame(), false)
  );
  const [playing, setPlaying] = React.useState(false);
  const [lost, setLost] = React.useState<Loss>();

  React.useEffect(() => {
    const gameState = initGame(game, playing);
    setGameState(gameState);
    if (playing) {
      setTimeout(
        () => onTick(gameState),
        gameState.screen.updateSeconds * 1000
      );
    }
  }, [game, playing]);

  const onTick = React.useCallback((gameState: GameState) => {
    const clonedState: GameState = JSON.parse(JSON.stringify(gameState));
    const result = update(
      clonedState.screen,
      clonedState.air,
      clonedState.ground,
      clonedState.clock,
      clonedState.safePlanes
    );
    if (result.type === "loss") {
      setLost(result);
    } else {
      clonedState.clock = result.clock;
      clonedState.safePlanes = result.safePlanes;
      setGameState(clonedState);
      setTimeout(
        () => onTick(clonedState),
        gameState.screen.updateSeconds * 1000
      );
    }
  }, []);

  const gameRef = React.useRef<HTMLDivElement>(null);
  const [currentCommand, setCurrentCommand] = React.useState("");
  const commandProcessor = React.useRef(new CommandProcessor());
  const handleKeyUp = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!playing) {
        console.log(event.key);
        return;
      }

      if (commandProcessor.current.processToken(event.key)) {
        setCurrentCommand(commandProcessor.current.display);
        const update = commandProcessor.current.applyCommand(
          gameState.screen,
          gameState.air,
          gameState.ground
        );
        if (update) {
          if (update.type === "error") {
            setCurrentCommand(update.message);
            return;
          } else if (update.type === "update") {
            const plane =
              gameState.air.find(
                (plane) => plane.planeNo == update.plane.planeNo
              ) ||
              gameState.ground.find(
                (plane) => plane.planeNo == update.plane.planeNo
              );
            if (plane) {
              if (plane.newAltitude != update.plane.newAltitude) {
                plane.newAltitude = update.plane.newAltitude;
              } else if (plane.status != update.plane.status) {
                plane.status = update.plane.status;
              } else {
                plane.newDir = update.plane.newDir;
                plane.delayed = update.plane.delayed;
                plane.delayedNo = update.plane.delayedNo;
              }
            }
          }
        }
      }
      setCurrentCommand(commandProcessor.current.display);
    },
    [gameState, playing]
  );

  return (
    <div className="w-fit mx-auto mt-4 shadow-xl flex flex-col gap-2">
      <h1 className="text-3xl font-medium m-4">ATC</h1>
      <div className="flex flex-row gap-2">
        <label htmlFor={darkId}>Dark mode</label>
        <input
          id={darkId}
          type="checkbox"
          checked={isDark}
          onChange={() => setIsDark(!isDark)}
        />
      </div>
      <div className="flex flex-row gap-2">
        <label htmlFor={gamesId}>Games</label>
        <select
          id={gamesId}
          value={game}
          onChange={(event) => setGame(event.target.value)}
          disabled={playing || lost !== undefined}
        >
          {gameNames.map((el) => (
            <option key={el} value={el}>
              {el}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Button
          onClick={() => {
            setPlaying(true);
            gameRef.current?.focus();
          }}
          disabled={playing || lost !== undefined}
        >
          Start
        </Button>
      </div>
      <div className="grid">
        <div
          className="flex flex-row font-mono col-start-1 row-start-1"
          onKeyUp={(event) => handleKeyUp(event)}
          tabIndex={0}
          ref={gameRef}
        >
          <GameScreen
            className="m-4 rounded-lg w-2xl"
            screen={gameState.screen}
            gridColor="#000"
            backgroundColor="#eee"
            planeColor="#00F"
            air={gameState.air}
          />
          <Planes className="m-4" {...gameState} />
        </div>
        {lost && (
          <div className="col-start-1 row-start-1 bg-slate-700/50">
            <div className="w-fit mt-32 mx-auto dark:bg-slate-700 flex flex-col p-8 bg-slate-100 border rounded-lg gap-4">
              <div>
                You lost because plane '{planeName(lost.plane)}' {lost.message}
              </div>
              <div>
                You survived for {gameState.clock} ticks, and successfully
                directed {gameState.safePlanes} planes to their destinations
              </div>
              <div>
                <Button
                  onClick={() => {
                    setLost(undefined);
                    setPlaying(false);
                  }}
                >
                  Try again
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {playing && lost === undefined && (
        <div className="flex flex-row gap-2">
          <div>Command:</div>
          <div>{currentCommand}</div>
        </div>
      )}
    </div>
  );
}

function initGame(name: string, start: boolean): GameState {
  const screen = loadGame(name);
  const air: Plane[] = [];
  const ground: Plane[] = [];

  if (start) {
    addPlane(screen, air, ground);
  }
  return {
    screen,
    air,
    ground,
    clock: 0,
    safePlanes: 0,
  };
}
