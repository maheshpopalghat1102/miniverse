
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Friendship from "../models/Friendship.js";
import Match from "../models/Match.js";
import bcrypt from "bcryptjs";

const getUserId = (req) => req.user?.id || req.user?._id;

export const getMyProfile = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const user = await User.findById(userId).select(
      "username email avatar role status isEmailVerified createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const profile = await Profile.findOne({ user: userId });

    return res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId
    }).populate("user", "username avatar createdAt");

    if (!profile || !profile.user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found."
      });
    }

    if (profile.user.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Profile not found."
      });
    }

    const ownerId = profile.user._id.toString();
    const viewerId = getUserId(req)?.toString();

    if (
      profile.privacy.profileVisibility === "private" &&
      ownerId !== viewerId
    ) {
      return res.status(403).json({
        success: false,
        message: "This profile is private."
      });
    }

    if (
      profile.privacy.profileVisibility === "friends" &&
      ownerId !== viewerId
    ) {
      const friendship = await Friendship.findOne({
        status: "accepted",
        $or: [
          { requester: ownerId, recipient: viewerId },
          { requester: viewerId, recipient: ownerId }
        ]
      });

      if (!friendship) {
        return res.status(403).json({
          success: false,
          message: "This profile is only visible to friends."
        });
      }
    }

    const response = profile.toObject();

    delete response.dateOfBirth;

    if (
      !profile.privacy.showGameHistory &&
      ownerId !== viewerId
    ) {
      delete response.statistics;
    }

    return res.status(200).json({
      success: true,
      profile: response
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByUsername = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase(), status: "active" })
      .select("username avatar createdAt");
    if (!user) return res.status(404).json({ success: false, message: "Profile not found." });
    const profile = await Profile.findOne({ user: user._id }).populate("favoriteGames", "name gameId");
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found." });

    const viewerId = getUserId(req)?.toString();
    const ownerId = user._id.toString();
    if (profile.privacy.profileVisibility === "private" && ownerId !== viewerId) {
      return res.status(403).json({ success: false, message: "This profile is private." });
    }
    if (profile.privacy.profileVisibility === "friends" && ownerId !== viewerId) {
      const friendship = await Friendship.exists({ status: "accepted", $or: [
        { requester: ownerId, recipient: viewerId },
        { requester: viewerId, recipient: ownerId }
      ] });
      if (!friendship) return res.status(403).json({ success: false, message: "This profile is only visible to friends." });
    }

    const safeProfile = profile.toObject();
    delete safeProfile.dateOfBirth;
    if (!profile.privacy.showGameHistory && ownerId !== viewerId) delete safeProfile.statistics;
    return res.status(200).json({ success: true, user, profile: safeProfile });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const allowedFields = [
      "displayName",
      "bio",
      "avatar",
      "coverImage",
      "country",
      "interests",
      "favoriteGames",
      "theme",
      "language",
      "privacy"
    ];

    const { username } = req.body;
    if (username !== undefined) {
      const normalizedUsername = String(username).trim().toLowerCase();
      if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
        return res.status(400).json({ success: false, message: "Username must be 3 to 20 letters, numbers, or underscores." });
      }
      const duplicate = await User.exists({ username: normalizedUsername, _id: { $ne: userId } });
      if (duplicate) {
        return res.status(409).json({ success: false, message: "That username is already in use." });
      }
    }

    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0 && username === undefined) {
      return res.status(400).json({
        success: false,
        message: "No valid profile fields provided."
      });
    }

    const profile = Object.keys(updates).length
      ? await Profile.findOneAndUpdate(
        { user: userId },
        { $set: updates },
        {
          new: true,
          runValidators: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      )
      : await Profile.findOne({ user: userId });

    if (username !== undefined) {
      await User.findByIdAndUpdate(userId, { $set: { username: String(username).trim().toLowerCase() } });
    }

    if (Object.hasOwn(req.body, "avatar")) {
      await User.findByIdAndUpdate(userId, {
        $set: { avatar: req.body.avatar }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile,
      user: username === undefined ? undefined : await User.findById(userId).select("username email avatar role status isEmailVerified createdAt")
    });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();

    if (search.length < 2 || search.length > 24) {
      return res.status(400).json({
        success: false,
        message: "Search must contain between 2 and 24 characters."
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 10));

    const users = await User.find({
      status: "active",
      _id: { $ne: getUserId(req) },
      username: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" }
    })
      .select("username avatar createdAt")
      .sort({ username: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      page,
      limit,
      users
    });
  } catch (error) {
    next(error);
  }
};

export const updateAccountSettings = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { theme, language, privacy, notifications } = req.body;

    const updates = {};

    if (theme !== undefined) updates.theme = theme;
    if (language !== undefined) updates.language = language;
    if (privacy !== undefined) updates.privacy = privacy;
    if (notifications !== undefined) updates.notifications = notifications;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No settings provided."
      });
    }

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      { $set: updates },
      { new: true, runValidators: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Settings updated.",
      profile
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMyAccount = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (!(await bcrypt.compare(String(req.body.password || ""), user.password))) {
      return res.status(401).json({ success: false, message: "Your password is incorrect." });
    }

    user.status = "deleted";
    user.deletionRequestedAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account deactivated. Data deletion must be completed by the account deletion workflow."
    });
  } catch (error) {
    next(error);
  }
};

export const getMyGameHistory = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const matches = await Match.find({
      "players.user": userId,
      status: { $in: ["completed", "cancelled"] }
    })
      .populate("game", "name gameId category thumbnail")
      .populate("players.user", "username")
      .sort({ endedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      page,
      limit,
      matches
    });
  } catch (error) {
    next(error);
  }
};
