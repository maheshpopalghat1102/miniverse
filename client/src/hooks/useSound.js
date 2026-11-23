
import { useCallback, useEffect, useRef, useState } from "react";

export default function useSound(soundMap = {}, options = {}) {
  const { volume = 0.5, enabled = true } = options;

  const [soundEnabled, setSoundEnabled] = useState(enabled);
  const audioCache = useRef({});

  useEffect(() => {
    const cache = audioCache.current;

    return () => {
      Object.values(cache).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });

      audioCache.current = {};
    };
  }, []);

  const play = useCallback(
    async (soundName, customVolume = volume) => {
      if (!soundEnabled) return false;

      const source = soundMap[soundName];

      if (!source) {
        console.warn(`Sound "${soundName}" was not found.`);
        return false;
      }

      try {
        let audio = audioCache.current[soundName];

        if (!audio || audio.src !== new URL(source, window.location.href).href) {
          audio = new Audio(source);
          audioCache.current[soundName] = audio;
        }

        audio.pause();
        audio.currentTime = 0;
        audio.volume = Math.max(0, Math.min(1, customVolume));

        await audio.play();
        return true;
      } catch (error) {
        console.warn("Unable to play sound:", error);
        return false;
      }
    },
    [soundMap, soundEnabled, volume]
  );

  const stop = useCallback((soundName) => {
    const audio = audioCache.current[soundName];

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const stopAll = useCallback(() => {
    Object.values(audioCache.current).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => !current);
  }, []);

  return {
    play,
    stop,
    stopAll,
    soundEnabled,
    setSoundEnabled,
    toggleSound,
  };
}
