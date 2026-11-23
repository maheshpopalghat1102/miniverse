
import "dotenv/config";

import mongoose from "mongoose";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import { hashPassword } from "../utils/password.js";

const createAdmin = async () => {
  const {
    ADMIN_USERNAME,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
  } = process.env;

  try {
    if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "Set ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD in server/.env."
      );
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(ADMIN_USERNAME)) {
      throw new Error("Admin username must be 3–20 valid characters.");
    }

    if (ADMIN_PASSWORD.length < 12 || ADMIN_PASSWORD.length > 128) {
      throw new Error("Admin password must be 12–128 characters.");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const email = ADMIN_EMAIL.trim().toLowerCase();
    const username = ADMIN_USERNAME.trim();

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new Error(
        "An account with this email or username already exists. No changes were made."
      );
    }

    const hashedPassword = await hashPassword(ADMIN_PASSWORD);

    const admin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "admin",
      status: "active",
      isEmailVerified: true,
    });

    try {
      await Profile.create({
        user: admin._id,
        displayName: username,
      });
    } catch (profileError) {
      await User.deleteOne({ _id: admin._id });
      throw profileError;
    }

    console.log("Administrator account created successfully.");
    console.log({
      userId: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

createAdmin();
