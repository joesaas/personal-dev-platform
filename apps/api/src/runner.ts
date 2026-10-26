import vm from "node:vm";
import type { RunResult } from "@platform/shared";

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
    const message =
      err !== null && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : String(err);
    return { output: lines.join("\n"), error: message };
  }
}
