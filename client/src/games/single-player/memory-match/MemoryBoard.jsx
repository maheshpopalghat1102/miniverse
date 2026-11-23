
import React from "react";
import MemoryCard from "./MemoryCard";

function MemoryBoard({
  cards = [],
  onCardClick,
  disabled = false,
}) {
  return (
    <div
      className="memory-board"
      role="group"
      aria-label="Memory matching cards"
    >
      {cards.map((card) => (
        <MemoryCard
          key={card.id}
          card={card}
          onClick={onCardClick}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export default MemoryBoard;
