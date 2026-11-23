const normalizePoints = (value) => {
  const points = Number(value);

  if (!Number.isFinite(points) || points < 0) {
    throw new Error("Score must be a non-negative number.");
  }

  return Math.floor(points);
};

export const calculateGameScore = ({
  basePoints = 0,
  bonusPoints = 0,
  penaltyPoints = 0,
  multiplier = 1,
}) => {
  const base = normalizePoints(basePoints);
  const bonus = normalizePoints(bonusPoints);
  const penalty = normalizePoints(penaltyPoints);

  const safeMultiplier = Number(multiplier);

  if (
    !Number.isFinite(safeMultiplier) ||
    safeMultiplier < 0 ||
    safeMultiplier > 10
  ) {
    throw new Error("Invalid score multiplier.");
  }

  return Math.max(
    0,
    Math.floor((base + bonus - penalty) * safeMultiplier)
  );
};

export const calculateWinner = (scores) => {
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    throw new Error("Invalid scores.");
  }

  const entries = Object.entries(scores);

  if (!entries.length) {
    throw new Error("No player scores available.");
  }

  const normalized = entries.map(([userId, score]) => ({
    userId,
    score: normalizePoints(score),
  }));

  const highest = Math.max(...normalized.map((item) => item.score));

  const winners = normalized
    .filter((item) => item.score === highest)
    .map((item) => item.userId);

  return {
    winner: winners.length === 1 ? winners[0] : null,
    isDraw: winners.length > 1,
    highestScore: highest,
    winners,
  };
};

export const calculateRankings = (scores) => {
  if (!scores || typeof scores !== "object" || Array.isArray(scores)) {
    throw new Error("Invalid scores.");
  }

  const entries = Object.entries(scores).map(([userId, score]) => ({
    userId,
    score: normalizePoints(score),
  }));

  entries.sort((a, b) => b.score - a.score);

  let previousScore = null;
  let currentRank = 0;

  return entries.map((entry, index) => {
    if (entry.score !== previousScore) {
      currentRank = index + 1;
      previousScore = entry.score;
    }

    return {
      ...entry,
      rank: currentRank,
    };
  });
};

export const calculateAccuracy = (correct, total) => {
  const correctCount = Number(correct);
  const totalCount = Number(total);

  if (
    !Number.isInteger(correctCount) ||
    !Number.isInteger(totalCount) ||
    totalCount < 0 ||
    correctCount < 0 ||
    correctCount > totalCount
  ) {
    throw new Error("Invalid accuracy values.");
  }

  if (totalCount === 0) return 0;

  return Math.round((correctCount / totalCount) * 100);
};

export const calculateTimeBonus = ({
  remainingSeconds,
  maxBonus = 50,
}) => {
  const remaining = Number(remainingSeconds);
  const bonusLimit = normalizePoints(maxBonus);

  if (!Number.isFinite(remaining) || remaining < 0) {
    throw new Error("Invalid remaining time.");
  }

  return Math.min(Math.floor(remaining), bonusLimit);
};