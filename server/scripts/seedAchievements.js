
import "dotenv/config";

import mongoose from "mongoose";
import Achievement from "../models/Achievement.js";

const achievements = [
  {
    achievementId: "first-victory",
    name: "First Victory",
    description: "Win your first multiplayer match.",
    category: "games",
    rarity: "common",
    requirement: { type: "wins", target: 1 },
    reward: { points: 50 },
    active: true,
    sortOrder: 1,
  },
  {
    achievementId: "winner-10",
    name: "Rising Champion",
    description: "Win 10 multiplayer matches.",
    category: "games",
    rarity: "rare",
    requirement: { type: "wins", target: 10 },
    reward: { points: 200 },
    active: true,
    sortOrder: 2,
  },
  {
    achievementId: "winner-50",
    name: "Elite Champion",
    description: "Win 50 multiplayer matches.",
    category: "games",
    rarity: "epic",
    requirement: { type: "wins", target: 50 },
    reward: { points: 750 },
    active: true,
    sortOrder: 3,
  },
  {
    achievementId: "matches-10",
    name: "Getting Started",
    description: "Complete 10 matches.",
    category: "games",
    rarity: "common",
    requirement: { type: "matches", target: 10 },
    reward: { points: 100 },
    active: true,
    sortOrder: 4,
  },
  {
    achievementId: "matches-100",
    name: "Game Enthusiast",
    description: "Complete 100 matches.",
    category: "games",
    rarity: "epic",
    requirement: { type: "matches", target: 100 },
    reward: { points: 1000 },
    active: true,
    sortOrder: 5,
  },
  {
    achievementId: "first-friend",
    name: "New Connection",
    description: "Add your first friend.",
    category: "social",
    rarity: "common",
    requirement: { type: "friends", target: 1 },
    reward: { points: 50 },
    active: true,
    sortOrder: 6,
  },
  {
    achievementId: "friends-10",
    name: "Social Butterfly",
    description: "Make 10 friends.",
    category: "social",
    rarity: "rare",
    requirement: { type: "friends", target: 10 },
    reward: { points: 200 },
    active: true,
    sortOrder: 7,
  },
  {
    achievementId: "explorer",
    name: "Game Explorer",
    description: "Play five different games.",
    category: "games",
    rarity: "rare",
    requirement: { type: "unique-games", target: 5 },
    reward: { points: 250 },
    active: true,
    sortOrder: 8,
  },
  {
    achievementId: "perfect-streak",
    name: "Winning Streak",
    description: "Win five matches in a row.",
    category: "games",
    rarity: "epic",
    requirement: { type: "win-streak", target: 5 },
    reward: { points: 500 },
    active: true,
    sortOrder: 9,
  },
  {
    achievementId: "first-private-room",
    name: "Private Party",
    description: "Complete your first private room match.",
    category: "social",
    rarity: "common",
    requirement: { type: "private-matches", target: 1 },
    reward: { points: 75 },
    active: true,
    sortOrder: 10,
  },
];

const seedAchievements = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const achievement of achievements) {
      await Achievement.findOneAndUpdate(
        { achievementId: achievement.achievementId },
        { $set: achievement },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log(
      `Successfully seeded ${achievements.length} achievements.`
    );
  } catch (error) {
    console.error("Achievement seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAchievements();
