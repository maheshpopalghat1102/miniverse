import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Tabs from "../components/ui/Tabs";
import SearchBar from "../components/ui/SearchBar";
import FriendCard from "../components/social/FriendCard";
import FriendRequest from "../components/social/FriendRequest";
import friendService from "../services/friendService";
import userService from "../services/userService";

export default function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("friends");
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadLists = useCallback(async () => {
    try {
      const [friendData, incomingData, outgoingData] = await Promise.all([
        friendService.getFriends(),
        friendService.getFriendRequests(),
        friendService.getSentRequests(),
      ]);
      setFriends(friendData.friends || []);
      setIncoming(incomingData.requests || []);
      setOutgoing(outgoingData.requests || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to load your friends.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    Promise.all([
      friendService.getFriends(),
      friendService.getFriendRequests(),
      friendService.getSentRequests(),
    ]).then(([friendData, incomingData, outgoingData]) => {
      setFriends(friendData.friends || []);
      setIncoming(incomingData.requests || []);
      setOutgoing(outgoingData.requests || []);
    }).catch((requestError) => {
      setError(requestError.message || "Unable to load your friends.");
    }).finally(() => setLoading(false));
  }, []);

  const searchPlayers = async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setError("");
    try {
      const result = await userService.searchUsers(query.trim());
      setSearchResults(result.users || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to search players.");
    }
  };

  const perform = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
      await loadLists();
      setSearchResults([]);
    } catch (requestError) {
      setError(requestError.message || "The friend request could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const tabs = [
    { label: "Friends", value: "friends", count: friends.length },
    { label: "Received", value: "incoming", count: incoming.length },
    { label: "Sent", value: "outgoing", count: outgoing.length },
  ];

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-sm text-violet-300">YOUR GAMING COMMUNITY</span>
            <h1 className="mt-1 text-3xl font-bold">Friends</h1>
            <p className="mt-2 text-gray-400">Connect with players and invite them to games.</p>
          </div>
          <Link to="/games/multiplayer" className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold hover:bg-violet-500">Play together</Link>
        </div>

        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        <div className="mt-7"><Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} /></div>

        {activeTab === "friends" && <section className="mt-6 space-y-4">
          <SearchBar value={search} onChange={setSearch} onSearch={searchPlayers} placeholder="Find players by username..." />
          {searchResults.map((player) => <article key={player._id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-gray-900 p-4">
            <button type="button" onClick={() => navigate(`/profile/${encodeURIComponent(player.username)}`)} className="flex min-w-0 items-center gap-3 text-left">
              <img src={player.avatar || "/images/default-avatar.png"} alt="" className="h-11 w-11 rounded-full bg-gray-800 object-cover" />
              <span className="truncate font-medium">@{player.username}</span>
            </button>
            <button type="button" disabled={busy} onClick={() => perform(() => friendService.sendFriendRequest(player._id))} className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold disabled:opacity-50">Add friend</button>
          </article>)}
          {loading ? <p className="rounded-xl bg-gray-900 p-6 text-center text-gray-400">Loading friends...</p>
            : friends.length ? friends.map((friend) => <FriendCard key={friend._id} friend={friend}
              onViewProfile={(person) => navigate(`/profile/${encodeURIComponent(person.username)}`)}
              onRemove={(id) => perform(() => friendService.removeFriend(id))} />)
              : <p className="rounded-xl border border-white/10 bg-gray-900 p-6 text-center text-gray-400">No friends yet. Search for players above.</p>}
        </section>}

        {activeTab === "incoming" && <section className="mt-6 space-y-4">
          {loading ? <p className="rounded-xl bg-gray-900 p-6 text-center text-gray-400">Loading requests...</p>
            : incoming.length ? incoming.map((request) => <FriendRequest key={request._id} request={request}
              direction="incoming" loading={busy}
              onAccept={(id) => perform(() => friendService.acceptFriendRequest(id))}
              onReject={(id) => perform(() => friendService.rejectFriendRequest(id))}
              onViewProfile={(person) => navigate(`/profile/${encodeURIComponent(person.username)}`)} />)
              : <p className="rounded-xl bg-gray-900 p-6 text-center text-gray-400">No incoming requests.</p>}
        </section>}

        {activeTab === "outgoing" && <section className="mt-6 space-y-4">
          {loading ? <p className="rounded-xl bg-gray-900 p-6 text-center text-gray-400">Loading requests...</p>
            : outgoing.length ? outgoing.map((request) => <FriendRequest key={request._id} request={request}
              direction="outgoing" loading={busy}
              onCancel={(id) => perform(() => friendService.cancelFriendRequest(id))}
              onViewProfile={(person) => navigate(`/profile/${encodeURIComponent(person.username)}`)} />)
              : <p className="rounded-xl bg-gray-900 p-6 text-center text-gray-400">No sent requests.</p>}
        </section>}
      </div>
    </main>
  );
}
