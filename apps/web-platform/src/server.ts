import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createSessionToken, parseSessionCookie, verifyPassword } from "./auth.js";
import { runJavaScript } from "./runner.js";
import { fetchRepoInfo, parseRepo } from "./github.js";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "..", "public");
const port = Number(process.env.PORT ?? 3000);
const username = process.env.DEV_PLATFORM_USER ?? "li";
const password = process.env.DEV_PLATFORM_PASSWORD ?? (() => {
  const generated = randomBytes(16).toString("hex");
  console.log(`DEV_PLATFORM_PASSWORD is not set. One-time password for this run only: ${generated}`);
  console.log(`Login as ${username} with that password. Set DEV_PLATFORM_PASSWORD to use a stable password.`);
  return generated;
})();

const sessions = new Map<string, string>();

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 200 * 1024) throw new Error("请求体过大");
    chunks.push(chunk as Buffer);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return {};
  return JSON.parse(text) as Record<string, unknown>;
}

function requireAuth(req: IncomingMessage): string | null {
  const token = parseSessionCookie(req.headers.cookie);
  if (!token) return null;
  return sessions.get(token) ?? null;
}

const staticFiles: Record<string, string> = {
  "/": "index.html",
  "/index.html": "index.html",
  "/app.js": "app.js",
  "/style.css": "style.css",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost`);
    const path = url.pathname;

    if (req.method === "GET" && path in staticFiles) {
      const file = await readFile(join(publicDir, staticFiles[path]), "utf8");
      const type = path.endsWith(".css") ? "text/css" : path.endsWith(".js") ? "text/javascript" : "text/html";
      res.writeHead(200, { "Content-Type": `${type}; charset=utf-8` });
      res.end(file);
      return;
    }

    if (req.method === "POST" && path === "/api/login") {
      const body = await readJson(req);
      if (body.username === username && typeof body.password === "string" && verifyPassword(body.password, password)) {
        const token = createSessionToken();
        sessions.set(token, username);
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Set-Cookie": `dev-platform-session=${token}; HttpOnly; SameSite=Lax; Path=/`,
        });
        res.end(JSON.stringify({ ok: true, user: username }));
      } else {
        sendJson(res, 401, { ok: false, error: "用户名或密码不对" });
      }
      return;
    }

    if (req.method === "POST" && path === "/api/logout") {
      const token = parseSessionCookie(req.headers.cookie);
      if (token) sessions.delete(token);
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": "dev-platform-session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
      });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    const user = requireAuth(req);
    if (!user) {
      sendJson(res, 401, { ok: false, error: "未登录" });
      return;
    }

    if (req.method === "GET" && path === "/api/me") {
      sendJson(res, 200, { ok: true, user });
      return;
    }

    if (req.method === "POST" && path === "/api/run-code") {
      const body = await readJson(req);
      if (typeof body.code !== "string" || body.code.trim() === "") {
        sendJson(res, 400, { ok: false, error: "代码不能为空" });
        return;
      }
      const result = runJavaScript(body.code);
      sendJson(res, 200, { ok: true, ...result });
      return;
    }

    if (req.method === "GET" && path === "/api/github") {
      const parsed = parseRepo(url.searchParams.get("repo") ?? "");
      if (!parsed) {
        sendJson(res, 400, { ok: false, error: "请输入 owner/repo 或完整 GitHub 仓库链接" });
        return;
      }
      try {
        const result = await fetchRepoInfo(fetch as never, parsed.owner, parsed.repo);
        sendJson(res, 200, { ok: true, ...result });
      } catch (err) {
        const message = err instanceof Error ? err.message : "GitHub 查询失败";
        const status = message.includes("不存在") ? 404 : 502;
        sendJson(res, status, { ok: false, error: message });
      }
      return;
    }

    sendJson(res, 404, { ok: false, error: "接口不存在" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "服务器错误";
    sendJson(res, 500, { ok: false, error: message });
  }
});

server.listen(port, () => {
  console.log(`Personal dev platform listening on http://localhost:${port}`);
});
