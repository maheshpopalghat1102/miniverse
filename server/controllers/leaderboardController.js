
import Score from "../models/Score.js";
import Profile from "../models/Profile.js";
import Game from "../models/Game.js";

export const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const leaderboard = await Profile.aggregate([
      {
        $match: {
          "privacy.profileVisibility": "public"
        }
      },
      {
        $sort: {
          "statistics.totalScore": -1,
          "statistics.gamesWon": -1
        }
      },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.status": "active"
        }
      },
      {
        $project: {
          username: "$user.username",
          avatar: "$user.avatar",
          totalScore: "$statistics.totalScore",
          gamesPlayed: "$statistics.gamesPlayed",
          gamesWon: "$statistics.gamesWon"
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};

export const getGameLeaderboard = async (req, res, next) => {
  try {
    const game = await Game.findOne({
      gameId: req.params.gameId,
      isActive: true
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found."
      });
    }

    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const leaderboard = await Score.aggregate([
      {
        $match: {
          game: game._id,
          result: { $in: ["win", "loss", "draw", "participated"] }
        }
      },
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$score" },
          gamesPlayed: { $sum: 1 },
          gamesWon: {
            $sum: {
              $cond: [{ $eq: ["$result", "win"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { totalScore: -1, gamesWon: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      { $match: { "user.status": "active" } },
      {
        $project: {
          username: "$user.username",
          avatar: "$user.avatar",
          totalScore: 1,
          gamesPlayed: 1,
          gamesWon: 1
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      game: {
        gameId: game.gameId,
        name: game.name
      },
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};
