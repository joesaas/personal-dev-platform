import assert from "node:assert/strict";
import test from "node:test";
import { runJavaScript } from "./runner.js";

test("runs console.log output", () => {
  const result = runJavaScript(`console.log("Hello"); console.log(1 + 2);`);
  assert.equal(result.error, null);
  assert.equal(result.output, "Hello\n3");
});

test("returns error instead of throwing", () => {
  const result = runJavaScript(`throw new Error("boom");`);
  assert.equal(result.error, "boom");
});

test("sandbox has no require or process", () => {
  const typeofResult = runJavaScript(`console.log(typeof require);`);
  assert.equal(typeofResult.output, "undefined");
  const callResult = runJavaScript(`require("fs");`);
  assert.match(callResult.error ?? "", /require is not defined/);
});
