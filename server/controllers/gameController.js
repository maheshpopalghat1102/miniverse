
import Game from "../models/Game.js";

export const getAllGames = async (req, res, next) => {
  try {
    const { category, search, featured } = req.query;

    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    if (search) {
      const safeSearch = String(search).trim().slice(0, 80);

      filter.name = {
        $regex: safeSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i"
      };
    }

    const games = await Game.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: games.length,
      games
    });
  } catch (error) {
    next(error);
  }
};

export const getGameById = async (req, res, next) => {
  try {
    const game = await Game.findOne({
      $or: [
        { gameId: req.params.id },
        { slug: req.params.id }
      ],
      isActive: true
    }).lean();

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found."
      });
    }

    return res.status(200).json({
      success: true,
      game
    });
  } catch (error) {
    next(error);
  }
};

export const getGameCategories = async (req, res, next) => {
  try {
    const categories = await Game.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      categories: categories.map((item) => ({
        category: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedGames = async (req, res, next) => {
  try {
    const games = await Game.find({
      isActive: true,
      isFeatured: true
    })
      .sort({ sortOrder: 1 })
      .limit(12)
      .lean();

    return res.status(200).json({
      success: true,
      games
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN ONLY: create game
export const createGame = async (req, res, next) => {
  try {
    const game = await Game.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Game created successfully.",
      game
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN ONLY: update game
export const updateGame = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "category",
      "minPlayers",
      "maxPlayers",
      "modes",
      "thumbnail",
      "banner",
      "difficulty",
      "isActive",
      "isFeatured",
      "sortOrder",
      "settings"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const game = await Game.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Game updated successfully.",
      game
    });
  } catch (error) {
    next(error);
  }
};
