
import test from "node:test";
import assert from "node:assert/strict";

import * as socketEvents from "../../sockets/socketEvents.js";

test("socket event module exports its registration function", () => {
  assert.equal(
    typeof socketEvents.registerSocketEvents,
    "function",
    "registerSocketEvents must be exported"
  );
});
