
import { useSyncExternalStore } from "react";

let state = {
  friends: [],
  incomingRequests: [],
  outgoingRequests: [],
  blockedUsers: [],
  loading: false,
  error: null,
};

const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

function setState(updates) {
  state = {
    ...state,
    ...(typeof updates === "function" ? updates(state) : updates),
  };

  notify();
}

function getId(item) {
  return String(item?.id || item?._id || "");
}

const friendStore = {
  getState: () => state,

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  setFriends(friends) {
    setState({ friends });
  },

  addFriend(friend) {
    setState((current) => ({
      friends: current.friends.some(
        (item) => getId(item) === getId(friend)
      )
        ? current.friends
        : [...current.friends, friend],
    }));
  },

  removeFriend(friendId) {
    setState((current) => ({
      friends: current.friends.filter(
        (friend) => getId(friend) !== String(friendId)
      ),
    }));
  },

  setIncomingRequests(requests) {
    setState({ incomingRequests: requests });
  },

  addIncomingRequest(request) {
    setState((current) => ({
      incomingRequests: [
        request,
        ...current.incomingRequests.filter(
          (item) => getId(item) !== getId(request)
        ),
      ],
    }));
  },

  removeIncomingRequest(requestId) {
    setState((current) => ({
      incomingRequests: current.incomingRequests.filter(
        (item) => getId(item) !== String(requestId)
      ),
    }));
  },

  setOutgoingRequests(requests) {
    setState({ outgoingRequests: requests });
  },

  setBlockedUsers(users) {
    setState({ blockedUsers: users });
  },

  addBlockedUser(user) {
    setState((current) => ({
      blockedUsers: current.blockedUsers.some(
        (item) => getId(item) === getId(user)
      )
        ? current.blockedUsers
        : [...current.blockedUsers, user],
    }));
  },

  removeBlockedUser(userId) {
    setState((current) => ({
      blockedUsers: current.blockedUsers.filter(
        (user) => getId(user) !== String(userId)
      ),
    }));
  },

  setLoading(loading) {
    setState({ loading });
  },

  setError(error) {
    setState({ error });
  },

  reset() {
    setState({
      friends: [],
      incomingRequests: [],
      outgoingRequests: [],
      blockedUsers: [],
      loading: false,
      error: null,
    });
  },
};

export function useFriendStore() {
  return useSyncExternalStore(
    friendStore.subscribe,
    friendStore.getState,
    friendStore.getState
  );
}

export default friendStore;
