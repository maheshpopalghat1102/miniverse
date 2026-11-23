
import mongoose from "mongoose";

import Room from "../models/Room.js";

import {
  selectAndRecordPromptForUsers,
} from "../services/questionHistoryService.js";

export const TRUTH_DARE_EVENTS = {
  START: "truth-or-dare:start",
  CHOOSE: "truth-or-dare:choose",
  PROMPT: "truth-or-dare:prompt",
  COMPLETE: "truth-or-dare:complete",
  SKIP: "truth-or-dare:skip",
  STATE: "truth-or-dare:state",
  ERROR: "truth-or-dare:error",
  PLAYER_TURN: "truth-or-dare:player-turn",
};

const VALID_CATEGORIES = [
  "normal",
  "adult-18-plus",
  "private",
  "couples",
  "friends-party",
  "funny-crazy",
  "long-distance",
  "long-distance-couples",
];

const VALID_TYPES = ["truth", "dare"];
const GAME_ID = "truth-or-dare";

// Serializes actions for a room within this Node.js process.
const roomLocks = new Map();

const withRoomLock = async (roomCode, callback) => {
  const previous = roomLocks.get(roomCode) || Promise.resolve();

  let release;

  const current = new Promise((resolve) => {
    release = resolve;
  });

  roomLocks.set(roomCode, current);

  await previous;

  try {
    return await callback();
  } finally {
    release();

    if (roomLocks.get(roomCode) === current) {
      roomLocks.delete(roomCode);
    }
  }
};

const acknowledge = (callback, result) => {
  if (typeof callback === "function") {
    callback(result);
  }
};

const emitError = (socket, callback, error) => {
  const message =
    error?.message || "Truth or Dare action failed.";

  socket.emit(TRUTH_DARE_EVENTS.ERROR, {
    success: false,
    message,
  });

  acknowledge(callback, {
    success: false,
    message,
  });
};

const getRoomCode = (socket) =>
  String(socket.data.roomCode || "")
    .trim()
    .toUpperCase();

const getAuthorizedRoom = async (socket, roomId) => {
  const roomCode = getRoomCode(socket);

  if (!roomCode) {
    throw new Error(
      "Join a room before playing Truth or Dare."
    );
  }

  const room = await Room.findOne({
    roomCode,
  }).populate("members.user", "username avatar");

  if (!room) {
    throw new Error("Room not found.");
  }

  if (
    roomId &&
    mongoose.Types.ObjectId.isValid(roomId) &&
    String(room._id) !== String(roomId)
  ) {
    throw new Error(
      "The requested room does not match your joined room."
    );
  }

  if (room.status !== "playing") {
    throw new Error(
      "The room game is not currently active."
    );
  }

  const activeStatuses = [
    "joined",
    "ready",
    "playing",
  ];

  const member = room.members.find(
    (entry) =>
      entry.user &&
      String(entry.user._id) ===
        String(socket.user.id) &&
      activeStatuses.includes(entry.status) &&
      entry.role !== "spectator"
  );

  if (!member) {
    throw new Error(
      "You are not an active player in this room."
    );
  }

  const players = room.members
    .filter(
      (entry) =>
        entry.user &&
        activeStatuses.includes(entry.status) &&
        entry.role !== "spectator"
    )
    .map((entry) => ({
      id: String(entry.user._id),
      name: entry.user.username || "Player",
      avatar: entry.user.avatar || null,
    }));

  if (players.length < 2) {
    throw new Error(
      "At least two active players are required."
    );
  }

  return {
    room,
    roomCode,
    players,
  };
};

const getSavedGameState = (room) =>
  room.settings?.truthDare || null;

const saveGameState = async (room, state) => {
  room.settings = {
    ...(room.settings || {}),
    truthDare: state,
  };

  room.markModified("settings");

  await room.save();

  return state;
};

const emitGameState = (io, roomCode, state) => {
  io.to(`room:${roomCode}`).emit(
    TRUTH_DARE_EVENTS.STATE,
    state
  );
};

const emitCurrentTurn = (io, roomCode, state) => {
  io.to(`room:${roomCode}`).emit(
    TRUTH_DARE_EVENTS.PLAYER_TURN,
    {
      currentPlayerId: state.currentPlayerId,
      currentPlayerIndex: state.currentPlayerIndex,
      round: state.round,
      completedTurns: state.completedTurns,
    }
  );
};

const ensureCurrentPlayer = (state, socket) => {
  if (!state || state.status !== "playing") {
    throw new Error(
      "Truth or Dare has not started."
    );
  }

  if (
    String(state.currentPlayerId) !==
    String(socket.user.id)
  ) {
    throw new Error("Wait for your turn.");
  }
};

const advanceToNextPlayer = (state) => {
  if (
    !Array.isArray(state.players) ||
    state.players.length === 0
  ) {
    throw new Error(
      "There are no players in this game."
    );
  }

  const nextIndex =
    (state.currentPlayerIndex + 1) %
    state.players.length;

  return {
    ...state,
    currentPlayerIndex: nextIndex,
    currentPlayerId: state.players[nextIndex].id,
    currentPrompt: null,
    completedTurns:
      (state.completedTurns || 0) + 1,
    round:
      nextIndex === 0
        ? (state.round || 1) + 1
        : (state.round || 1),
    status: "playing",
  };
};

const registerStartHandler = (io, socket) => {
  socket.on(
    TRUTH_DARE_EVENTS.START,
    async ({ roomId, category } = {}, callback) => {
      const roomCode = getRoomCode(socket);

      try {
        if (!roomCode) {
          throw new Error(
            "Join a room before starting the game."
          );
        }

        await withRoomLock(roomCode, async () => {
          const { room, players } =
            await getAuthorizedRoom(socket, roomId);

          if (!VALID_CATEGORIES.includes(category)) {
            throw new Error(
              "Select a valid Truth or Dare category."
            );
          }

          if (category === "adult-18-plus") {
            throw new Error(
              "This category requires an approved age-verification system."
            );
          }

          const previousState =
            getSavedGameState(room);

          if (previousState?.status === "playing") {
            throw new Error(
              "Truth or Dare has already started in this room."
            );
          }

          const state = {
            gameId: GAME_ID,
            category,
            players,
            currentPlayerIndex: 0,
            currentPlayerId: players[0].id,
            currentPrompt: null,
            status: "playing",
            round: 1,
            completedTurns: 0,
            startedAt: new Date().toISOString(),
          };

          await saveGameState(room, state);

          emitGameState(io, roomCode, state);

          acknowledge(callback, {
            success: true,
            data: state,
          });
        });
      } catch (error) {
        emitError(socket, callback, error);
      }
    }
  );
};

const registerChooseHandler = (io, socket) => {
  socket.on(
    TRUTH_DARE_EVENTS.CHOOSE,
    async (
      {
        roomId,
        type,
        language = "en",
      } = {},
      callback
    ) => {
      const roomCode = getRoomCode(socket);

      try {
        if (!roomCode) {
          throw new Error(
            "Join a room before choosing Truth or Dare."
          );
        }

        await withRoomLock(roomCode, async () => {
          const { room } =
            await getAuthorizedRoom(socket, roomId);

          const state = getSavedGameState(room);

          ensureCurrentPlayer(state, socket);

          if (state.currentPrompt) {
            throw new Error(
              "Complete or skip the current prompt first."
            );
          }

          if (!VALID_TYPES.includes(type)) {
            throw new Error(
              "Choose either truth or dare."
            );
          }

          const result =
            await selectAndRecordPromptForUsers({
              userIds: state.players.map(
                (player) => player.id
              ),
              category: state.category,
              type,
              language,
              gameId: GAME_ID,
              roomId: room._id,
              matchId: room.currentMatch || null,
              playerCount: state.players.length,
            });

          if (!result.prompt) {
            if (result.exhausted) {
              throw new Error(
                "No unused prompts remain for this category and type. All players need a new prompt to continue."
              );
            }

            throw new Error(
              "Could not safely reserve a new prompt. Please try again."
            );
          }

          const updatedState = {
            ...state,
            currentPrompt: result.prompt,
          };

          await saveGameState(room, updatedState);

          io.to(`room:${roomCode}`).emit(
            TRUTH_DARE_EVENTS.PROMPT,
            result.prompt
          );

          emitGameState(
            io,
            roomCode,
            updatedState
          );

          acknowledge(callback, {
            success: true,
            data: {
              prompt: result.prompt,
              state: updatedState,
            },
          });
        });
      } catch (error) {
        emitError(socket, callback, error);
      }
    }
  );
};

const registerCompleteHandler = (io, socket) => {
  socket.on(
    TRUTH_DARE_EVENTS.COMPLETE,
    async ({ roomId } = {}, callback) => {
      const roomCode = getRoomCode(socket);

      try {
        if (!roomCode) {
          throw new Error(
            "Join a room before completing a turn."
          );
        }

        await withRoomLock(roomCode, async () => {
          const { room } =
            await getAuthorizedRoom(socket, roomId);

          const state = getSavedGameState(room);

          ensureCurrentPlayer(state, socket);

          if (!state.currentPrompt) {
            throw new Error(
              "There is no active prompt to complete."
            );
          }

          const updatedState =
            advanceToNextPlayer(state);

          await saveGameState(room, updatedState);

          emitCurrentTurn(
            io,
            roomCode,
            updatedState
          );

          emitGameState(
            io,
            roomCode,
            updatedState
          );

          acknowledge(callback, {
            success: true,
            data: updatedState,
          });
        });
      } catch (error) {
        emitError(socket, callback, error);
      }
    }
  );
};

const registerSkipHandler = (io, socket) => {
  socket.on(
    TRUTH_DARE_EVENTS.SKIP,
    async ({ roomId } = {}, callback) => {
      const roomCode = getRoomCode(socket);

      try {
        if (!roomCode) {
          throw new Error(
            "Join a room before skipping a prompt."
          );
        }

        await withRoomLock(roomCode, async () => {
          const { room } =
            await getAuthorizedRoom(socket, roomId);

          const state = getSavedGameState(room);

          ensureCurrentPlayer(state, socket);

          if (!state.currentPrompt) {
            throw new Error(
              "There is no active prompt to skip."
            );
          }

          // The prompt was already recorded when it was
          // delivered. Skipping does not remove its history.
          const updatedState =
            advanceToNextPlayer(state);

          await saveGameState(room, updatedState);

          emitCurrentTurn(
            io,
            roomCode,
            updatedState
          );

          emitGameState(
            io,
            roomCode,
            updatedState
          );

          acknowledge(callback, {
            success: true,
            data: updatedState,
          });
        });
      } catch (error) {
        emitError(socket, callback, error);
      }
    }
  );
};

export const registerTruthDareHandlers = (
  io,
  socket
) => {
  registerStartHandler(io, socket);
  registerChooseHandler(io, socket);
  registerCompleteHandler(io, socket);
  registerSkipHandler(io, socket);
};
