import assert from "node:assert/strict";
import test from "node:test";
import { platformName } from "@platform/shared";

test("example app can import the shared package", () => {
  assert.equal(platformName(), "personal-dev-platform");
});
