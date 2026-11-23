
import React from "react";

const PlayerTurn = ({
  players = [],
  currentPlayerId,
  round = 1,
  completedTurns = 0,
}) => {
  const currentPlayer = players.find(
    (player) => player.id === currentPlayerId
  );

  if (!currentPlayer) {
    return (
      <div className="td-player-turn td-player-turn-empty">
        <span>👥</span>
        <p>Waiting for players...</p>
      </div>
    );
  }

  return (
    <section className="td-player-turn">
      <div className="td-turn-info">
        <span className="td-turn-label">CURRENT TURN</span>
        <h2>{currentPlayer.name}</h2>
        <p>It's your turn to choose Truth or Dare!</p>
      </div>

      <div className="td-turn-avatar">
        {currentPlayer.avatar ? (
          <img
            src={currentPlayer.avatar}
            alt={currentPlayer.name}
          />
        ) : (
          <span>
            {currentPlayer.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="td-turn-stats">
        <div>
          <strong>{round}</strong>
          <span>Round</span>
        </div>

        <div>
          <strong>{completedTurns}</strong>
          <span>Completed turns</span>
        </div>

        <div>
          <strong>{players.length}</strong>
          <span>Players</span>
        </div>
      </div>
    </section>
  );
};

export default PlayerTurn;
