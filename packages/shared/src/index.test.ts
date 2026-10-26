import assert from "node:assert/strict";
import test from "node:test";
import { platformName } from "./index.js";

test("platformName returns the monorepo name", () => {
  assert.equal(platformName(), "personal-dev-platform");
});
