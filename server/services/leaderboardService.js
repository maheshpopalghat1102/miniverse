import Score from "../models/Score.js";

const normalizeLimit = (limit) =>
  Math.min(Math.max(Number(limit) || 20, 1), 100);

const leaderboardPipeline = (matchFilter, limit) => [
  { $match: matchFilter },
  {
    $group: {
      _id: "$user",
      totalScore: { $sum: { $add: ["$score", "$bonusScore"] } },
      gamesPlayed: { $sum: 1 },
      wins: {
        $sum: { $cond: [{ $eq: ["$result", "win"] }, 1, 0] },
      },
    },
  },
  { $sort: { totalScore: -1, wins: -1, gamesPlayed: 1 } },
  { $limit: normalizeLimit(limit) },
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "user",
    },
  },
  { $unwind: "$user" },
  {
    $project: {
      totalScore: 1,
      gamesPlayed: 1,
      wins: 1,
      username: "$user.username",
      avatar: "$user.avatar",
    },
  },
];

export const getGlobalLeaderboard = async (limit = 20) => {
  return Score.aggregate(leaderboardPipeline({}, limit));
};

export const getGameLeaderboard = async (gameId, limit = 20) => {
  return Score.aggregate(
    leaderboardPipeline({ game: gameId }, limit)
  );
};