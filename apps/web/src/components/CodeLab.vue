<template>
  <section>
    <h2>代码实验室</h2>
    <p class="note">只在 Node vm 沙箱里跑纯 JS，不给 require、process、文件和网络能力，超时 2 秒。</p>
    <div class="split">
      <div>
        <label>代码</label>
        <textarea v-model="code"></textarea>
        <p><button @click="run">运行</button></p>
      </div>
      <div>
        <label>输出</label>
        <pre>{{ output }}</pre>
        <label>错误</label>
        <pre>{{ error }}</pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { api } from "../lib/api";
import type { RunResult } from "@platform/shared";

const code = ref('console.log("Hello from personal-dev-platform");\nconsole.log(1 + 2);');
const output = ref("");
const error = ref("");

async function run() {
  try {
    const data = await api<RunResult>("/api/run-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.value }),
    });
    output.value = data.output || "(无输出)";
    error.value = data.error || "(无错误)";
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  }
}
</script>
