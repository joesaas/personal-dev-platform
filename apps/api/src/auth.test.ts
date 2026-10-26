import assert from "node:assert/strict";
import test from "node:test";
import { parseSessionCookie, verifyPassword } from "./auth.js";

test("password check", () => {
  assert.equal(verifyPassword("secret", "secret"), true);
  assert.equal(verifyPassword("wrong", "secret"), false);
});

test("cookie parsing", () => {
  assert.equal(parseSessionCookie("dev-platform-session=abc123; other=x"), "abc123");
  assert.equal(parseSessionCookie(undefined), null);
});
