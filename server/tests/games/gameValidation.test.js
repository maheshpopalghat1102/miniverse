
import test from "node:test";
import assert from "node:assert/strict";

import * as gameValidator from "../../shared/gameValidator.js";

const requiredFunctions = [
  "validatePlayers",
  "validatePlayerMembership",
  "validateGameAction",
  "validateGameState",
  "validateRoomPlayers",
];

test("exports all required game validation functions", () => {
  for (const functionName of requiredFunctions) {
    assert.equal(
      typeof gameValidator[functionName],
      "function",
      `${functionName} must be exported`
    );
  }
});

test("rejects invalid player input", () => {
  assert.throws(() => {
    gameValidator.validatePlayers([]);
  });
});

test("rejects an invalid game state", () => {
  assert.throws(() => {
    gameValidator.validateGameState(null);
  });
});
