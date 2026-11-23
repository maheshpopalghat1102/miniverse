
import { body, param } from "express-validator";

export const sendFriendRequestValidator = [
  body("recipientId")
    .isMongoId()
    .withMessage("A valid recipient ID is required."),
];

export const friendIdValidator = [
  param("friendId")
    .isMongoId()
    .withMessage("Invalid friend ID."),
];

export const respondFriendRequestValidator = [
  param("requestId")
    .isMongoId()
    .withMessage("Invalid friend request ID."),

  body("action")
    .isIn(["accept", "reject"])
    .withMessage("Action must be accept or reject."),
];

export const blockUserValidator = [
  body("userId")
    .isMongoId()
    .withMessage("A valid user ID is required."),
];

export const removeFriendValidator = [
  param("friendId")
    .isMongoId()
    .withMessage("Invalid friend ID."),
];
