import React from "react";
import { defaultGame, listGames, loadGame } from "./games";
import { GameScreen } from "./gamescreen";
import { Plane, ScreenDefinition } from "./model";
import { addPlane, Loss, planeName, update } from "./update";
import { Button } from "./controls";
import { Planes } from "./planes";
import { CommandProcessor } from "./input";
import { Instructions } from "./instructions";
import { CommandOptions } from "./commandoptions";

type GameState = {
  screen: ScreenDefinition;
  clock: number;
  safePlanes: number;
  air: Plane[];
  ground: Plane[];
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

  const [startTime, setStartTime] = React.useState(0);
  const [skipped, setSkipped] = React.useState(0);
  const [gameState, setGameState] = React.useState(
    initGame(defaultGame(), false)
  );
  const [playing, setPlaying] = React.useState(false);
  const [instructions, setInstructions] = React.useState(false);
  const [lost, setLost] = React.useState<Loss>();

  const changeGame = React.useCallback(
    (update: string) => {
      if (playing) {
        console.error(`It should not be possible to change game while playing`);
        return;
      }
      try {
        const newGameState = initGame(update, false);
        setGame(update);
        setGameState(newGameState);
      } catch (err) {
        console.error(`Error changing game to '${update}': ${err}`);
      }
    },
    [playing]
  );

  const startPlaying = React.useCallback(() => {
    try {
      const newGameState = initGame(game, true);
      setGameState(newGameState);
      setSkipped(0);
      setStartTime(Date.now());
      setPlaying(true);
    } catch (err) {
      console.error(`Error starting game '${game}': ${err}`);
    }
  }, [game]);

  const updateGame = React.useCallback(() => {
    if (!playing) {
      return;
    }
    const updatedPlanes = {
      air: [...gameState.air],
      ground: [...gameState.ground],
    };
    const result = update(
      gameState.screen,
      updatedPlanes.air,
      updatedPlanes.ground,
      gameState.clock,
      gameState.safePlanes
    );
    if (result.type === "loss") {
      setLost(result);
    } else {
      const updatedState = { ...gameState, ...result, ...updatedPlanes };
      setGameState(updatedState);
    }
  }, [gameState, playing]);

  const checkTimeRef = React.useRef<number>(null);

  const getElapsed = React.useCallback(() => {
    return (Date.now() + skipped - startTime) / 1000;
  }, [skipped, startTime]);

  const checkTime = React.useCallback(() => {
    if (!playing || lost !== undefined) {
      checkTimeRef.current = null;
      return;
    }
    const elapsed = getElapsed();
    const ticks = Math.floor(elapsed / gameState.screen.updateSeconds);
    if (ticks > gameState.clock) {
      updateGame();
    }
    if (checkTimeRef.current !== null) {
      cancelAnimationFrame(checkTimeRef.current);
    }
    checkTimeRef.current = requestAnimationFrame(checkTime);
  }, [playing, getElapsed, gameState, updateGame, lost]);

  React.useEffect(() => {
    if (!playing) {
      return;
    }
    if (checkTimeRef.current !== null) {
      cancelAnimationFrame(checkTimeRef.current);
    }
    checkTimeRef.current = requestAnimationFrame(checkTime);
  }, [checkTime, playing]);

  const skip = React.useCallback(() => {
    const elapsed = getElapsed();
    const nextTick = (gameState.clock + 1) * gameState.screen.updateSeconds;
    console.log(`skip: elapsed: ${elapsed}, nextTick: ${nextTick}`);
    setSkipped((curr) => curr + (nextTick - elapsed) * 1000);
  }, [getElapsed, gameState]);

  const [currentCommand, setCurrentCommand] = React.useState("");
  const commandProcessor = React.useRef(new CommandProcessor());
  const onCommandToken = React.useCallback(
    (token: string) => {
      if (commandProcessor.current.processToken(token)) {
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
          } else if (update.type === "skip") {
            skip();
          } else if (update.type === "update") {
            const plane =
              gameState.air.find(
                (plane) => plane.planeNo == update.plane.planeNo
              ) ||
              gameState.ground.find(
                (plane) => plane.planeNo == update.plane.planeNo
              );
            if (plane) {
              const updatedPlane = { ...plane };
              if (updatedPlane.newAltitude != update.plane.newAltitude) {
                updatedPlane.newAltitude = update.plane.newAltitude;
              } else if (updatedPlane.status != update.plane.status) {
                updatedPlane.status = update.plane.status;
              } else {
                updatedPlane.newDir = update.plane.newDir;
                updatedPlane.delayed = update.plane.delayed;
                updatedPlane.delayedNo = update.plane.delayedNo;
              }
              const updatedPlanes = {
                air: [...gameState.air],
                ground: [...gameState.ground],
              };
              const airIndex = updatedPlanes.air.indexOf(plane);
              if (airIndex !== -1) {
                updatedPlanes.air[airIndex] = updatedPlane;
              }
              const groundIndex = updatedPlanes.ground.indexOf(plane);
              if (groundIndex !== -1) {
                updatedPlanes.ground[groundIndex] = updatedPlane;
              }
              setGameState({ ...gameState, ...updatedPlanes });
            }
          }
        }
      }
      setCurrentCommand(commandProcessor.current.display);
    },
    [gameState, skip]
  );

  const handleKeyUp = React.useCallback(
    (event: KeyboardEvent) => {
      if (!playing || lost) {
        return;
      }

      onCommandToken(event.key);
    },
    [playing, lost, onCommandToken]
  );

  React.useEffect(() => {
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyUp]);

  const tryAgain = React.useCallback(() => {
    setPlaying(false);
    setLost(undefined);
    const newGameState = initGame(game, false);
    setGameState(newGameState);
  }, [game]);

  return (
    <div className="w-fit mx-auto mt-4 flex flex-col gap-2">
      {instructions ? (
        <>
          <div className="flex flex-row-reverse px-4">
            <Button onClick={() => setInstructions(false)}>Close</Button>
          </div>
          <Instructions className="w-3xl p-2 overflow-y-auto" />
        </>
      ) : (
        <>
          <h1 className="text-3xl font-medium mx-4">ATC</h1>
          {playing ? null : (
            <>
              <div className="flex flex-row gap-2 mx-4 items-baseline">
                <label htmlFor={darkId}>Dark mode</label>
                <input
                  id={darkId}
                  type="checkbox"
                  checked={isDark}
                  onChange={() => setIsDark(!isDark)}
                />
                <label htmlFor={gamesId}>Games</label>
                <select
                  className="bg-gray-50 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  id={gamesId}
                  value={game}
                  onChange={(event) => changeGame(event.target.value)}
                  disabled={playing || lost !== undefined}
                >
                  {gameNames.map((el) => (
                    <option key={el} value={el}>
                      {el}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row gap-4 mx-4">
                <Button
                  onClick={() => startPlaying()}
                  disabled={playing || lost !== undefined}
                >
                  Start
                </Button>
                <Button onClick={() => setInstructions(!instructions)}>
                  Instructions
                </Button>
              </div>
            </>
          )}
          <div className="grid">
            <div
              className="font-mono col-start-1 row-start-1 m-4 grid gap-x-4"
              style={{
                gridTemplateColumns: `min(${
                  (60 * gameState.screen.width) / gameState.screen.height
                }vh,calc(98vw - 14rem)) 12rem`,
              }}
            >
              <GameScreen
                className="rounded-lg border"
                style={{
                  width: `min(${
                    (60 * gameState.screen.width) / gameState.screen.height
                  }vh,calc(98vw - 14rem))`,
                  height: `min(60,calc(${
                    (98 * gameState.screen.height) / gameState.screen.width
                  }vw - ${
                    (14 * gameState.screen.height) / gameState.screen.width
                  }rem))`,
                }}
                screen={gameState.screen}
                gridColor={isDark ? "#282" : "#000"}
                backgroundColor={isDark ? "#121" : "#eee"}
                planeColor={isDark ? "#4F4" : "#00f"}
                air={gameState.air}
              />
              <Planes
                {...gameState}
                height={`min(60vh,calc(${
                  (98 * gameState.screen.height) / gameState.screen.width
                }vw - ${
                  (14 * gameState.screen.height) / gameState.screen.width
                }rem))`}
              />
              <div className="flex flex-row gap-2">
                <div>Command:</div>
                <div>{currentCommand}</div>
              </div>
              <div>ATC - by Ed James</div>
              {playing && (
                <CommandOptions
                  className="col-start-1 col-span-2"
                  options={commandProcessor.current.options}
                  air={gameState.air}
                  ground={gameState.ground}
                  onCommand={(token) => onCommandToken(token)}
                  skipState={commandProcessor.current.skipState}
                />
              )}
            </div>
            {lost && (
              <div className="col-start-1 row-start-1 bg-slate-700/50">
                <div className="w-fit mt-32 mx-auto dark:bg-slate-700 flex flex-col p-8 bg-slate-100 border rounded-lg gap-4">
                  <div>
                    You lost because plane '{planeName(lost.plane)}'{" "}
                    {lost.message}
                  </div>
                  <div>
                    You survived for {gameState.clock} ticks, and successfully
                    directed {gameState.safePlanes} planes to their destinations
                  </div>
                  <div>
                    <Button onClick={() => tryAgain()}>Try again</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
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
    clock: 0,
    safePlanes: 0,
    air,
    ground,
  };
}
