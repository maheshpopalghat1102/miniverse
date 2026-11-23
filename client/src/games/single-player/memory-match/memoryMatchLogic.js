
export const MEMORY_MATCH_CONFIG = {
  PAIRS: 8,
  MISMATCH_DELAY: 900,
};

export const MEMORY_EMOJIS = [
  "🍎", "🍌", "🍇", "🍉",
  "🍓", "🍒", "🥝", "🍍",
  "🐶", "🐱", "🦊", "🐼",
  "🦁", "🐸", "🐵", "🐧",
  "⚽", "🏀", "🎮", "🎸",
  "🚀", "🚗", "✈️", "🚲",
];

export function shuffleArray(items) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i],
    ];
  }

  return shuffled;
}

export function createMemoryCards(pairCount = MEMORY_MATCH_CONFIG.PAIRS) {
  const selectedEmojis = shuffleArray(MEMORY_EMOJIS).slice(
    0,
    pairCount
  );

  const cards = selectedEmojis.flatMap((emoji, index) => [
    {
      id: `${index}-a`,
      pairId: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    },
    {
      id: `${index}-b`,
      pairId: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    },
  ]);

  return shuffleArray(cards);
}

export function createInitialMemoryState(pairCount = MEMORY_MATCH_CONFIG.PAIRS) {
  return {
    cards: createMemoryCards(pairCount),
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    mistakes: 0,
    score: 0,
    status: "ready",
    startedAt: null,
    completedAt: null,
    isChecking: false,
  };
}

export function startMemoryGame(state) {
  if (state.status !== "ready") return state;

  return {
    ...state,
    status: "playing",
    startedAt: Date.now(),
  };
}

export function flipMemoryCard(state, cardId) {
  if (state.status !== "playing") return state;
  if (state.isChecking) return state;

  const card = state.cards.find((item) => item.id === cardId);

  if (!card || card.isMatched || card.isFlipped) {
    return state;
  }

  if (state.flippedCards.length >= 2) {
    return state;
  }

  const nextCards = state.cards.map((item) =>
    item.id === cardId
      ? { ...item, isFlipped: true }
      : item
  );

  const nextFlipped = [...state.flippedCards, cardId];

  return {
    ...state,
    cards: nextCards,
    flippedCards: nextFlipped,
    status: "playing",
  };
}

export function checkMemoryMatch(state) {
  if (state.flippedCards.length !== 2 || state.isChecking) {
    return {
      state,
      result: "waiting",
    };
  }

  const [firstId, secondId] = state.flippedCards;

  const firstCard = state.cards.find(
    (card) => card.id === firstId
  );

  const secondCard = state.cards.find(
    (card) => card.id === secondId
  );

  if (!firstCard || !secondCard) {
    return {
      state,
      result: "invalid",
    };
  }

  const nextMoves = state.moves + 1;

  if (firstCard.pairId === secondCard.pairId) {
    const nextMatchedPairs = state.matchedPairs + 1;

    const nextCards = state.cards.map((card) =>
      card.id === firstId || card.id === secondId
        ? {
            ...card,
            isMatched: true,
            isFlipped: true,
          }
        : card
    );

    const isComplete =
      nextMatchedPairs === state.cards.length / 2;

    const nextState = {
      ...state,
      cards: nextCards,
      flippedCards: [],
      matchedPairs: nextMatchedPairs,
      moves: nextMoves,
      score: state.score + 100,
      status: isComplete ? "completed" : "playing",
      completedAt: isComplete ? Date.now() : null,
    };

    return {
      state: nextState,
      result: "match",
    };
  }

  return {
    state: {
      ...state,
      moves: nextMoves,
      mistakes: state.mistakes + 1,
      isChecking: true,
    },
    result: "mismatch",
  };
}

export function hideUnmatchedCards(state) {
  if (!state.isChecking) return state;

  const unmatchedIds = state.flippedCards;

  return {
    ...state,
    cards: state.cards.map((card) =>
      unmatchedIds.includes(card.id)
        ? { ...card, isFlipped: false }
        : card
    ),
    flippedCards: [],
    isChecking: false,
  };
}

export function resetMemoryGame(pairCount = MEMORY_MATCH_CONFIG.PAIRS) {
  return createInitialMemoryState(pairCount);
}

export function getMemoryAccuracy(moves, matchedPairs) {
  if (moves === 0) return 100;

  return Math.round((matchedPairs / moves) * 100);
}

export function getMemoryElapsedSeconds(startedAt, completedAt) {
  if (!startedAt) return 0;

  const end = completedAt || Date.now();

  return Math.max(0, Math.floor((end - startedAt) / 1000));
}

export function formatMemoryTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}
