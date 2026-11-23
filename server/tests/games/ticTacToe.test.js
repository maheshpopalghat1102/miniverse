
import test from "node:test";
import assert from "node:assert/strict";

import * as ticTacToe from "../../games/multiplayer/ticTacToeEngine.js";

const players = ["player1", "player2"];

test("creates a new Tic Tac Toe game", () => {
  const state = ticTacToe.createInitialState(players);

  assert.ok(state);
  assert.equal(typeof state, "object");
  assert.ok(Array.isArray(state.board));
  assert.equal(state.board.length, 9);
});

test("allows a player to make a valid move", () => {
  const state = ticTacToe.createInitialState(players);

  const updatedState = ticTacToe.applyAction(
    state,
    "player1",
    { index: 0 }
  );

  assert.notEqual(updatedState, null);
  assert.notEqual(updatedState, undefined);
  assert.notDeepEqual(updatedState.board, state.board);
});

test("rejects a move outside the board", () => {
  const state = ticTacToe.createInitialState(players);

  assert.throws(() => {
    ticTacToe.applyAction(state, "player1", { index: 10 });
  });
});

test("rejects a move in an occupied cell", () => {
  const state = ticTacToe.createInitialState(players);

  const updatedState = ticTacToe.applyAction(
    state,
    "player1",
    { index: 0 }
  );

  assert.throws(() => {
    ticTacToe.applyAction(updatedState, "player2", { index: 0 });
  });
});

test("returns a public game state", () => {
  const state = ticTacToe.createInitialState(players);
  const publicState = ticTacToe.getPublicState(state);

  assert.ok(publicState);
  assert.equal(typeof publicState, "object");
});

test("detects a completed winning game", () => {
  let state = ticTacToe.createInitialState(players);

  state = ticTacToe.applyAction(state, "player1", { index: 0 });
  state = ticTacToe.applyAction(state, "player2", { index: 3 });
  state = ticTacToe.applyAction(state, "player1", { index: 1 });
  state = ticTacToe.applyAction(state, "player2", { index: 4 });
  state = ticTacToe.applyAction(state, "player1", { index: 2 });

  assert.equal(ticTacToe.isFinished(state), true);
});
