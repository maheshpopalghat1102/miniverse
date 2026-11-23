
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Link,
  useNavigate,
  useParams
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";

import roomService from "../services/roomService";
import api from "../services/api";

// ==========================================
// HELPERS
// ==========================================

const getResponseData = (response) => {
  return response?.data?.room || response?.room || null;
};

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

const getUserId = (user) => {
  return String(user?.id || user?._id || "");
};

const getMemberId = (member) => {
  return String(member?.user?._id || member?.user || "");
};

// ==========================================
// ROOM PAGE
// ==========================================

export default function Room() {
  const { roomCode = "" } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const { socket, isConnected } = useSocketContext();

  const normalizedRoomCode = roomCode.trim().toUpperCase();

  // ========================================
  // STATE
  // ========================================

  const [room, setRoom] = useState(null);

  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  const [copied, setCopied] = useState(false);

  const [startingMatch, setStartingMatch] = useState(false);

  // ========================================
  // USER AND ROOM INFORMATION
  // ========================================

  const userId = getUserId(user);

  const hostId = String(
    room?.host?._id ||
    room?.host ||
    ""
  );

  const isHost = Boolean(userId && userId === hostId);

  const currentMember = useMemo(() => {
    return room?.members?.find(
      (member) => getMemberId(member) === userId
    );
  }, [room, userId]);

  const isMember = Boolean(currentMember);

  const members = room?.members || [];

  const activeMembers = members.filter(
    (member) => member.status !== "left"
  );

  const readyCount = activeMembers.filter(
    (member) => Boolean(member.isReady)
  ).length;

  const minPlayers = Number(
    room?.minPlayers ||
    room?.game?.minPlayers ||
    2
  );

  const canStart =
    isHost &&
    room?.status === "waiting" &&
    readyCount >= minPlayers &&
    activeMembers.length >= minPlayers;

  // ========================================
  // NAVIGATE TO GAME
  // ========================================

  const openGame = useCallback(
    (data) => {
      const matchId =
        data?.matchId ||
        data?.currentMatch;

      const gameId =
        data?.gameId ||
        room?.game?.gameId;

      const targetRoomCode =
        data?.roomCode ||
        normalizedRoomCode;

      if (!matchId || !gameId) {
        console.error("Cannot open game. Missing match information:", data);
        return;
      }

      navigate(
        `/play/${encodeURIComponent(gameId)}` +
        `?matchId=${encodeURIComponent(matchId)}` +
        `&roomCode=${encodeURIComponent(targetRoomCode)}`,
        { replace: true }
      );
    },
    [navigate, room?.game?.gameId, normalizedRoomCode]
  );

  // ========================================
  // LOAD ROOM
  // ========================================

  const loadRoom = useCallback(async () => {
    if (!normalizedRoomCode) {
      setError("Room code is missing.");
      setLoading(false);
      return null;
    }

    try {
      const response = await roomService.getRoomByCode(
        normalizedRoomCode
      );

      const roomData = getResponseData(response);

      if (!roomData) {
        throw new Error("Room information was not returned by the server.");
      }

      setRoom(roomData);
      setError("");

      return roomData;
    } catch (requestError) {
      console.error("LOAD ROOM ERROR:", requestError);

      setError(getErrorMessage(requestError));

      return null;
    } finally {
      setLoading(false);
    }
  }, [normalizedRoomCode]);

  // Initial room load.
  useEffect(() => {
    let active = true;

    const fetchRoom = async () => {
      setLoading(true);

      const result = await roomService
        .getRoomByCode(normalizedRoomCode)
        .then(getResponseData)
        .catch((requestError) => {
          if (active) {
            console.error("LOAD ROOM ERROR:", requestError);
            setError(getErrorMessage(requestError));
          }

          return null;
        });

      if (!active) return;

      if (result) {
        setRoom(result);
        setError("");
      }

      setLoading(false);
    };

    fetchRoom();

    return () => {
      active = false;
    };
  }, [normalizedRoomCode]);

  // ========================================
  // SOCKET EVENTS
  // ========================================

  useEffect(() => {
    if (!socket || !normalizedRoomCode) {
      return undefined;
    }

    // Join the backend Socket.IO room.
    const joinSocketRoom = () => {
      socket.emit(
        "room:join",
        { roomCode: normalizedRoomCode },
        (result) => {
          if (!result?.success) {
            console.error("SOCKET ROOM JOIN ERROR:", result);

            setError(
              result?.message ||
              "Unable to connect to live room updates."
            );
          }
        }
      );
    };

    // Refresh room information.
    const handleRoomUpdated = (data) => {
      if (
        data?.roomCode &&
        data.roomCode.toUpperCase() !== normalizedRoomCode
      ) {
        return;
      }

      loadRoom();
    };

    const handleMemberJoined = () => {
      loadRoom();
    };

    const handleMemberLeft = () => {
      loadRoom();
    };

    // Both players receive this event when the host starts.
    const handleGameStarted = (data) => {
      if (
        data?.roomCode &&
        data.roomCode.toUpperCase() !== normalizedRoomCode
      ) {
        return;
      }

      openGame(data);
    };

    const handleRoomClosed = (data) => {
      if (
        data?.roomCode &&
        data.roomCode.toUpperCase() !== normalizedRoomCode
      ) {
        return;
      }

      navigate("/games/multiplayer", {
        replace: true,
        state: {
          notice: "The host closed this room."
        }
      });
    };

    const handleMatchCompleted = (data) => {
      if (
        data?.roomCode &&
        data.roomCode.toUpperCase() !== normalizedRoomCode
      ) {
        return;
      }

      setMessage("The match has been completed.");
      loadRoom();
    };

    // Register event listeners BEFORE joining the room.
    socket.on("room:updated", handleRoomUpdated);
    socket.on("room:member-joined", handleMemberJoined);
    socket.on("room:member-left", handleMemberLeft);
    socket.on("game:started", handleGameStarted);
    socket.on("room:closed", handleRoomClosed);
    socket.on("match:completed", handleMatchCompleted);

    // Join immediately or after reconnecting.
    if (socket.connected) {
      joinSocketRoom();
    } else {
      socket.on("connect", joinSocketRoom);
    }

    return () => {
      socket.off("connect", joinSocketRoom);

      socket.off("room:updated", handleRoomUpdated);
      socket.off("room:member-joined", handleMemberJoined);
      socket.off("room:member-left", handleMemberLeft);
      socket.off("game:started", handleGameStarted);
      socket.off("room:closed", handleRoomClosed);
      socket.off("match:completed", handleMatchCompleted);

      if (socket.connected) {
        socket.emit("room:leave", {
          roomCode: normalizedRoomCode
        });
      }
    };
  }, [
    socket,
    normalizedRoomCode,
    loadRoom,
    navigate,
    openGame
  ]);

  // ========================================
  // RECOVER AN ALREADY STARTED MATCH
  // ========================================

  useEffect(() => {
    if (!room || room.status !== "playing") {
      return;
    }

    const matchId =
      room.currentMatch?._id ||
      room.currentMatch;

    if (matchId && room.game?.gameId) {
      openGame({
        matchId,
        gameId: room.game.gameId,
        roomCode: normalizedRoomCode
      });
    }
  }, [room, normalizedRoomCode, openGame]);

  // ========================================
  // COPY ROOM CODE
  // ========================================

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(normalizedRoomCode);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (copyError) {
      console.error("COPY ROOM CODE ERROR:", copyError);

      setError("Unable to copy the room code.");
    }
  };

  // ========================================
  // READY STATUS
  // ========================================

  const toggleReady = async () => {
    if (!isMember || !currentMember || busy) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const nextReadyStatus = !currentMember.isReady;

      await roomService.setReady(
        normalizedRoomCode,
        nextReadyStatus
      );

      await loadRoom();

      setMessage(
        nextReadyStatus
          ? "You are ready!"
          : "Your ready status was removed."
      );
    } catch (requestError) {
      console.error("READY STATUS ERROR:", requestError);

      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // START MATCH
  // ========================================

  const startMatch = async () => {
    if (startingMatch || busy) return;

    if (!isHost) {
      setError("Only the room host can start the game.");
      return;
    }

    if (!room?._id || !room?.game?.gameId) {
      setError("Room or game information is missing.");
      return;
    }

    if (room.status !== "waiting") {
      setError("This room is not waiting for a match.");
      return;
    }

    const currentReadyMembers = (room.members || []).filter(
      (member) =>
        member.isReady &&
        member.status !== "left"
    );

    if (currentReadyMembers.length < minPlayers) {
      setError(
        `At least ${minPlayers} ready players are required. Currently ready: ${currentReadyMembers.length}.`
      );
      return;
    }

    setStartingMatch(true);
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/matches", {
        gameId: room.game.gameId,
        roomId: room._id,
        gameMode:
          room.type === "private"
            ? "private"
            : "public"
      });

      // Supports both Axios response format and
      // an API client that returns response.data directly.
      const responseData = response?.data || response;

      const match = responseData?.match;

      if (!match?._id) {
        throw new Error(
          responseData?.message ||
          "The server did not return a valid match ID."
        );
      }

      setMessage("Match started successfully.");

      // Navigate the host immediately.
      // The other players navigate from game:started.
      openGame({
        matchId: match._id,
        gameId: room.game.gameId,
        roomCode: normalizedRoomCode
      });

    } catch (requestError) {
      console.error("START MATCH ERROR:", requestError);
      console.error(
        "SERVER RESPONSE:",
        requestError?.response?.data
      );

      setError(getErrorMessage(requestError));

      // Refresh room data to show the latest readiness.
      await loadRoom();
    } finally {
      setStartingMatch(false);
      setBusy(false);
    }
  };

  // ========================================
  // LEAVE ROOM
  // ========================================

  const leaveRoom = async () => {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await roomService.leaveRoom(normalizedRoomCode);

      navigate("/games/multiplayer", {
        replace: true,
        state: {
          notice: "You left the room."
        }
      });
    } catch (requestError) {
      console.error("LEAVE ROOM ERROR:", requestError);

      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // CLOSE ROOM
  // ========================================

  const closeRoom = async () => {
    if (!isHost || busy) return;

    const confirmed = window.confirm(
      "Are you sure you want to close this room?"
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");

    try {
      await roomService.closeRoom(normalizedRoomCode);

      navigate("/games/multiplayer", {
        replace: true,
        state: {
          notice: "Room closed successfully."
        }
      });
    } catch (requestError) {
      console.error("CLOSE ROOM ERROR:", requestError);

      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-300">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-violet-500" />

          <p className="mt-4">
            Loading room...
          </p>
        </div>
      </main>
    );
  }

  // ========================================
  // ROOM NOT FOUND
  // ========================================

  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-white">
        <div className="max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 text-center">

          <h1 className="text-2xl font-bold">
            Unable to open room
          </h1>

          <p className="mt-3 text-sm text-rose-300">
            {error || "Room information could not be loaded."}
          </p>

          <button
            type="button"
            onClick={loadRoom}
            className="mt-6 rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
          >
            Try again
          </button>

          <Link
            to="/games/multiplayer"
            className="mt-4 block text-sm text-gray-400 hover:text-white"
          >
            Back to multiplayer
          </Link>

        </div>
      </main>
    );
  }

  // ========================================
  // MAIN ROOM UI
  // ========================================

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">

      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <p className="text-sm text-violet-300">
              GAME LOBBY
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {room.game?.name || "Game Room"}
            </h1>
          </div>

          <Link
            to="/games/multiplayer"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
          >
            Back to multiplayer
          </Link>

        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300"
          >
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}

        {message && (
          <div
            role="status"
            className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300"
          >
            {message}
          </div>
        )}

        {/* ROOM CODE */}

        <section className="mt-7 rounded-2xl border border-white/10 bg-gray-900 p-6">

          <p className="text-sm text-gray-400">
            Share this code with your friends
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">

            <span className="rounded-xl bg-gray-800 px-5 py-3 font-mono text-2xl font-bold tracking-widest text-violet-300">
              {room.roomCode}
            </span>

            <button
              type="button"
              onClick={copyCode}
              className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold hover:bg-violet-500"
            >
              {copied ? "Copied!" : "Copy code"}
            </button>

          </div>

        </section>

        {/* PLAYERS AND STATUS */}

        <section className="mt-5 grid gap-5 md:grid-cols-2">

          {/* PLAYERS */}

          <div className="rounded-2xl border border-white/10 bg-gray-900 p-6">

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-bold">
                Players
              </h2>

              <span className="text-sm text-gray-400">
                {activeMembers.length}/{room.maxPlayers}
              </span>

            </div>

            <div className="mt-4 space-y-2">

              {members.map((member) => {
                const memberUser = member.user || {};

                const memberId = getMemberId(member);

                const memberIsHost =
                  member.role === "host" ||
                  memberId === hostId;

                return (
                  <div
                    key={memberId}
                    className="flex items-center justify-between rounded-xl bg-gray-800/70 p-3"
                  >

                    <div>
                      <p className="font-medium">
                        {memberUser.username || "Player"}

                        {memberId === userId && " (you)"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {memberIsHost ? "Host" : "Player"}
                      </p>
                    </div>

                    <span
                      className={
                        member.isReady
                          ? "text-xs text-emerald-400"
                          : "text-xs text-gray-400"
                      }
                    >
                      {member.isReady ? "Ready" : "Not ready"}
                    </span>

                  </div>
                );
              })}

              {members.length === 0 && (
                <p className="text-sm text-gray-400">
                  No players have joined.
                </p>
              )}

            </div>

            <div className="mt-5 rounded-lg bg-gray-800/70 p-3">

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  Ready players
                </span>

                <span className="font-semibold text-emerald-300">
                  {readyCount}/{minPlayers} required
                </span>
              </div>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (readyCount / Math.max(minPlayers, 1)) * 100
                    )}%`
                  }}
                />
              </div>

            </div>

          </div>

          {/* ROOM STATUS */}

          <div className="rounded-2xl border border-white/10 bg-gray-900 p-6">

            <h2 className="text-lg font-bold">
              Room status
            </h2>

            <p className="mt-3 text-sm capitalize text-amber-300">
              {room.status}
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Live updates {isConnected ? "connected" : "connecting"}.
            </p>

            <div className="mt-6 space-y-3">

              {/* READY BUTTON */}

              {room.status === "waiting" && isMember && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={toggleReady}
                  className="w-full rounded-xl border border-white/10 p-3 font-semibold hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy
                    ? "Please wait..."
                    : currentMember?.isReady
                      ? "Mark not ready"
                      : "I'm ready"}
                </button>
              )}

              {/* START BUTTON */}

              {room.status === "waiting" && isHost && (
                <div>

                  <button
                    type="button"
                    disabled={busy || !canStart}
                    onClick={startMatch}
                    className="w-full rounded-xl bg-violet-600 p-3 font-semibold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {startingMatch
                      ? "Starting game..."
                      : "Start game"}
                  </button>

                  {!canStart && (
                    <p className="mt-2 text-xs text-amber-300">
                      Waiting for at least {minPlayers} ready players.
                      Currently ready: {readyCount}.
                    </p>
                  )}

                </div>
              )}

              {/* WAITING FOR GAME */}

              {room.status === "playing" && (
                <div className="rounded-lg bg-violet-500/10 p-3 text-sm text-violet-200">
                  Match started. Opening gameplay...
                </div>
              )}

              {/* LEAVE ROOM */}

              {room.status !== "playing" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={leaveRoom}
                  className="w-full rounded-xl border border-rose-500/20 p-3 font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
                >
                  Leave room
                </button>
              )}

              {/* CLOSE ROOM */}

              {isHost && room.status === "waiting" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={closeRoom}
                  className="w-full rounded-xl border border-white/10 p-3 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50"
                >
                  Close room
                </button>
              )}

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}
