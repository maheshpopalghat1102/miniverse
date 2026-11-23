
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import roomService from "../services/roomService";

export default function JoinRoom() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const code = roomCode.trim().toUpperCase();

    if (!/^[A-Z0-9]{4,12}$/.test(code)) {
      setError("Enter a valid room code (4–12 letters or numbers).");
      return;
    }

    setLoading(true);
    try {
      const result = await roomService.joinRoom(code, password);
      const joinedCode = result.room?.roomCode || result.data?.room?.roomCode || code;
      navigate(`/rooms/${joinedCode}`, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to join this room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 sm:p-8">
        <div className="text-center">
          <span className="text-5xl">🔑</span>
          <h1 className="mt-4 text-2xl font-bold">Join a room</h1>
          <p className="mt-2 text-sm text-gray-400">Enter the room code shared by your friend.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="roomCode" className="mb-2 block text-sm font-medium">Room code</label>
            <input
              id="roomCode"
              value={roomCode}
              onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))}
              placeholder="ENTER CODE"
              maxLength={12}
              autoComplete="off"
              className="w-full rounded-xl border border-white/10 bg-gray-800 p-4 text-center text-xl font-bold tracking-[0.25em] text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label htmlFor="roomPassword" className="mb-2 block text-sm font-medium">Password (if required)</label>
            <input id="roomPassword" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500" placeholder="Room password" />
          </div>

          {error && <p role="alert" className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-violet-600 p-3 font-semibold hover:bg-violet-500 disabled:opacity-50">
            {loading ? "Joining room..." : "Find and join room"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Want to host? <Link to="/rooms/create" className="text-violet-300 hover:underline">Create a room</Link>
        </p>
      </div>
    </main>
  );
}
