
import test from "node:test";
import assert from "node:assert/strict";

import {
  generateRoomCode,
  generateUniqueRoomCode,
} from "../../utils/generateRoomCode.js";

test("generates a six-character room code", () => {
  const code = generateRoomCode();

  assert.equal(code.length, 6);
});

test("generates room codes using allowed characters", () => {
  const code = generateRoomCode();

  assert.match(code, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
});

test("generates different room codes", () => {
  const codes = new Set();

  for (let i = 0; i < 100; i += 1) {
    codes.add(generateRoomCode());
  }

  assert.equal(codes.size, 100);
});

test("supports custom room code lengths", () => {
  assert.equal(generateRoomCode(8).length, 8);
  assert.equal(generateRoomCode(10).length, 10);
});

test("rejects invalid room code lengths", () => {
  assert.throws(() => generateRoomCode(3));
  assert.throws(() => generateRoomCode(20));
  assert.throws(() => generateRoomCode(5.5));
});

test("generates a unique room code when no duplicate exists", async () => {
  const fakeRoomModel = {
    exists: async () => null,
  };

  const code = await generateUniqueRoomCode(fakeRoomModel);

  assert.equal(code.length, 6);
});

test("retries when a room code already exists", async () => {
  let attempts = 0;

  const fakeRoomModel = {
    exists: async () => {
      attempts += 1;

      // Simulate one existing code, then an available code.
      return attempts === 1 ? { _id: "existing-room" } : null;
    },
  };

  const code = await generateUniqueRoomCode(fakeRoomModel);

  assert.equal(code.length, 6);
  assert.equal(attempts, 2);
});

test("throws when a Room model is not provided", async () => {
  await assert.rejects(() => generateUniqueRoomCode(null));
});
