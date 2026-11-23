
import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";

const getUserId = (req) => req.user?.id || req.user?._id;

export const getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({
      isActive: true
    })
      .sort({ sortOrder: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      achievements
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAchievements = async (req, res, next) => {
  try {
    const achievements = await UserAchievement.find({
      user: getUserId(req)
    })
      .populate("achievement")
      .sort({ unlockedAt: -1, updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      achievements
    });
  } catch (error) {
    next(error);
  }
};

export const getUnlockedAchievements = async (req, res, next) => {
  try {
    const achievements = await UserAchievement.find({
      user: getUserId(req),
      isUnlocked: true
    })
      .populate("achievement")
      .sort({ unlockedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      achievements
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN ONLY: create achievement definition.
export const createAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.create(req.body);

    return res.status(201).json({
      success: true,
      achievement
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN ONLY: update achievement definition.
export const updateAchievement = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "category",
      "icon",
      "rarity",
      "requirement",
      "reward",
      "isActive",
      "sortOrder"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: "Achievement not found."
      });
    }

    return res.status(200).json({
      success: true,
      achievement
    });
  } catch (error) {
    next(error);
  }
};
