
import Score from "../models/Score.js";
import Match from "../models/Match.js";

const getUserId = (req) => req.user?.id || req.user?._id;

export const getMyScores = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const scores = await Score.find({
      user: getUserId(req)
    })
      .populate("game", "gameId name thumbnail")
      .populate("match", "status startedAt endedAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      page,
      limit,
      scores
    });
  } catch (error) {
    next(error);
  }
};

export const getGameScores = async (req, res, next) => {
  try {
    const scores = await Score.find({
      user: getUserId(req),
      game: req.params.gameId
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      scores
    });
  } catch (error) {
    next(error);
  }
};

// This endpoint should only be called by trusted server-side
// game-completion logic, not directly by an untrusted client.
export const createScore = async (req, res, next) => {
  try {
    const { matchId, userId, score, result, rank } = req.body;

    const match = await Match.findById(matchId);

    if (!match || match.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "A completed match is required."
      });
    }

    const player = match.players.find(
      (item) => item.user.toString() === String(userId)
    );

    if (!player) {
      return res.status(400).json({
        success: false,
        message: "Player did not participate in this match."
      });
    }

    if (
      player.finalScore !== score ||
      player.result !== result
    ) {
      return res.status(400).json({
        success: false,
        message: "Submitted score does not match the match result."
      });
    }

    const record = await Score.create({
      user: userId,
      game: match.game,
      match: match._id,
      score,
      result,
      rank: rank ?? player.position,
      durationSeconds: match.durationSeconds
    });

    return res.status(201).json({
      success: true,
      message: "Score recorded.",
      score: record
    });
  } catch (error) {
    next(error);
  }
};
