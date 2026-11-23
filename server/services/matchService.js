import Match from "../models/Match.js";

export const createMatchRecord = async ({
  game,
  room,
  matchCode,
  players,
  gameMode = "multiplayer",
  metadata = {},
}) => {
  return Match.create({
    game,
    room,
    matchCode,
    players,
    gameMode,
    status: "active",
    startedAt: new Date(),
    metadata,
  });
};

export const findMatchById = async (matchId) => {
  return Match.findById(matchId).populate("game room players.user winner");
};

export const completeMatchFromServer = async (matchId, verifiedResult) => {
  if (!verifiedResult || !Array.isArray(verifiedResult.players)) {
    throw new Error("A verified server result is required.");
  }

  const match = await Match.findOneAndUpdate(
    { _id: matchId, status: "active" },
    {
      $set: {
        status: "completed",
        winner: verifiedResult.winner || null,
        isDraw: Boolean(verifiedResult.isDraw),
        finalState: verifiedResult.finalState || {},
        completedAt: new Date(),
      },
    },
    { new: true, runValidators: true }
  );

  if (!match) {
    throw new Error("Match not found or already completed.");
  }

  return match;
};

export const cancelMatchRecord = async (matchId, reason = "cancelled") => {
  const match = await Match.findOneAndUpdate(
    { _id: matchId, status: "active" },
    {
      $set: {
        status: "cancelled",
        "metadata.cancelReason": reason,
        completedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!match) throw new Error("Active match not found.");
  return match;
};