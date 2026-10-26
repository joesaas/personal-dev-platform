import assert from "node:assert/strict";
import test from "node:test";
import { fetchRepoInfo, parseRepo } from "./github.js";

test("parses owner/repo and full URL", () => {
  assert.deepEqual(parseRepo("joesaas/personal-dev-platform"), { owner: "joesaas", repo: "personal-dev-platform" });
  assert.deepEqual(parseRepo("https://github.com/joesaas/personal-dev-platform.git"), { owner: "joesaas", repo: "personal-dev-platform" });
  assert.equal(parseRepo("not-a-repo"), null);
});

test("returns readable error on 404 without network", async () => {
  const fakeFetch = async () => ({ ok: false, status: 404, json: async () => ({}), text: async () => "" });
  await assert.rejects(() => fetchRepoInfo(fakeFetch as never, "no", "such-repo"), /仓库不存在/);
});
