
import { body, param } from "express-validator";

const usernameRules = body("username")
  .trim()
  .isLength({ min: 3, max: 20 })
  .withMessage("Username must be between 3 and 20 characters.")
  .matches(/^[a-zA-Z0-9_]+$/)
  .withMessage("Username can contain letters, numbers, and underscores only.");

const emailRules = body("email")
  .trim()
  .isEmail()
  .withMessage("Please provide a valid email address.")
  .normalizeEmail();

const passwordRules = body("password")
  .isString()
  .isLength({ min: 8, max: 128 })
  .withMessage("Password must be between 8 and 128 characters.");

export const registerValidator = [
  usernameRules,
  emailRules,
  passwordRules,
];

export const loginValidator = [
  emailRules,
  body("password")
    .isString()
    .notEmpty()
    .withMessage("Password is required."),
];

export const verifyEmailValidator = [
  body("token")
    .trim()
    .isLength({ min: 32, max: 256 })
    .withMessage("A valid verification token is required."),
];

export const forgotPasswordValidator = [
  emailRules,
];

export const resetPasswordValidator = [
  body("token")
    .trim()
    .isLength({ min: 32, max: 256 })
    .withMessage("A valid reset token is required."),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters."),
];

export const refreshTokenValidator = [
  body("refreshToken")
    .optional()
    .isString()
    .isLength({ min: 20, max: 2048 })
    .withMessage("Invalid refresh token."),
];

export const changePasswordValidator = [
  body("currentPassword")
    .isString()
    .notEmpty()
    .withMessage("Current password is required."),
  body("newPassword")
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage("New password must be between 8 and 128 characters.")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different.");
      }
      return true;
    }),
];
