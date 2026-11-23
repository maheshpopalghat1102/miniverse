
import React, { useState } from "react";

export default function InviteFriend({
  friends = [],
  roomCode,
  gameName,
  onInvite,
  loading = false,
}) {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [search, setSearch] = useState("");

  const filteredFriends = friends.filter((friend) => {
    const name = friend.displayName || friend.username || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const toggleFriend = (friendId) => {
    setSelectedFriends((current) =>
      current.includes(friendId)
        ? current.filter((id) => id !== friendId)
        : [...current, friendId]
    );
  };

  const handleInvite = () => {
    if (!selectedFriends.length || loading) return;

    onInvite?.({
      friendIds: selectedFriends,
      roomCode,
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Invite friends</h2>
        <p className="mt-1 text-sm text-gray-400">
          Invite friends to join {gameName || "your game"}.
        </p>
        {roomCode && (
          <p className="mt-2 text-xs text-violet-300">
            Room code: {roomCode}
          </p>
        )}
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search friends..."
        className="mb-3 w-full rounded-xl border border-white/10 bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-violet-500"
      />

      <div className="max-h-64 space-y-2 overflow-y-auto">
        {filteredFriends.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No friends found.
          </p>
        ) : (
          filteredFriends.map((friend) => {
            const friendId = friend._id || friend.id;
            const name = friend.displayName || friend.username || "Player";
            const selected = selectedFriends.includes(friendId);

            return (
              <label
                key={friendId}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                  selected
                    ? "border-violet-500/50 bg-violet-500/10"
                    : "border-white/5 bg-gray-800/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleFriend(friendId)}
                  className="h-4 w-4 accent-violet-500"
                />

                <img
                  src={friend.avatar || "/images/default-avatar.png"}
                  alt=""
                  className="h-9 w-9 rounded-full bg-gray-700 object-cover"
                />

                <span className="min-w-0 flex-1 truncate text-sm text-white">
                  {name}
                </span>

                <span className="text-xs text-gray-500">
                  {friend.status === "online" ? "Online" : "Offline"}
                </span>
              </label>
            );
          })
        )}
      </div>

      <button
        type="button"
        disabled={!selectedFriends.length || loading}
        onClick={handleInvite}
        className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Sending..."
          : `Invite ${selectedFriends.length || ""} ${
              selectedFriends.length === 1 ? "friend" : "friends"
            }`}
      </button>
    </section>
  );
}
