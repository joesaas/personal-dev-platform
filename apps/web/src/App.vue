<template>
  <header>
    <h1>个人开发平台</h1>
    <div v-if="user">
      <span>{{ user }}</span>
      <button class="secondary" @click="logout">退出</button>
    </div>
  </header>

  <div v-if="!user" class="card" style="max-width:420px;margin:40px auto">
    <h2>登录</h2>
    <p class="note">只给 li 自己用。口令来自服务器环境变量，未设置时看服务器启动日志里的一次性口令。</p>
    <label>用户名</label><input v-model="loginUser">
    <label>密码</label><input v-model="loginPass" type="password">
    <p><button @click="login">登录</button></p>
    <p v-if="loginError" class="error">{{ loginError }}</p>
  </div>

  <div v-else class="layout">
    <nav>
      <button :class="{ active: lab === 'code' }" @click="lab = 'code'">代码实验室</button>
      <button :class="{ active: lab === 'openrouter' }" @click="lab = 'openrouter'">OpenRouter Guardrails 实验室</button>
      <button :class="{ active: lab === 'github' }" @click="lab = 'github'">GitHub Demo 实验室</button>
    </nav>
    <main>
      <CodeLab v-if="lab === 'code'" />
      <OpenRouterLab v-if="lab === 'openrouter'" />
      <GitHubLab v-if="lab === 'github'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { api } from "./lib/api";
import CodeLab from "./components/CodeLab.vue";
import OpenRouterLab from "./components/OpenRouterLab.vue";
import GitHubLab from "./components/GitHubLab.vue";

const user = ref("");
const lab = ref<"code" | "openrouter" | "github">("code");
const loginUser = ref("li");
const loginPass = ref("");
const loginError = ref("");

async function login() {
  loginError.value = "";
  try {
    const data = await api<{ user: string }>("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginUser.value, password: loginPass.value }),
    });
    user.value = data.user;
  } catch (e) {
    loginError.value = e instanceof Error ? e.message : String(e);
  }
}

async function logout() {
  await api("/api/logout", { method: "POST" }).catch(() => {});
  user.value = "";
}

onMounted(async () => {
  try {
    const data = await api<{ user: string }>("/api/me");
    user.value = data.user;
  } catch {
    user.value = "";
  }
});
</script>
