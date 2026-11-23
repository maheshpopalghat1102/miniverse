
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const SoundContext = createContext(null);

const DEFAULT_SOUNDS = {
  click: "/sounds/click.mp3",
  win: "/sounds/win.mp3",
  lose: "/sounds/lose.mp3",
  notification: "/sounds/notification.mp3",
  gameStart: "/sounds/game-start.mp3",
  gameOver: "/sounds/game-over.mp3",
  correct: "/sounds/correct.mp3",
  wrong: "/sounds/wrong.mp3",
};

function readSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("miniverse-sound-settings") || "{}"
    );

    return {
      enabled: saved.enabled ?? true,
      volume: Math.max(0, Math.min(1, saved.volume ?? 0.5)),
    };
  } catch {
    return { enabled: true, volume: 0.5 };
  }
}

export function SoundProvider({ children }) {
  const initialSettings = useRef(readSettings());

  const [enabled, setEnabled] = useState(
    initialSettings.current.enabled
  );
  const [volume, setVolume] = useState(
    initialSettings.current.volume
  );

  const audioCache = useRef({});

  useEffect(() => {
    try {
      localStorage.setItem(
        "miniverse-sound-settings",
        JSON.stringify({ enabled, volume })
      );
    } catch {
      // Sound still works without saved preferences.
    }
  }, [enabled, volume]);

  useEffect(() => {
    const cache = audioCache.current;

    return () => {
      Object.values(cache).forEach((audio) => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      });

      audioCache.current = {};
    };
  }, []);

  const playSound = useCallback(async (name, options = {}) => {
    if (!enabled) return false;

    const source = DEFAULT_SOUNDS[name];

    if (!source) {
      console.warn(`Unknown sound: ${name}`);
      return false;
    }

    try {
      let audio = audioCache.current[name];

      if (!audio) {
        audio = new Audio(source);
        audioCache.current[name] = audio;
      }

      audio.pause();
      audio.currentTime = 0;
      audio.volume = Math.max(
        0,
        Math.min(1, options.volume ?? volume)
      );

      await audio.play();
      return true;
    } catch (error) {
      console.warn("Sound playback failed:", error);
      return false;
    }
  }, [enabled, volume]);

  const stopSound = useCallback((name) => {
    const audio = audioCache.current[name];

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAllSounds = useCallback(() => {
    Object.values(audioCache.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setEnabled((current) => !current);
  }, []);

  const updateVolume = useCallback((nextVolume) => {
    const numericValue = Number(nextVolume);

    if (!Number.isFinite(numericValue)) return;

    setVolume(Math.max(0, Math.min(1, numericValue)));
  }, []);

  const value = useMemo(() => ({
    enabled,
    volume,
    playSound,
    stopSound,
    stopAllSounds,
    toggleSound,
    setEnabled,
    updateVolume,
  }), [
    enabled,
    volume,
    playSound,
    stopSound,
    stopAllSounds,
    toggleSound,
    updateVolume,
  ]);

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const context = useContext(SoundContext);

  if (!context) {
    throw new Error(
      "useSoundContext must be used inside SoundProvider."
    );
  }

  return context;
}

export default SoundContext;
