import Score from "../models/Score.js";

export const createVerifiedScore = async ({
  user,
  game,
  match,
  score,
  bonusScore = 0,
  rank = null,
  result,
  duration = 0,
  metadata = {},
}) => {
  if (!Number.isFinite(score) || score < 0) {
    throw new Error("Invalid score value.");
  }

  return Score.create({
    user,
    game,
    match,
    score,
    bonusScore,
    rank,
    result,
    duration,
    metadata,
  });
};

export const getUserScores = async (userId, limit = 20) => {
  return Score.find({ user: userId })
    .populate("game match")
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 20, 1), 100));
};

export const getGameScores = async (gameId, limit = 20) => {
  return Score.find({ game: gameId })
    .populate("user", "username avatar")
    .sort({ score: -1, createdAt: 1 })
    .limit(Math.min(Math.max(Number(limit) || 20, 1), 100));
};