export interface ApiResult {
  ok: boolean;
  error?: string;
}

export interface RunResult {
  output: string;
  error: string | null;
}

export interface RepoInfo {
  fullName: string;
  description: string | null;
  stars: number;
  language: string | null;
  defaultBranch: string;
  isPrivate: boolean;
}

export interface GithubResult {
  repo: RepoInfo;
  readme: string;
}
