import express, { type NextFunction, type Request, type Response } from "express";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createSessionToken, parseSessionCookie, verifyPassword } from "./auth.js";
import { runJavaScript } from "./runner.js";
import { fetchRepoInfo, parseRepo } from "./github.js";

const here = dirname(fileURLToPath(import.meta.url));
const webDist = join(here, "..", "..", "web", "dist");
const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";
const username = process.env.DEV_PLATFORM_USER ?? "li";
const password = process.env.DEV_PLATFORM_PASSWORD ?? (() => {
  const generated = randomBytes(16).toString("hex");
  console.log(`DEV_PLATFORM_PASSWORD is not set. One-time password for this run only: ${generated}`);
  console.log(`Login as ${username} with that password. Set DEV_PLATFORM_PASSWORD to use a stable password.`);
  return generated;
})();

const sessions = new Map<string, string>();
const app = express();
app.use(express.json({ limit: "200kb" }));

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = parseSessionCookie(req.headers.cookie);
  const user = token ? sessions.get(token) : undefined;
  if (!user) {
    res.status(401).json({ ok: false, error: "未登录" });
    return;
  }
  (req as Request & { user: string }).user = user;
  next();
}

app.post("/api/login", (req, res) => {
  const { username: bodyUser, password: bodyPass } = req.body as Record<string, unknown>;
  if (bodyUser === username && typeof bodyPass === "string" && verifyPassword(bodyPass, password)) {
    const token = createSessionToken();
    sessions.set(token, username);
    res.setHeader("Set-Cookie", `dev-platform-session=${token}; HttpOnly; SameSite=Lax; Path=/`);
    res.json({ ok: true, user: username });
  } else {
    res.status(401).json({ ok: false, error: "用户名或密码不对" });
  }
});

app.post("/api/logout", (req, res) => {
  const token = parseSessionCookie(req.headers.cookie);
  if (token) sessions.delete(token);
  res.setHeader("Set-Cookie", "dev-platform-session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
  res.json({ ok: true });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ ok: true, user: (req as Request & { user: string }).user });
});

app.post("/api/run-code", requireAuth, (req, res) => {
  const { code } = req.body as Record<string, unknown>;
  if (typeof code !== "string" || code.trim() === "") {
    res.status(400).json({ ok: false, error: "代码不能为空" });
    return;
  }
  const result = runJavaScript(code);
  res.json({ ok: true, ...result });
});

app.get("/api/github", requireAuth, async (req, res) => {
  const parsed = parseRepo(String(req.query.repo ?? ""));
  if (!parsed) {
    res.status(400).json({ ok: false, error: "请输入 owner/repo 或完整 GitHub 仓库链接" });
    return;
  }
  try {
    const result = await fetchRepoInfo(fetch as never, parsed.owner, parsed.repo);
    res.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "GitHub 查询失败";
    const status = message.includes("不存在") ? 404 : 502;
    res.status(status).json({ ok: false, error: message });
  }
});

if (existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (_req, res) => {
    res.sendFile(join(webDist, "index.html"));
  });
}

app.listen(port, host, () => {
  console.log(`Personal dev platform API listening on http://${host}:${port}`);
  if (existsSync(webDist)) console.log(`Serving frontend from ${webDist}`);
});
