<template>
  <section>
    <h2>GitHub Demo 实验室</h2>
    <p class="note">只查询和展示，不自动 clone、安装或运行陌生仓库的代码。</p>
    <label>仓库（owner/repo 或完整链接）</label>
    <input v-model="input">
    <p><button @click="load">获取仓库信息</button></p>
    <div v-if="result" class="card">
      <h3>{{ result.repo.fullName }}</h3>
      <p>{{ result.repo.description || "(无描述)" }}</p>
      <p>星数 {{ result.repo.stars }} · 语言 {{ result.repo.language || "-" }} · 默认分支 {{ result.repo.defaultBranch }} · {{ result.repo.isPrivate ? "私有" : "公开" }}</p>
      <p>快速体验清单（只展示，不自动执行）：</p>
      <pre>git clone https://github.com/{{ result.repo.fullName }}.git
cd {{ result.repo.fullName.split("/")[1] }}</pre>
      <p>README 摘要：</p>
      <pre>{{ result.readme.slice(0, 2000) || "(无 README)" }}</pre>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { api } from "../lib/api";
import type { GithubResult } from "@platform/shared";

const input = ref("joesaas/personal-dev-platform");
const result = ref<GithubResult | null>(null);
const error = ref("");

async function load() {
  result.value = null;
  error.value = "";
  try {
    result.value = await api<GithubResult>(`/api/github?repo=${encodeURIComponent(input.value.trim())}`);
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}
</script>
