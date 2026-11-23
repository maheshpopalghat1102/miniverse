
import { body, param, query } from "express-validator";

const categories = [
  "normal",
  "adult-18-plus",
  "private",
  "couples",
  "friends-party",
  "funny-crazy",
  "long-distance-couples",
];

export const getPromptsValidator = [
  query("type")
    .optional()
    .isIn(["truth", "dare"])
    .withMessage("Type must be truth or dare."),

  query("category")
    .optional()
    .isIn(categories)
    .withMessage("Invalid Truth or Dare category."),

  query("language")
    .optional()
    .isIn(["en", "hi", "mr"])
    .withMessage("Unsupported language."),

  query("page")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage("Invalid page number.")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50.")
    .toInt(),
];

export const randomPromptValidator = [
  body("type")
    .isIn(["truth", "dare"])
    .withMessage("Select truth or dare."),

  body("category")
    .isIn(categories)
    .withMessage("Select a valid category."),

  body("language")
    .optional()
    .isIn(["en", "hi", "mr"])
    .withMessage("Unsupported language."),
];

export const createPromptValidator = [
  body("promptId")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Prompt ID must be between 3 and 100 characters."),

  body("type")
    .isIn(["truth", "dare"])
    .withMessage("Prompt type must be truth or dare."),

  body("category")
    .isIn(categories)
    .withMessage("Invalid prompt category."),

  body("content")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Prompt must be between 5 and 500 characters."),

  body("language")
    .optional()
    .isIn(["en", "hi", "mr"])
    .withMessage("Unsupported language."),

  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Invalid difficulty."),

  body("ageRestricted")
    .optional()
    .isBoolean()
    .withMessage("ageRestricted must be true or false.")
    .toBoolean(),

  body("minPlayers")
    .optional()
    .isInt({ min: 2, max: 20 })
    .withMessage("Minimum players must be between 2 and 20.")
    .toInt(),

  body("maxPlayers")
    .optional()
    .isInt({ min: 2, max: 20 })
    .withMessage("Maximum players must be between 2 and 20.")
    .toInt(),
];

export const updatePromptValidator = [
  param("promptId")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Invalid prompt ID."),

  body("content")
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Prompt must be between 5 and 500 characters."),

  body("type")
    .optional()
    .isIn(["truth", "dare"])
    .withMessage("Invalid prompt type."),

  body("category")
    .optional()
    .isIn(categories)
    .withMessage("Invalid prompt category."),

  body("active")
    .optional()
    .isBoolean()
    .withMessage("Active must be true or false.")
    .toBoolean(),
];

export const deletePromptValidator = [
  param("promptId")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Invalid prompt ID."),
];
