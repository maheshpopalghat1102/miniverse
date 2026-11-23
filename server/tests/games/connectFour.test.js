
import test from "node:test";
import assert from "node:assert/strict";

import * as connectFour from "../../games/multiplayer/connectFourEngine.js";

const players = ["player1", "player2"];

test("creates a Connect Four game", () => {
  const state = connectFour.createInitialState(players);

  assert.ok(state);
  assert.equal(typeof state, "object");
  assert.ok(Array.isArray(state.board));
});

test("allows a player to drop a piece into a valid column", () => {
  const state = connectFour.createInitialState(players);

  const updatedState = connectFour.applyAction(
    state,
    "player1",
    { column: 0 }
  );

  assert.ok(updatedState);
  assert.notDeepEqual(updatedState.board, state.board);
});

test("rejects an invalid column", () => {
  const state = connectFour.createInitialState(players);

  assert.throws(() => {
    connectFour.applyAction(state, "player1", { column: -1 });
  });
});

test("rejects a column outside the board", () => {
  const state = connectFour.createInitialState(players);

  assert.throws(() => {
    connectFour.applyAction(state, "player1", { column: 99 });
  });
});

test("returns a public game state", () => {
  const state = connectFour.createInitialState(players);
  const publicState = connectFour.getPublicState(state);

  assert.ok(publicState);
  assert.equal(typeof publicState, "object");
});
