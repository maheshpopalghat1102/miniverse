import Friendship from "../models/Friendship.js";

const sortUserIds = (firstId, secondId) =>
  [firstId.toString(), secondId.toString()].sort();

export const sendFriendRequest = async (requesterId, recipientId) => {
  if (requesterId.toString() === recipientId.toString()) {
    throw new Error("You cannot send a friend request to yourself.");
  }

  const [first, second] = sortUserIds(requesterId, recipientId);

  const existing = await Friendship.findOne({
    requester: { $in: [first, second] },
    recipient: { $in: [first, second] },
  });

  if (existing) {
    if (existing.status === "accepted") {
      throw new Error("You are already friends.");
    }

    if (existing.status === "blocked") {
      throw new Error("This friendship cannot be requested.");
    }

    if (existing.status === "pending") {
      throw new Error("A friend request already exists.");
    }

    existing.requester = requesterId;
    existing.recipient = recipientId;
    existing.status = "pending";
    existing.actionBy = requesterId;
    await existing.save();

    return existing;
  }

  return Friendship.create({
    requester: requesterId,
    recipient: recipientId,
    status: "pending",
  });
};

export const getFriends = async (userId) => {
  return Friendship.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }],
  }).populate("requester recipient", "username avatar");
};

export const getPendingFriendRequests = async (userId) => {
  return Friendship.find({
    recipient: userId,
    status: "pending",
  }).populate("requester", "username avatar");
};

export const respondToFriendRequest = async (
  requestId,
  recipientId,
  accepted
) => {
  const request = await Friendship.findOne({
    _id: requestId,
    recipient: recipientId,
    status: "pending",
  });

  if (!request) throw new Error("Friend request not found.");

  request.status = accepted ? "accepted" : "rejected";
  request.actionBy = recipientId;

  if (accepted) request.acceptedAt = new Date();

  await request.save();
  return request;
};

export const removeFriend = async (userId, friendId) => {
  const [first, second] = sortUserIds(userId, friendId);

  return Friendship.findOneAndDelete({
    status: "accepted",
    requester: { $in: [first, second] },
    recipient: { $in: [first, second] },
  });
};