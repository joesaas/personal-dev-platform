export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `请求失败 ${res.status}`);
  return data as T;
}
