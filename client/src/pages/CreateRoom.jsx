
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import roomService from "../services/roomService";
import gameService from "../services/gameService";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    gameId: searchParams.get("gameId") || "tic-tac-toe",
    type: "public",
    maxPlayers: 2,
    password: "",
    allowSpectators: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(true);

  useEffect(() => {
    gameService.getAllGames({ category: "multiplayer" }).then((result) => {
      const availableGames = result.games || [];
      setGames(availableGames);
      if (availableGames.length) {
        setForm((current) => ({
          ...current,
          gameId: availableGames.some((game) => game.gameId === current.gameId) ? current.gameId : availableGames[0].gameId,
          maxPlayers: availableGames.find((game) => game.gameId === current.gameId)?.minPlayers || availableGames[0].minPlayers,
        }));
      }
    }).catch((requestError) => setError(requestError.message || "Unable to load available games."))
      .finally(() => setGamesLoading(false));
  }, []);

  const selectedGame = games.find((game) => game.gameId === form.gameId);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: type === "checkbox" ? checked : value };
      if (name === "gameId") {
        const game = games.find((item) => item.gameId === value);
        next.maxPlayers = game?.minPlayers || 2;
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.type === "private" && form.password.length < 4) {
      setError("Private room passwords must contain at least 4 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await roomService.createRoom({
        gameId: form.gameId,
        type: form.type,
        maxPlayers: Number(form.maxPlayers),
        password: form.type === "private" ? form.password : "",
        allowSpectators: form.allowSpectators,
      });
      const roomCode = result.room?.roomCode || result.data?.room?.roomCode;
      if (!roomCode) throw new Error("The server created the room but did not return its code.");
      navigate(`/rooms/${roomCode}`, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to create the room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-2xl">
        <Link to="/games/multiplayer" className="text-sm text-violet-300">← Multiplayer games</Link>
        <div className="mt-5 rounded-2xl border border-white/10 bg-gray-900 p-6 sm:p-8">
          <h1 className="text-2xl font-bold">Create a room</h1>
          <p className="mt-2 text-sm text-gray-400">Set up a room and invite other players.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="gameId" className="mb-2 block text-sm font-medium">Choose game</label>
              <select id="gameId" name="gameId" value={form.gameId} onChange={update} className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white">
                {games.map((game) => <option key={game.gameId} value={game.gameId}>{game.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Room visibility</label>
              <div className="grid grid-cols-2 gap-3">
                {["public", "private"].map((type) => (
                  <button key={type} type="button" onClick={() => setForm((current) => ({ ...current, type }))} className={`rounded-xl border p-4 text-left capitalize ${form.type === type ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-gray-800"}`}>
                    <span className="block text-lg">{type === "public" ? "🌍" : "🔒"}</span>
                    <span className="mt-2 block font-semibold">{type}</span>
                    <span className="mt-1 block text-xs text-gray-400">{type === "public" ? "Players can discover your room" : "Restrict access with a password"}</span>
                  </button>
                ))}
              </div>
            </div>

            {form.type === "private" && (
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">Room password</label>
                <input id="password" name="password" type="password" value={form.password} onChange={update} minLength={4} required className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500" placeholder="At least 4 characters" />
              </div>
            )}

            <div>
              <label htmlFor="maxPlayers" className="mb-2 block text-sm font-medium">Maximum players</label>
              <select id="maxPlayers" name="maxPlayers" value={form.maxPlayers} onChange={update} className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white">
                {Array.from({ length: Math.max(0, (selectedGame?.maxPlayers || 0) - (selectedGame?.minPlayers || 1) + 1) }, (_, index) => index + (selectedGame?.minPlayers || 1)).map((count) => <option key={count} value={count}>{count} players</option>)}
              </select>
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-300">
              <input type="checkbox" name="allowSpectators" checked={form.allowSpectators} onChange={update} className="h-4 w-4 accent-violet-500" />
              Allow spectators
            </label>

            {error && <p role="alert" className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

            <button type="submit" disabled={loading || gamesLoading || !selectedGame} className="w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500 disabled:opacity-50">
              {loading ? "Creating room..." : gamesLoading ? "Loading games..." : "Create room"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
