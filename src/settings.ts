export type Settings = {
  isDark: boolean;
  isTouch: boolean;
  game: string;
};

function isSettings(value: any): value is Settings {
  return (
    value &&
    typeof value.isDark === "boolean" &&
    typeof value.isTouch === "boolean" &&
    typeof value.game === "string"
  );
}

const DEFAULT_SETTINGS: Settings = {
  isDark: false,
  isTouch: false,
  game: "default",
};

const SETTINGS_KEY = "atc.settings.203f3bdf-2c33-4c97-8062-a5242f18105a";

export function loadSettings(): Settings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object") {
        const combined = { ...DEFAULT_SETTINGS, ...parsed };
        if (isSettings(combined)) {
          return combined;
        }
      }
    } catch {}
  }
  return { ...DEFAULT_SETTINGS };
}

export function storeSettings(settings: Settings) {
  const safeSettings: Settings = {
    isDark: settings.isDark ?? DEFAULT_SETTINGS.isDark,
    isTouch: settings.isTouch ?? DEFAULT_SETTINGS.isTouch,
    game: settings.game ?? "default",
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(safeSettings));
}
