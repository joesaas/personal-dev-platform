import type { GithubResult, RepoInfo } from "@platform/shared";

export type { RepoInfo };

export function parseRepo(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim().replace(/\/$/, "").replace(/\.git$/, "");
  const urlMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };
  const shortMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2] };
  return null;
}

type FetchFn = (url: string, init?: Record<string, unknown>) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<Record<string, unknown>>;
  text: () => Promise<string>;
}>;

export async function fetchRepoInfo(
  fetchFn: FetchFn,
  owner: string,
  repo: string,
): Promise<GithubResult> {
  const infoRes = await fetchFn(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { "User-Agent": "personal-dev-platform", Accept: "application/vnd.github+json" },
  });
  if (!infoRes.ok) {
    if (infoRes.status === 404) throw new Error("仓库不存在，请检查 owner/repo 是否正确");
    if (infoRes.status === 403) throw new Error("GitHub API 限流或拒绝访问，稍后再试");
    throw new Error(`GitHub API 返回 ${infoRes.status}`);
  }
  const info = await infoRes.json();
  const readmeRes = await fetchFn(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: { "User-Agent": "personal-dev-platform", Accept: "application/vnd.github.raw" },
  });
  const readme = readmeRes.ok ? await readmeRes.text() : "";
  return {
    repo: {
      fullName: String(info.full_name ?? `${owner}/${repo}`),
      description: (info.description as string | null) ?? null,
      stars: Number(info.stargazers_count ?? 0),
      language: (info.language as string | null) ?? null,
      defaultBranch: String(info.default_branch ?? "main"),
      isPrivate: Boolean(info.private),
    },
    readme,
  };
}
