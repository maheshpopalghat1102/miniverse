
import Match from "../models/Match.js";
import Room from "../models/Room.js";
import Game from "../models/Game.js";

const getUserId = (req) => req.user?.id || req.user?._id;

// ==========================================
// CREATE AND START MATCH
// ==========================================

export const createMatch = async (req, res, next) => {
  try {
    const { gameId, roomId, gameMode = "public" } = req.body;
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const game = await Game.findOne({
      gameId,
      isActive: true
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found."
      });
    }

    let players = [
      {
        user: userId,
        result: "participated"
      }
    ];

    let room = null;

    // ======================================
    // ROOM MATCH VALIDATION
    // ======================================

    if (roomId) {
      room = await Room.findById(roomId);

      if (
        !room ||
        room.status !== "waiting" ||
        (room.expiresAt && room.expiresAt <= new Date())
      ) {
        return res.status(404).json({
          success: false,
          message: "Room is unavailable."
        });
      }

      const isMember = room.members.some(
        (member) =>
          member.user.toString() === userId.toString() &&
          member.status !== "left"
      );

      const isHost =
        room.host.toString() === userId.toString();

      if (!isMember || !isHost) {
        return res.status(403).json({
          success: false,
          message: "Only the room host can start this match."
        });
      }

      const readyMembers = room.members.filter(
        (member) =>
          member.isReady &&
          member.status !== "left"
      );

      if (readyMembers.length < game.minPlayers) {
        return res.status(400).json({
          success: false,
          message: "Not enough ready players."
        });
      }

      players = readyMembers.map((member) => ({
        user: member.user,
        result: "participated"
      }));
    }

    // ======================================
    // GAME MODE VALIDATION
    // ======================================

    if (
      !["public", "private", "local", "solo"].includes(gameMode)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid game mode."
      });
    }

    // ======================================
    // CREATE MATCH
    // ======================================

    const match = await Match.create({
      game: game._id,
      room: room?._id || null,
      players,
      gameMode,
      status: "active",
      startedAt: new Date()
    });

    // ======================================
    // UPDATE ROOM AND NOTIFY PLAYERS
    // ======================================

    if (room) {
      room.status = "playing";
      room.currentMatch = match._id;
      room.startedAt = new Date();

      await room.save();

      const io = req.app.get("io");

      if (io) {
        const gameStartedPayload = {
          matchId: match._id.toString(),
          gameId: game.gameId,
          gameName: game.name,
          roomCode: room.roomCode,
          gameMode,
          players: players.map((player) => ({
            userId: player.user.toString()
          }))
        };

        // Notify every socket in this room.
        io.to(`room:${room.roomCode}`).emit(
          "game:started",
          gameStartedPayload
        );

        // Refresh room status for lobby clients.
        io.to(`room:${room.roomCode}`).emit(
          "room:updated",
          {
            roomCode: room.roomCode,
            status: "playing",
            currentMatch: match._id.toString()
          }
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Match started.",
      match: {
        ...match.toObject(),
        game: {
          gameId: game.gameId,
          name: game.name
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET MATCH DETAILS
// ==========================================

export const getMatchById = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const match = await Match.findOne({
      _id: req.params.matchId,
      "players.user": userId
    })
      .populate("game", "gameId name category")
      .populate("players.user", "username avatar")
      .lean();

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found."
      });
    }

    return res.status(200).json({
      success: true,
      match
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// COMPLETE MATCH
// ==========================================

export const completeMatch = async (req, res, next) => {
  try {
    const { results, finalState = {} } = req.body;
    const userId = getUserId(req);

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Match results are required."
      });
    }

    const match = await Match.findById(req.params.matchId);

    if (!match || match.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Active match not found."
      });
    }

    const isParticipant = match.players.some(
      (player) =>
        player.user.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this match."
      });
    }

    // Validate that every player is included exactly once.
    // Note: Production game results should be validated
    // by a server-side game engine.

    const playerIds = match.players.map(
      (player) => player.user.toString()
    );

    const submittedIds = results.map(
      (item) => String(item.userId)
    );

    if (
      submittedIds.length !== playerIds.length ||
      new Set(submittedIds).size !== submittedIds.length ||
      playerIds.some((id) => !submittedIds.includes(id))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Results must include every match participant exactly once."
      });
    }

    for (const result of results) {
      if (
        !Number.isFinite(result.score) ||
        result.score < 0 ||
        !["win", "loss", "draw", "participated"].includes(
          result.result
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid player result."
        });
      }

      const player = match.players.find(
        (item) =>
          item.user.toString() === String(result.userId)
      );

      player.finalScore = result.score;
      player.result = result.result;
      player.position = Number.isInteger(result.position)
        ? result.position
        : null;
    }

    const winners = match.players.filter(
      (player) => player.result === "win"
    );

    match.winner =
      winners.length === 1 ? winners[0].user : null;

    match.isDraw = match.players.every(
      (player) => player.result === "draw"
    );

    match.status = "completed";
    match.endedAt = new Date();

    match.durationSeconds = match.startedAt
      ? Math.max(
          0,
          Math.floor(
            (match.endedAt - match.startedAt) / 1000
          )
        )
      : 0;

    match.finalState = finalState;

    await match.save();

    if (match.room) {
      const room = await Room.findByIdAndUpdate(
        match.room,
        {
          $set: {
            status: "completed",
            currentMatch: match._id
          }
        },
        { new: true }
      );

      if (room) {
        const io = req.app.get("io");

        io?.to(`room:${room.roomCode}`).emit(
          "match:completed",
          {
            matchId: match._id.toString(),
            roomCode: room.roomCode
          }
        );

        io?.to(`room:${room.roomCode}`).emit(
          "room:updated",
          {
            roomCode: room.roomCode,
            status: "completed",
            currentMatch: match._id.toString()
          }
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Match completed.",
      match
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CANCEL MATCH
// ==========================================

export const cancelMatch = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const match = await Match.findOne({
      _id: req.params.matchId,
      "players.user": userId,
      status: { $in: ["waiting", "active"] }
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found or cannot be cancelled."
      });
    }

    match.status = "cancelled";
    match.endedAt = new Date();

    await match.save();

    return res.status(200).json({
      success: true,
      message: "Match cancelled."
    });
  } catch (error) {
    next(error);
  }
};
