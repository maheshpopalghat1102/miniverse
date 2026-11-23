
import React from "react";
import { Link } from "react-router-dom";
import Badge from "../common/Badge";

const categoryStyles = {
  multiplayer: "primary",
  "single-player": "success",
  "turn-by-turn": "warning",
};

function GameCard({
  game,
  onPlay,
  showCategory = true,
  className = "",
}) {
  if (!game) return null;

  const {
    gameId,
    id,
    name,
    title,
    description,
    image,
    coverImage,
    icon = "🎮",
    category = "multiplayer",
    difficulty = "Easy",
    minPlayers,
    maxPlayers,
    featured = false,
  } = game;

  const gameName = name || title || "Untitled Game";
  const routeId = gameId || id;

  const imageUrl = coverImage || image;

  const playerText =
    minPlayers && maxPlayers
      ? `${minPlayers}-${maxPlayers} players`
      : maxPlayers
        ? `Up to ${maxPlayers} players`
        : "Play now";

  return (
    <article className={`group overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-950/30 ${className}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-violet-950 to-slate-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={gameName}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            {icon}
          </div>
        )}

        {featured && (
          <div className="absolute left-3 top-3">
            <Badge variant="warning">Featured</Badge>
          </div>
        )}

        {showCategory && (
          <div className="absolute bottom-3 left-3">
            <Badge variant={categoryStyles[category] || "default"}>
              {category.replaceAll("-", " ")}
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold text-white">
            {gameName}
          </h3>

          <Badge size="sm">{difficulty}</Badge>
        </div>

        {description && (
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">
            {description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">
            👥 {playerText}
          </span>

          {onPlay ? (
            <button
              type="button"
              onClick={() => onPlay(game)}
              className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
            >
              Play
            </button>
          ) : (
            <Link
              to={routeId ? `/games/${routeId}` : "/games"}
              className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-500"
            >
              Play
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default GameCard;
