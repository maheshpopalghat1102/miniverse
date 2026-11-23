
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

class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.volume = 0.5;
  }

  register(name, source) {
    if (!name || !source) {
      throw new Error("Sound name and source are required.");
    }

    this.sounds.set(name, source);
  }

  registerMany(soundMap = {}) {
    Object.entries(soundMap).forEach(([name, source]) => {
      this.register(name, source);
    });
  }

  getAudio(name) {
    const source = this.sounds.get(name);

    if (!source) {
      console.warn(`Sound "${name}" is not registered.`);
      return null;
    }

    const cacheKey = `${name}:${source}`;

    if (!this.audioCache) {
      this.audioCache = new Map();
    }

    if (!this.audioCache.has(cacheKey)) {
      this.audioCache.set(cacheKey, new Audio(source));
    }

    return this.audioCache.get(cacheKey);
  }

  async play(name, options = {}) {
    if (!this.enabled) return false;

    const audio = this.getAudio(name);

    if (!audio) return false;

    try {
      audio.pause();
      audio.currentTime = 0;

      const volume = options.volume ?? this.volume;

      audio.volume = Math.max(0, Math.min(1, volume));

      if (options.loop !== undefined) {
        audio.loop = Boolean(options.loop);
      }

      await audio.play();

      return true;
    } catch (error) {
      console.warn("Sound playback failed:", error);
      return false;
    }
  }

  pause(name) {
    const audio = this.getAudio(name);

    if (!audio) return;

    audio.pause();
  }

  stop(name) {
    const audio = this.getAudio(name);

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }

  stopAll() {
    if (!this.audioCache) return;

    this.audioCache.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);

    if (!this.enabled) {
      this.stopAll();
    }
  }

  toggle() {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  setVolume(volume) {
    const numericVolume = Number(volume);

    if (!Number.isFinite(numericVolume)) return;

    this.volume = Math.max(0, Math.min(1, numericVolume));
  }

  getSettings() {
    return {
      enabled: this.enabled,
      volume: this.volume,
    };
  }

  destroy() {
    this.stopAll();

    if (this.audioCache) {
      this.audioCache.clear();
    }

    this.sounds.clear();
  }
}

const soundManager = new SoundManager();

soundManager.registerMany(DEFAULT_SOUNDS);

export { SoundManager, DEFAULT_SOUNDS };

export default soundManager;
