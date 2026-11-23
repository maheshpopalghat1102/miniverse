
import React, { useEffect, useMemo, useState } from "react";

import StoryPrompt from "./StoryPrompt";
import StoryEditor from "./StoryEditor";
import StoryTimeline from "./StoryTimeline";

import {
  STORY_BUILDER_CONFIG,
  STORY_BUILDER_STATUS,
  SAMPLE_STORY_PROMPTS,
  createInitialStoryState,
  startStory,
  addStoryEntry,
  getCurrentStoryPlayer,
  getStoryText,
  getStoryWordCount,
  getStoryProgress,
  resetStory,
} from "./storyBuilderLogic";

import {
  STORY_BUILDER_EVENTS,
  startStoryBuilderSocket,
  submitStoryEntrySocket,
  requestStoryBuilderRematch,
  subscribeStoryBuilder,
} from "./storyBuilderSocket";

import "./storyBuilder.css";

function StoryBuilder({
  socket = null,
  roomId = null,
  players: suppliedPlayers = [],
  prompts = SAMPLE_STORY_PROMPTS,
  maxTurns = STORY_BUILDER_CONFIG.DEFAULT_TURNS,
  mode = "local",
  onExit,
}) {
  const isOnline = mode === "online" && Boolean(socket && roomId);

  const initialPlayers = useMemo(
    () =>
      suppliedPlayers.length
        ? suppliedPlayers
        : [
            { id: "player-1", name: "Player 1", isMe: true },
            { id: "player-2", name: "Player 2" },
          ],
    [suppliedPlayers]
  );

  const initialPrompt = prompts[0] || SAMPLE_STORY_PROMPTS[0];

  const [game, setGame] = useState(() =>
    createInitialStoryState({
      players: initialPlayers,
      prompt: initialPrompt,
      maxTurns,
    })
  );

  const [error, setError] = useState("");
  const [rematchRequested, setRematchRequested] = useState(false);

  const currentPlayer = getCurrentStoryPlayer(game);
  const isWaiting = game.status === STORY_BUILDER_STATUS.WAITING;
  const isFinished = game.status === STORY_BUILDER_STATUS.FINISHED;

  const myPlayer = game.players.find((player) => player.isMe);
  const isMyTurn = Boolean(
    myPlayer && currentPlayer?.id === myPlayer.id
  );

  const progress = getStoryProgress(game);
  const storyText = getStoryText(game);
  const wordCount = getStoryWordCount(game);

  const startLocalGame = () => {
    const fresh = createInitialStoryState({
      players: initialPlayers,
      prompt: initialPrompt,
      maxTurns,
    });

    setGame(startStory(fresh));
    setError("");
    setRematchRequested(false);
  };

  const handleOnlineState = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      players: payload.players || previous.players,
      entries: payload.entries || previous.entries,
      prompt: payload.prompt || previous.prompt,
    }));

    setError("");
  };

  const handleOnlinePrompt = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      prompt: payload.prompt || previous.prompt,
      status: STORY_BUILDER_STATUS.PLAYING,
    }));
  };

  const handleOnlineEntryAdded = (payload) => {
    if (!payload) return;

    setGame((previous) => {
      const entry = payload.entry || payload;

      const alreadyExists = previous.entries.some(
        (item) => item.entryId === entry.entryId
      );

      return {
        ...previous,
        entries: alreadyExists
          ? previous.entries
          : [...previous.entries, entry],
        lastEntry: entry,
        turnNumber:
          payload.turnNumber ?? previous.turnNumber + 1,
        currentTurnIndex:
          payload.currentTurnIndex ?? previous.currentTurnIndex,
        status: payload.status || previous.status,
      };
    });
  };

  const handleOnlineGameOver = (payload) => {
    if (!payload) return;

    setGame((previous) => ({
      ...previous,
      ...payload,
      entries: payload.entries || previous.entries,
      status: STORY_BUILDER_STATUS.FINISHED,
    }));
  };

  useEffect(() => {
    if (!isOnline) return undefined;

    const unsubscribe = subscribeStoryBuilder(socket, {
      onState: handleOnlineState,
      onPrompt: handleOnlinePrompt,
      onEntryAdded: handleOnlineEntryAdded,
      onTurnChanged: (payload) => {
        if (payload?.currentTurnIndex !== undefined) {
          setGame((previous) => ({
            ...previous,
            currentTurnIndex: payload.currentTurnIndex,
          }));
        }
      },
      onGameOver: handleOnlineGameOver,
      onRematchRequested: () => setRematchRequested(true),
      onRematchStarted: (payload) => {
        setRematchRequested(false);
        handleOnlineState(payload?.state || payload);
      },
      onError: (payload) =>
        setError(payload?.message || "Something went wrong."),
    });

    startStoryBuilderSocket(socket, roomId);

    return unsubscribe;
  }, [socket, roomId, isOnline]);

  const handleStart = () => {
    if (isOnline) {
      socket.emit(STORY_BUILDER_EVENTS.START, { roomId });
      return;
    }

    setGame((previous) => startStory(previous));
    setError("");
  };

  const handleAddEntry = (sentence) => {
    setError("");

    if (isOnline) {
      submitStoryEntrySocket(socket, {
        roomId,
        sentence,
      });
      return;
    }

    if (!currentPlayer) return;

    const result = addStoryEntry(
      game,
      currentPlayer.id,
      sentence
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setGame(result.state);
  };

  const handleRematch = () => {
    if (isOnline) {
      requestStoryBuilderRematch(socket, roomId);
      setRematchRequested(true);
      return;
    }

    setGame(
      resetStory({
        players: initialPlayers,
        prompt: initialPrompt,
        maxTurns,
      })
    );

    setError("");
    setRematchRequested(false);
  };

  const handleCopyStory = async () => {
    try {
      await navigator.clipboard.writeText(storyText);
      setError("");
    } catch {
      setError("Could not copy the story. Check clipboard permissions.");
    }
  };

  if (isWaiting) {
    return (
      <main className="sb-container">
        <section className="sb-welcome-card">
          <div className="sb-game-icon">📚</div>

          <span className="sb-eyebrow">
            MINIVERSE TURN-BY-TURN
          </span>

          <h1>Story Builder</h1>

          <p>
            Create a unique story together. Each player adds one
            sentence on their turn.
          </p>

          <div className="sb-player-preview">
            {game.players.map((player) => (
              <span className="sb-player-chip" key={player.id}>
                👤 {player.name}
              </span>
            ))}
          </div>

          <StoryPrompt prompt={game.prompt} />

          {error && <p className="sb-error">{error}</p>}

          <button
            type="button"
            className="sb-primary-button"
            onClick={handleStart}
          >
            Start Writing
          </button>

          {onExit && (
            <button
              type="button"
              className="sb-text-button"
              onClick={onExit}
            >
              Exit game
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="sb-container">
      <header className="sb-header">
        <div>
          <span className="sb-eyebrow">MINIVERSE GAME</span>
          <h1>📚 Story Builder</h1>
        </div>

        <div className="sb-header-actions">
          <button
            type="button"
            className="sb-copy-button"
            onClick={handleCopyStory}
            disabled={!storyText}
          >
            Copy Story
          </button>

          {onExit && (
            <button
              type="button"
              className="sb-exit-button"
              onClick={onExit}
            >
              Exit
            </button>
          )}
        </div>
      </header>

      <div className="sb-layout">
        <section className="sb-main">
          <StoryPrompt prompt={game.prompt} />

          <div className="sb-progress-card">
            <div className="sb-progress-info">
              <span>Story progress</span>
              <strong>
                {game.turnNumber}/{game.maxTurns} turns
              </strong>
            </div>

            <div className="sb-progress-track">
              <div
                className="sb-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <StoryTimeline entries={game.entries} />

          {isFinished ? (
            <section className="sb-finished-panel">
              <div className="sb-finished-icon">🎉</div>
              <h2>Your Story Is Complete!</h2>

              <p>
                You created a story with {wordCount} words and{" "}
                {game.turnNumber} player contributions.
              </p>

              <button
                type="button"
                className="sb-primary-button"
                onClick={handleRematch}
              >
                Create Another Story
              </button>

              {rematchRequested && (
                <p className="sb-muted">
                  Waiting for the other players...
                </p>
              )}
            </section>
          ) : (
            <>
              <div className="sb-turn-card">
                <div className="sb-turn-avatar">✍️</div>
                <div>
                  <span>Current writer</span>
                  <strong>
                    {currentPlayer?.name || "Waiting for player"}
                  </strong>
                </div>

                {isMyTurn && (
                  <span className="sb-your-turn">Your turn</span>
                )}
              </div>

              <StoryEditor
                onSubmit={handleAddEntry}
                disabled={isOnline ? !isMyTurn : false}
                maxLength={STORY_BUILDER_CONFIG.MAX_SENTENCE_LENGTH}
              />

              {isOnline && !isMyTurn && (
                <p className="sb-muted">
                  Wait for your turn to add the next sentence.
                </p>
              )}

              {error && <p className="sb-error">{error}</p>}
            </>
          )}
        </section>

        <aside className="sb-sidebar">
          <div className="sb-players-card">
            <h3>Story Writers</h3>

            {game.players.map((player, index) => {
              const isCurrent =
                index === game.currentTurnIndex && !isFinished;

              return (
                <div className="sb-player-row" key={player.id}>
                  <div className="sb-player-avatar">👤</div>

                  <div className="sb-player-info">
                    <strong>{player.name}</strong>
                    <span>
                      {isCurrent ? "Writing now" : "Contributor"}
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="sb-active-dot" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="sb-story-stats">
            <h3>Story Statistics</h3>

            <div>
              <span>Contributions</span>
              <strong>{game.turnNumber}</strong>
            </div>

            <div>
              <span>Words</span>
              <strong>{wordCount}</strong>
            </div>

            <div>
              <span>Progress</span>
              <strong>{progress}%</strong>
            </div>
          </div>

          <div className="sb-rules-card">
            <h3>How to Play</h3>
            <ul>
              <li>Read the story prompt.</li>
              <li>Players take turns adding one sentence.</li>
              <li>Continue the existing story.</li>
              <li>Keep each sentence under 220 characters.</li>
              <li>Complete all turns to finish the story.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default StoryBuilder;
