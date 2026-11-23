
import React from "react";
import GameCard from "./GameCard";
import EmptyState from "../common/EmptyState";
import Skeleton from "../common/Skeleton";

function GameGrid({
  games = [],
  loading = false,
  onPlay,
  columns = 4,
  emptyTitle = "No games found",
  emptyDescription = "Try changing your filters or search.",
  className = "",
}) {
  const columnStyles = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
  };

  if (loading) {
    return (
      <div className={`grid gap-5 ${columnStyles[columns] || columnStyles[4]} ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-3">
            <Skeleton variant="image" />
            <div className="mt-4 space-y-3">
              <Skeleton variant="title" />
              <Skeleton variant="text" lines={2} />
              <Skeleton variant="button" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!games.length) {
    return (
      <EmptyState
        icon="🎮"
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className={`grid gap-5 ${columnStyles[columns] || columnStyles[4]} ${className}`}>
      {games.map((game, index) => (
        <GameCard
          key={game.gameId || game.id || game._id || index}
          game={game}
          onPlay={onPlay}
        />
      ))}
    </div>
  );
}

export default GameGrid;
