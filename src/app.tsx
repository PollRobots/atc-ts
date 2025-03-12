import React from "react";
import { defaultGame, listGames, loadGame } from "./games";
import { GameScreen } from "./gamescreen";
import { Plane, ScreenDefinition } from "./model";
import { addPlane, Loss, update } from "./update";
import { Button } from "./controls";
import { Planes } from "./planes";
import { CommandProcessor } from "./input";
import { Instructions } from "./instructions";
import { CommandOptions } from "./commandoptions";
import { License } from "./license";
import { Lost } from "./lost";
import { Settings, storeSettings } from "./settings";
import { GameControls } from "./gamesettings";

type GameState = {
  screen: ScreenDefinition;
  clock: number;
  safePlanes: number;
  air: Plane[];
  ground: Plane[];
};

export function App(props: Settings) {
  const gameNames = React.useMemo(() => listGames(), []);
  const [{ isDark, isTouch, game }, setSettings] =
    React.useState<Settings>(props);

  React.useEffect(() => {
    const body = document.body;
    if (body.classList.contains("dark") != isDark) {
      body.classList.toggle("dark");
    }
  }, [isDark]);

  React.useEffect(() => {
    storeSettings({ isDark, isTouch, game });
  }, [isDark, isTouch, game]);

  const [startTime, setStartTime] = React.useState(0);
  const [skipped, setSkipped] = React.useState(0);
  const [gameState, setGameState] = React.useState(
    initGame(defaultGame(), false)
  );
  const [playing, setPlaying] = React.useState(false);
  const [instructions, setInstructions] = React.useState(false);
  const [license, setLicense] = React.useState(false);
  const [lost, setLost] = React.useState<Loss>();
  const [wantBenum, setWantBenum] = React.useState(false);

  React.useEffect(() => {
    if (!playing) {
      try {
        const newGameState = initGame(game, false);
        setGameState(newGameState);
      } catch (err) {
        console.error(`Error changing game to '${update}': ${err}`);
      }
    }
  }, [playing, game]);

  const startPlaying = React.useCallback(() => {
    try {
      const newGameState = initGame(game, true);
      setGameState(newGameState);
      setSkipped(0);
      setStartTime(Date.now());
      setPlaying(true);
      if (isTouch) {
        document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error(`Error starting game '${game}': ${err}`);
    }
  }, [game, isTouch]);

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
      if (document.fullscreenElement !== null) {
        document.exitFullscreen();
      }
      commandProcessor.current.rezero();
      setLost({ ...result, timeStamp: Date.now() });
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

  if (instructions || license) {
    return (
      <div className="w-fit mx-auto flex flex-col gap-2 text-sm  sm:text-base md:text-lg lg:text-xl">
        <div className="flex flex-row-reverse px-4">
          <Button
            onClick={() => {
              setInstructions(false);
              setLicense(false);
            }}
          >
            Close
          </Button>
        </div>
        {instructions && <Instructions className="w-3xl p-2" />}
        {license && <License className="w-3xl p-2" />}
      </div>
    );
  }

  const gameScreen = (
    <GameScreen
      className="rounded-lg border max-w-[100vw] max-h-[100vh]"
      style={
        isTouch
          ? undefined
          : {
              width: `min(${
                (60 * gameState.screen.width) / gameState.screen.height
              }vh,calc(98vw - 14em))`,
              height: `min(60,calc(${
                (98 * gameState.screen.height) / gameState.screen.width
              }vw - ${
                (14 * gameState.screen.height) / gameState.screen.width
              }em))`,
            }
      }
      screen={gameState.screen}
      gridColor={isDark ? "#282" : "#282"}
      backgroundColor={isDark ? "#121" : "#eee"}
      planeColor={isDark ? "#4F4" : "#040"}
      air={gameState.air}
      wantBenum={wantBenum ? commandProcessor.current.benumTarget : undefined}
      onBenum={(benum) => onCommandToken(benum.toString())}
    />
  );

  const gameControls = (
    <GameControls
      isDark={isDark}
      isTouch={isTouch}
      game={game}
      gameNames={gameNames}
      disabled={lost !== undefined}
      onCommand={(cmd) => {
        switch (cmd) {
          case "play":
            startPlaying();
            break;
          case "instructions":
            setInstructions(true);
            break;
          case "license":
            setLicense(true);
            break;
        }
      }}
      updateSettings={setSettings}
    />
  );
  return (
    <div className="w-fit mx-auto flex flex-col gap-2 text-sm  sm:text-base md:text-lg lg:text-xl">
      {playing || isTouch ? null : gameControls}
      <div className="grid">
        {isTouch && (
          <>
            <div className="col-start-1 row-start-1 grid items-center justify-items-center w-[100vw] h-[100vh]">
              {gameScreen}
            </div>
          </>
        )}
        <div
          className="font-mono col-start-1 row-start-1 m-4 grid gap-x-4 pointer-events-none"
          style={
            isTouch
              ? {
                  gridTemplateColumns: "1fr 18ch",
                  gridTemplateRows: "1fr auto",
                }
              : {
                  gridTemplateColumns: `min(${
                    (60 * gameState.screen.width) / gameState.screen.height
                  }vh,calc(98vw - 20ch)) 18ch`,
                }
          }
        >
          {isTouch ? (
            playing ? (
              <div className="pointer-events-none" />
            ) : (
              gameControls
            )
          ) : (
            gameScreen
          )}
          <Planes
            {...gameState}
            height={`min(60vh,calc(${
              (98 * gameState.screen.height) / gameState.screen.width
            }vw - ${
              (20 * gameState.screen.height) / gameState.screen.width
            }ch))`}
          />
          <div className="flex flex-row gap-2 pointer-events-none">
            <div className="pointer-events-none">Command:</div>
            <div className="pointer-events-none">{currentCommand}</div>
          </div>
          <div className="pointer-events-none">
            <div className="pointer-events-none">ATC - by Ed James</div>
            <div className="text-xs sm:text-xs md:text-sm lg:text-base pointer-events-none">
              Port - Paul C Roberts
            </div>
          </div>
          {playing && (
            <CommandOptions
              className="col-start-1 col-span-2"
              options={commandProcessor.current.options}
              air={gameState.air}
              ground={gameState.ground}
              onCommand={(token) => onCommandToken(token)}
              skipState={commandProcessor.current.skipState}
              getBenum={setWantBenum}
            />
          )}
        </div>
        {lost && (
          <div className="col-start-1 row-start-1 bg-slate-700/50 flex">
            <Lost
              {...lost}
              {...gameState}
              onClose={tryAgain}
              startTime={startTime}
            />
          </div>
        )}
      </div>
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
