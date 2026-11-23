
import React from "react";
import PlayerCard from "./PlayerCard";
import EmptyState from "../common/EmptyState";

function PlayerList({
  players = [],
  currentPlayerId,
  hostId,
  winnerId,
  title = "Players",
  maxPlayers,
  showScore = true,
  onPlayerClick,
}) {
  const playerCount = players.length;

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-white">
          {title}
        </h3>

        <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300">
          {playerCount}{maxPlayers ? ` / ${maxPlayers}` : ""} players
        </span>
      </div>

      {players.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Waiting for players"
          description="Players who join your room will appear here."
        />
      ) : (
        <div className="space-y-3">
          {players.map((player, index) => {
            const id = player._id || player.id;

            return (
              <PlayerCard
                key={id || index}
                player={player}
                isCurrentPlayer={id === currentPlayerId}
                isHost={id === hostId}
                isWinner={id === winnerId}
                showScore={showScore}
                onClick={
                  onPlayerClick
                    ? () => onPlayerClick(player)
                    : undefined
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PlayerList;
