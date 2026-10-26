async function api(path, options) {
  const res = await fetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || ("请求失败 " + res.status));
  return data;
}

function showApp(user) {
  document.getElementById("login-view").style.display = "none";
  document.getElementById("app-view").style.display = "block";
  document.getElementById("user-area").style.display = "block";
  document.getElementById("user-name").textContent = user;
}
function showLogin() {
  document.getElementById("login-view").style.display = "block";
  document.getElementById("app-view").style.display = "none";
  document.getElementById("user-area").style.display = "none";
}

document.querySelectorAll("nav button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("nav button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".lab").forEach((s) => s.classList.remove("active"));
    document.getElementById("lab-" + btn.dataset.lab).classList.add("active");
  });
});

document.getElementById("login-btn").addEventListener("click", async () => {
  try {
    const data = await api("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: document.getElementById("login-user").value, password: document.getElementById("login-pass").value }) });
    showApp(data.user);
  } catch (e) { document.getElementById("login-error").textContent = e.message; }
});
document.getElementById("logout-btn").addEventListener("click", async () => { await api("/api/logout", { method: "POST" }).catch(() => {}); showLogin(); });

document.getElementById("run-btn").addEventListener("click", async () => {
  try {
    const data = await api("/api/run-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: document.getElementById("code-input").value }) });
    document.getElementById("code-output").textContent = data.output || "(无输出)";
    document.getElementById("code-error").textContent = data.error || "(无错误)";
  } catch (e) { document.getElementById("code-error").textContent = e.message; }
});

function checkRules(kind, text, rules) {
  const out = [];
  if (rules.blockedWords.length) {
    const hit = rules.blockedWords.find((w) => text.includes(w));
    out.push({ name: kind + "禁词", pass: !hit, detail: hit ? "命中禁词：" + hit : "未命中禁词" });
  }
  const pattern = kind === "输入" ? rules.inPattern : rules.outPattern;
  if (pattern) {
    try { const hit = new RegExp(pattern).test(text); out.push({ name: kind + "禁止模式", pass: !hit, detail: hit ? "命中模式：" + pattern : "未命中模式" }); }
    catch { out.push({ name: kind + "禁止模式", pass: false, detail: "正则无效：" + pattern }); }
  }
  if (kind === "输出") {
    if (rules.maxLength) out.push({ name: "输出长度", pass: text.length <= rules.maxLength, detail: "长度 " + text.length + " / 上限 " + rules.maxLength });
    if (rules.requireJson) { try { JSON.parse(text); out.push({ name: "输出为 JSON", pass: true, detail: "可解析为 JSON" }); } catch { out.push({ name: "输出为 JSON", pass: false, detail: "不是合法 JSON" }); } }
  }
  return out;
}
function renderRules(rules) {
  document.getElementById("or-rules").innerHTML = rules.map((r) => `<div class="rule ${r.pass ? "pass" : "fail"}">${r.pass ? "通过" : "拦截"}：${r.name} — ${r.detail}</div>`).join("");
}

document.getElementById("or-send").addEventListener("click", async () => {
  const key = document.getElementById("or-key").value.trim();
  if (key) localStorage.setItem("or-key", key);
  const rules = { blockedWords: document.getElementById("or-blocked").value.split(",").map((s) => s.trim()).filter(Boolean), inPattern: document.getElementById("or-in-pattern").value.trim(), outPattern: document.getElementById("or-out-pattern").value.trim(), maxLength: Number(document.getElementById("or-max").value) || 0, requireJson: document.getElementById("or-json").checked };
  const userText = document.getElementById("or-user").value;
  const inputRules = checkRules("输入", userText, rules);
  renderRules(inputRules);
  if (inputRules.some((r) => !r.pass)) { document.getElementById("or-output").textContent = "输入 Guardrails 未通过，已拦截，未发送 OpenRouter 请求。"; return; }
  if (!key) { document.getElementById("or-output").textContent = "请先填写 OpenRouter API Key。"; return; }
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + key, "HTTP-Referer": location.origin, "X-Title": "personal-dev-platform" }, body: JSON.stringify({ model: document.getElementById("or-model").value.trim(), messages: [{ role: "system", content: document.getElementById("or-system").value }, { role: "user", content: userText }] }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || ("OpenRouter 返回 " + res.status));
    const output = data.choices?.[0]?.message?.content ?? "";
    const outputRules = checkRules("输出", output, rules);
    renderRules([...inputRules, ...outputRules]);
    document.getElementById("or-output").textContent = output;
  } catch (e) { document.getElementById("or-output").textContent = "调用失败：" + e.message; }
});
const savedKey = localStorage.getItem("or-key");
if (savedKey) document.getElementById("or-key").value = savedKey;

document.getElementById("gh-btn").addEventListener("click", async () => {
  const box = document.getElementById("gh-result");
  try {
    const data = await api("/api/github?repo=" + encodeURIComponent(document.getElementById("gh-input").value.trim()));
    const readme = (data.readme || "").slice(0, 2000);
    box.innerHTML = `<div class="card"><h3>${data.repo.fullName}</h3><p>${data.repo.description || "(无描述)"}</p><p>星数 ${data.repo.stars} · 语言 ${data.repo.language || "-"} · 默认分支 ${data.repo.defaultBranch} · ${data.repo.isPrivate ? "私有" : "公开"}</p><p>快速体验清单（只展示，不自动执行）：</p><pre>git clone https://github.com/${data.repo.fullName}.git
cd ${data.repo.fullName.split("/")[1]}</pre><p>README 摘要：</p><pre>${readme.replace(/</g, "&lt;") || "(无 README)"}</pre></div>`;
  } catch (e) { box.innerHTML = `<p class="error">${e.message}</p>`; }
});

api("/api/me").then((d) => showApp(d.user)).catch(() => showLogin());
