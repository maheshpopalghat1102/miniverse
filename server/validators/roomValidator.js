
import { body, param } from "express-validator";

const validGameId = body("gameId")
  .trim()
  .isLength({ min: 2, max: 60 })
  .withMessage("A valid game ID is required.")
  .matches(/^[a-z0-9-]+$/)
  .withMessage("Invalid game ID format.");

export const createRoomValidator = [
  validGameId,

  body("type")
    .optional()
    .isIn(["public", "private"])
    .withMessage("Room type must be public or private."),

  body("maxPlayers")
    .optional()
    .isInt({ min: 2, max: 20 })
    .withMessage("Maximum players must be between 2 and 20.")
    .toInt(),

  body("minPlayers")
    .optional()
    .isInt({ min: 2, max: 20 })
    .withMessage("Minimum players must be between 2 and 20.")
    .toInt(),

  body("password")
    .if(body("type").equals("private"))
    .optional()
    .isString()
    .isLength({ min: 4, max: 64 })
    .withMessage("Private room password must be 4–64 characters."),

  body("settings")
    .optional()
    .isObject()
    .withMessage("Room settings must be an object.")
    .custom((value) => {
      if (Array.isArray(value)) {
        throw new Error("Room settings must be a plain object.");
      }
      return true;
    }),

  body("minPlayers").custom((value, { req }) => {
    const min = value ?? 2;
    const max = req.body.maxPlayers ?? 2;

    if (min > max) {
      throw new Error("Minimum players cannot exceed maximum players.");
    }

    return true;
  }),
];

export const joinRoomValidator = [
  param("roomCode")
    .trim()
    .isLength({ min: 5, max: 12 })
    .withMessage("Invalid room code.")
    .matches(/^[A-Z0-9]+$/i)
    .withMessage("Room code contains invalid characters."),

  body("password")
    .optional()
    .isString()
    .isLength({ max: 64 })
    .withMessage("Invalid room password."),
];

export const leaveRoomValidator = [
  param("roomId")
    .isMongoId()
    .withMessage("Invalid room ID."),
];

export const roomCodeValidator = [
  param("roomCode")
    .trim()
    .isLength({ min: 5, max: 12 })
    .matches(/^[A-Z0-9]+$/i)
    .withMessage("Invalid room code."),
];

export const readyStatusValidator = [
  param("roomId")
    .isMongoId()
    .withMessage("Invalid room ID."),

  body("isReady")
    .isBoolean()
    .withMessage("Ready status must be true or false.")
    .toBoolean(),
];
