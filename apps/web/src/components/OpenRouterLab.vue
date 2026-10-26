<template>
  <section>
    <h2>OpenRouter Guardrails 实验室</h2>
    <p class="note">本实验室实现的是围绕 OpenRouter 调用的 Guardrails 检查，不是已核实的 OpenRouter 官方 Guardrails 产品。API Key 只存在你的浏览器 localStorage，不发给本平台服务器。</p>
    <label>API Key</label><input v-model="key" type="password" placeholder="sk-or-...">
    <label>模型</label><input v-model="model">
    <label>系统提示</label><textarea v-model="systemPrompt" style="min-height:80px"></textarea>
    <label>用户提示</label><textarea v-model="userText" style="min-height:80px"></textarea>
    <label>禁词（逗号分隔）</label><input v-model="blocked" placeholder="例如：密码, 密钥">
    <label>输入禁止模式（正则，可选）</label><input v-model="inPattern" placeholder="例如：\d{11}">
    <label>输出禁止模式（正则，可选）</label><input v-model="outPattern">
    <label>输出最长字数</label><input v-model.number="maxLength" type="number">
    <label><input v-model="requireJson" type="checkbox" style="width:auto"> 输出必须为 JSON</label>
    <p><button @click="send">发送并检查</button></p>
    <h3>Guardrails 检查</h3>
    <div>
      <div v-for="r in rules" :key="r.name" class="rule" :class="r.pass ? 'pass' : 'fail'">{{ r.pass ? "通过" : "拦截" }}：{{ r.name }} — {{ r.detail }}</div>
    </div>
    <h3>模型输出</h3>
    <pre>{{ output }}</pre>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { checkRules, type GuardrailCheck, type GuardrailRules } from "../lib/guardrails";

const key = ref(localStorage.getItem("or-key") ?? "");
const model = ref("openai/gpt-4o-mini");
const systemPrompt = ref("You are a helpful assistant.");
const userText = ref("用一句话介绍 TypeScript。");
const blocked = ref("");
const inPattern = ref("");
const outPattern = ref("");
const maxLength = ref(500);
const requireJson = ref(false);
const rules = ref<GuardrailCheck[]>([]);
const output = ref("");

function currentRules(): GuardrailRules {
  return {
    blockedWords: blocked.value.split(",").map((s) => s.trim()).filter(Boolean),
    inPattern: inPattern.value.trim(),
    outPattern: outPattern.value.trim(),
    maxLength: maxLength.value || 0,
    requireJson: requireJson.value,
  };
}

async function send() {
  const k = key.value.trim();
  if (k) localStorage.setItem("or-key", k);
  const r = currentRules();
  const inputRules = checkRules("输入", userText.value, r);
  rules.value = inputRules;
  if (inputRules.some((x) => !x.pass)) {
    output.value = "输入 Guardrails 未通过，已拦截，未发送 OpenRouter 请求。";
    return;
  }
  if (!k) {
    output.value = "请先填写 OpenRouter API Key。";
    return;
  }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${k}`,
        "HTTP-Referer": location.origin,
        "X-Title": "personal-dev-platform",
      },
      body: JSON.stringify({
        model: model.value.trim(),
        messages: [
          { role: "system", content: systemPrompt.value },
          { role: "user", content: userText.value },
        ],
      }),
    });
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
    if (!res.ok) throw new Error(data.error?.message || `OpenRouter 返回 ${res.status}`);
    const text = data.choices?.[0]?.message?.content ?? "";
    rules.value = [...inputRules, ...checkRules("输出", text, r)];
    output.value = text;
  } catch (e) {
    output.value = `调用失败：${e instanceof Error ? e.message : String(e)}`;
  }
}
</script>
