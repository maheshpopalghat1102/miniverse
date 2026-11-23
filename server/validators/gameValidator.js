
import { body, param } from "express-validator";

export const gameIdValidator = [
  param("gameId")
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Invalid game ID.")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Invalid game ID format."),
];

export const createMatchValidator = [
  body("gameId")
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Game ID is required.")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Invalid game ID format."),

  body("roomId")
    .isMongoId()
    .withMessage("A valid room ID is required."),

  body("gameMode")
    .optional()
    .isIn(["casual", "ranked", "private"])
    .withMessage("Invalid game mode."),
];

export const matchIdValidator = [
  param("matchId")
    .isMongoId()
    .withMessage("Invalid match ID."),
];

export const gameActionValidator = [
  param("matchId")
    .isMongoId()
    .withMessage("Invalid match ID."),

  body("action")
    .isObject()
    .withMessage("Game action must be an object.")
    .custom((value) => {
      if (Array.isArray(value)) {
        throw new Error("Game action must be a plain object.");
      }

      if (Object.keys(value).length === 0) {
        throw new Error("Game action cannot be empty.");
      }

      if (Object.keys(value).length > 20) {
        throw new Error("Game action contains too many fields.");
      }

      return true;
    }),
];

// This validates the request shape only.
// The server must calculate and verify the actual game result.
export const completeMatchValidator = [
  param("matchId")
    .isMongoId()
    .withMessage("Invalid match ID."),

  body("result")
    .optional()
    .isObject()
    .withMessage("Result must be an object."),
];

export const cancelMatchValidator = [
  param("matchId")
    .isMongoId()
    .withMessage("Invalid match ID."),

  body("reason")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Cancellation reason cannot exceed 250 characters."),
];
