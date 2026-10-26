import vm from "node:vm";

export interface RunResult {
  output: string;
  error: string | null;
}

function formatArg(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

export function runJavaScript(code: string): RunResult {
  const lines: string[] = [];
  const context = vm.createContext({
    console: {
      log: (...args: unknown[]) => {
        lines.push(args.map(formatArg).join(" "));
      },
    },
  });
  try {
    vm.runInNewContext(code, context, { timeout: 2000 });
    return { output: lines.join("\n"), error: null };
  } catch (err) {
    // vm 里的 Error 与主 realm 的 Error 不是同一个类，不能只用 instanceof 判断。
    const message =
      err !== null && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);
    return { output: lines.join("\n"), error: message };
  }
}
