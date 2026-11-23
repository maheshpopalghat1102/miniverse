
export const SNAKE_CONFIG = {
  GRID_SIZE: 20,
  INITIAL_LENGTH: 3,
  INITIAL_SPEED: 150,
  MIN_SPEED: 55,
  SPEED_INCREMENT: 4,
  POINTS_PER_FOOD: 10,
};

export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export function getOppositeDirection(direction) {
  return {
    x: -direction.x,
    y: -direction.y,
  };
}

export function isOppositeDirection(current, next) {
  return (
    current.x === -next.x &&
    current.y === -next.y
  );
}

export function createInitialSnake() {
  const center = Math.floor(SNAKE_CONFIG.GRID_SIZE / 2);

  return [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
}

export function createFood(snake) {
  const availableCells = [];

  for (let y = 0; y < SNAKE_CONFIG.GRID_SIZE; y += 1) {
    for (let x = 0; x < SNAKE_CONFIG.GRID_SIZE; x += 1) {
      const occupied = snake.some(
        (segment) => segment.x === x && segment.y === y
      );

      if (!occupied) {
        availableCells.push({ x, y });
      }
    }
  }

  if (!availableCells.length) return null;

  const index = Math.floor(Math.random() * availableCells.length);

  return availableCells[index];
}

export function createInitialSnakeState() {
  const snake = createInitialSnake();

  return {
    snake,
    food: createFood(snake),
    direction: DIRECTIONS.RIGHT,
    nextDirection: DIRECTIONS.RIGHT,
    score: 0,
    status: "ready",
    speed: SNAKE_CONFIG.INITIAL_SPEED,
    foodEaten: 0,
    isNewRecord: false,
  };
}

export function changeSnakeDirection(state, direction) {
  if (!direction) return state;

  if (
    state.status === "game-over" ||
    state.status === "won"
  ) {
    return state;
  }

  if (isOppositeDirection(state.direction, direction)) {
    return state;
  }

  return {
    ...state,
    nextDirection: direction,
  };
}

export function moveSnake(state) {
  if (state.status !== "playing") return state;

  const direction = state.nextDirection || state.direction;
  const head = state.snake[0];

  const nextHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= SNAKE_CONFIG.GRID_SIZE ||
    nextHead.y >= SNAKE_CONFIG.GRID_SIZE;

  if (hitWall) {
    return {
      ...state,
      status: "game-over",
    };
  }

  const ateFood =
    state.food &&
    nextHead.x === state.food.x &&
    nextHead.y === state.food.y;

  const bodyToCheck = ateFood
    ? state.snake
    : state.snake.slice(0, -1);

  const hitSelf = bodyToCheck.some(
    (segment) =>
      segment.x === nextHead.x &&
      segment.y === nextHead.y
  );

  if (hitSelf) {
    return {
      ...state,
      status: "game-over",
    };
  }

  const nextSnake = [nextHead, ...state.snake];

  if (!ateFood) {
    nextSnake.pop();
  }

  const foodEaten = state.foodEaten + (ateFood ? 1 : 0);

  const nextScore =
    state.score +
    (ateFood ? SNAKE_CONFIG.POINTS_PER_FOOD : 0);

  const nextFood = ateFood
    ? createFood(nextSnake)
    : state.food;

  if (ateFood && !nextFood) {
    return {
      ...state,
      snake: nextSnake,
      food: null,
      direction,
      nextDirection: direction,
      score: nextScore,
      foodEaten,
      status: "won",
    };
  }

  const nextSpeed = Math.max(
    SNAKE_CONFIG.MIN_SPEED,
    SNAKE_CONFIG.INITIAL_SPEED -
      foodEaten * SNAKE_CONFIG.SPEED_INCREMENT
  );

  return {
    ...state,
    snake: nextSnake,
    food: nextFood,
    direction,
    nextDirection: direction,
    score: nextScore,
    foodEaten,
    speed: nextSpeed,
  };
}

export function startSnakeGame(state) {
  if (
    state.status !== "ready" &&
    state.status !== "paused"
  ) {
    return state;
  }

  return {
    ...state,
    status: "playing",
  };
}

export function pauseSnakeGame(state) {
  if (state.status !== "playing") return state;

  return {
    ...state,
    status: "paused",
  };
}

export function resumeSnakeGame(state) {
  if (state.status !== "paused") return state;

  return {
    ...state,
    status: "playing",
  };
}

export function resetSnakeGame() {
  return createInitialSnakeState();
}

export function getSnakeLevel(foodEaten) {
  return Math.floor(foodEaten / 5) + 1;
}

export function getSnakeBestScore(currentScore, bestScore) {
  return Math.max(currentScore, bestScore);
}
