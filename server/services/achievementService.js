import Achievement from "../models/Achievement.js";
import UserAchievement from "../models/UserAchievement.js";

export const getActiveAchievements = async () => {
  return Achievement.find({ isActive: true }).sort({ sortOrder: 1 });
};

export const getUserAchievements = async (userId) => {
  return UserAchievement.find({ user: userId })
    .populate("achievement")
    .sort({ updatedAt: -1 });
};

export const updateAchievementProgress = async (
  userId,
  achievementId,
  amount = 1
) => {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Progress amount must be a positive number.");
  }

  const achievement = await Achievement.findById(achievementId);

  if (!achievement || !achievement.isActive) {
    throw new Error("Achievement not found or inactive.");
  }

  let userAchievement = await UserAchievement.findOne({
    user: userId,
    achievement: achievementId,
  });

  if (!userAchievement) {
    userAchievement = new UserAchievement({
      user: userId,
      achievement: achievementId,
      progress: 0,
      target: achievement.requirement?.target || 1,
      isUnlocked: false,
    });
  }

  if (userAchievement.isUnlocked) return userAchievement;

  userAchievement.progress = Math.min(
    userAchievement.progress + amount,
    userAchievement.target
  );

  if (userAchievement.progress >= userAchievement.target) {
    userAchievement.isUnlocked = true;
    userAchievement.unlockedAt = new Date();
  }

  await userAchievement.save();
  return userAchievement;
};