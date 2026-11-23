
import test, { before } from "node:test";
import assert from "node:assert/strict";

process.env.JWT_ACCESS_SECRET ||= "test_access_secret_miniverse_123456789";
process.env.JWT_REFRESH_SECRET ||= "test_refresh_secret_miniverse_123456789";
process.env.JWT_ACCESS_TTL = "15m";
process.env.JWT_REFRESH_TTL = "7d";

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
} = await import("../../utils/token.js");

before(() => {
  assert.ok(process.env.JWT_ACCESS_SECRET);
  assert.ok(process.env.JWT_REFRESH_SECRET);
});

test("generates and verifies an access token", () => {
  const token = generateAccessToken({
    userId: "507f1f77bcf86cd799439011",
    username: "player_one",
    role: "user",
  });

  const decoded = verifyAccessToken(token);

  assert.equal(decoded.sub, "507f1f77bcf86cd799439011");
  assert.equal(decoded.username, "player_one");
  assert.equal(decoded.role, "user");
});

test("rejects an invalid access token", () => {
  assert.throws(() => {
    verifyAccessToken("invalid.token.value");
  });
});

test("generates and verifies a refresh token", () => {
  const token = generateRefreshToken({
    userId: "507f1f77bcf86cd799439011",
    familyId: "test-family",
  });

  const decoded = verifyRefreshToken(token);

  assert.equal(decoded.sub, "507f1f77bcf86cd799439011");
  assert.equal(decoded.familyId, "test-family");
  assert.equal(decoded.tokenType, "refresh");
});

test("generates a random verification token", () => {
  const token = generateRandomToken(32);

  assert.equal(token.length, 64);
  assert.match(token, /^[a-f0-9]+$/);
});

test("hashes tokens consistently", () => {
  const first = hashToken("example-token");
  const second = hashToken("example-token");

  assert.equal(first, second);
  assert.notEqual(first, "example-token");
});

test("different tokens produce different hashes", () => {
  assert.notEqual(
    hashToken("token-one"),
    hashToken("token-two")
  );
});
