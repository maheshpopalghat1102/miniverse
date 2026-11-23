
import Friendship from "../models/Friendship.js";
import User from "../models/User.js";

const getUserId = (req) => req.user?.id || req.user?._id;

export const sendFriendRequest = async (req, res, next) => {
  try {
    const requester = getUserId(req);
    const recipient = req.params.userId;

    if (requester.toString() === recipient.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot add yourself."
      });
    }

    const recipientUser = await User.findOne({
      _id: recipient,
      status: "active"
    });

    if (!recipientUser) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requester, recipient },
        { requester: recipient, recipient: requester }
      ]
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A friendship or request already exists."
      });
    }

    const friendship = await Friendship.create({
      requester,
      recipient,
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      message: "Friend request sent.",
      friendship
    });
  } catch (error) {
    next(error);
  }
};

export const getFriendRequests = async (req, res, next) => {
  try {
    const requests = await Friendship.find({
      recipient: getUserId(req),
      status: "pending"
    })
      .populate("requester", "username avatar")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    next(error);
  }
};

export const getSentFriendRequests = async (req, res, next) => {
  try {
    const requests = await Friendship.find({
      requester: getUserId(req),
      status: "pending"
    })
      .populate("recipient", "username avatar")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};

export const cancelFriendRequest = async (req, res, next) => {
  try {
    const request = await Friendship.findOneAndDelete({
      _id: req.params.requestId,
      requester: getUserId(req),
      status: "pending"
    });

    if (!request) {
      return res.status(404).json({ success: false, message: "Pending friend request not found." });
    }

    return res.status(200).json({ success: true, message: "Friend request cancelled." });
  } catch (error) {
    next(error);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
  try {
    const friendship = await Friendship.findOneAndUpdate(
      {
        _id: req.params.requestId,
        recipient: getUserId(req),
        status: "pending"
      },
      {
        $set: {
          status: "accepted",
          acceptedAt: new Date(),
          actionBy: getUserId(req)
        }
      },
      { new: true }
    );

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Pending friend request not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Friend request accepted.",
      friendship
    });
  } catch (error) {
    next(error);
  }
};

export const rejectFriendRequest = async (req, res, next) => {
  try {
    const friendship = await Friendship.findOneAndUpdate(
      {
        _id: req.params.requestId,
        recipient: getUserId(req),
        status: "pending"
      },
      {
        $set: {
          status: "rejected",
          actionBy: getUserId(req)
        }
      },
      { new: true }
    );

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Pending friend request not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Friend request rejected."
    });
  } catch (error) {
    next(error);
  }
};

export const getMyFriends = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const friendships = await Friendship.find({
      status: "accepted",
      $or: [
        { requester: userId },
        { recipient: userId }
      ]
    })
      .populate("requester", "username avatar")
      .populate("recipient", "username avatar")
      .lean();

    const friends = friendships.map((friendship) => (
      friendship.requester._id.toString() === userId.toString()
        ? friendship.recipient
        : friendship.requester
    ));

    return res.status(200).json({
      success: true,
      count: friends.length,
      friends
    });
  } catch (error) {
    next(error);
  }
};

export const removeFriend = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const friendId = req.params.userId;

    const friendship = await Friendship.findOneAndDelete({
      status: "accepted",
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId }
      ]
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: "Friendship not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Friend removed."
    });
  } catch (error) {
    next(error);
  }
};

export const blockUser = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const targetId = req.params.userId;

    if (userId.toString() === targetId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself."
      });
    }

    const target = await User.findOne({
      _id: targetId,
      status: "active"
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requester: userId, recipient: targetId },
        { requester: targetId, recipient: userId }
      ]
    });

    let friendship;

    if (existing) {
      existing.status = "blocked";
      existing.actionBy = userId;
      existing.blockedAt = new Date();
      friendship = await existing.save();
    } else {
      friendship = await Friendship.create({
        requester: userId,
        recipient: targetId,
        status: "blocked",
        actionBy: userId,
        blockedAt: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: "User blocked.",
      friendship
    });
  } catch (error) {
    next(error);
  }
};
