
import test from "node:test";
import assert from "node:assert/strict";

import {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  needsPasswordRehash,
} from "../../utils/password.js";

test("hashes a password", async () => {
  const password = "MiniVerse@2026";
  const hashedPassword = await hashPassword(password);

  assert.notEqual(hashedPassword, password);
  assert.ok(hashedPassword.length > 20);
});

test("compares a correct password", async () => {
  const password = "MiniVerse@2026";
  const hashedPassword = await hashPassword(password);

  const result = await comparePassword(password, hashedPassword);

  assert.equal(result, true);
});

test("rejects an incorrect password", async () => {
  const hashedPassword = await hashPassword("MiniVerse@2026");

  const result = await comparePassword(
    "WrongPassword@123",
    hashedPassword
  );

  assert.equal(result, false);
});

test("rejects invalid password input", async () => {
  await assert.rejects(() => hashPassword("short"));

  assert.equal(
    await comparePassword(null, "invalid-hash"),
    false
  );
});

test("accepts a strong password", () => {
  const result = validatePasswordStrength("MiniVerse@2026");

  assert.equal(result.valid, true);
});

test("rejects a weak password", () => {
  const result = validatePasswordStrength("password");

  assert.equal(result.valid, false);
});

test("detects a password hash that needs rehashing", async () => {
  const password = "MiniVerse@2026";
  const hashedPassword = await hashPassword(password);

  assert.equal(
    await needsPasswordRehash(hashedPassword),
    false
  );
});

test("requests rehash for invalid hash input", async () => {
  assert.equal(await needsPasswordRehash("invalid"), true);
});
