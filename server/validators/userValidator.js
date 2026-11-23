
import { body, param, query } from "express-validator";

export const updateProfileValidator = [
  body("displayName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 40 })
    .withMessage("Display name must be between 2 and 40 characters."),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Bio cannot exceed 250 characters."),

  body("country")
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage("Country name is too long."),

  body("avatar")
    .optional()
    .isURL({ protocols: ["https"], require_protocol: true })
    .withMessage("Avatar must be a valid HTTPS URL."),

  body("cover")
    .optional()
    .isURL({ protocols: ["https"], require_protocol: true })
    .withMessage("Cover image must be a valid HTTPS URL."),

  body("interests")
    .optional()
    .isArray({ max: 20 })
    .withMessage("You can add up to 20 interests."),

  body("interests.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each interest must be between 1 and 30 characters."),

  body("favoriteGames")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Invalid favorite games list."),

  body("theme")
    .optional()
    .isIn([
      "midnight",
      "amoled",
      "ocean",
      "sunset",
      "sakura",
      "emerald",
      "light",
      "cyberpunk",
    ])
    .withMessage("Invalid theme selected."),

  body("language")
    .optional()
    .isIn(["en", "hi", "mr"])
    .withMessage("Unsupported language."),
];

export const userIdValidator = [
  param("userId")
    .isMongoId()
    .withMessage("Invalid user ID."),
];

export const searchUsersValidator = [
  query("q")
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Search must be between 2 and 30 characters."),

  query("page")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("Invalid page number.")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50.")
    .toInt(),
];

export const updateAccountSettingsValidator = [
  body("privacy")
    .optional()
    .isObject()
    .withMessage("Privacy settings must be an object."),

  body("privacy.allowFriendRequests")
    .optional()
    .isBoolean()
    .withMessage("Invalid friend request setting.")
    .toBoolean(),

  body("privacy.showOnlineStatus")
    .optional()
    .isBoolean()
    .withMessage("Invalid online status setting.")
    .toBoolean(),

  body("privacy.showGameHistory")
    .optional()
    .isBoolean()
    .withMessage("Invalid game history setting.")
    .toBoolean(),

  body("notifications")
    .optional()
    .isObject()
    .withMessage("Notification settings must be an object."),

  body("notifications.*")
    .optional()
    .isBoolean()
    .withMessage("Notification preferences must be boolean values.")
    .toBoolean(),
];
