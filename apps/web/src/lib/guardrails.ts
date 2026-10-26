export interface GuardrailRules {
  blockedWords: string[];
  inPattern: string;
  outPattern: string;
  maxLength: number;
  requireJson: boolean;
}

export interface GuardrailCheck {
  name: string;
  pass: boolean;
  detail: string;
}

export function checkRules(kind: "输入" | "输出", text: string, rules: GuardrailRules): GuardrailCheck[] {
  const out: GuardrailCheck[] = [];
  if (rules.blockedWords.length) {
    const hit = rules.blockedWords.find((w) => text.includes(w));
    out.push({ name: `${kind}禁词`, pass: !hit, detail: hit ? `命中禁词：${hit}` : "未命中禁词" });
  }
  const pattern = kind === "输入" ? rules.inPattern : rules.outPattern;
  if (pattern) {
    try {
      const hit = new RegExp(pattern).test(text);
      out.push({ name: `${kind}禁止模式`, pass: !hit, detail: hit ? `命中模式：${pattern}` : "未命中模式" });
    } catch {
      out.push({ name: `${kind}禁止模式`, pass: false, detail: `正则无效：${pattern}` });
    }
  }
  if (kind === "输出") {
    if (rules.maxLength) out.push({ name: "输出长度", pass: text.length <= rules.maxLength, detail: `长度 ${text.length} / 上限 ${rules.maxLength}` });
    if (rules.requireJson) {
      try {
        JSON.parse(text);
        out.push({ name: "输出为 JSON", pass: true, detail: "可解析为 JSON" });
      } catch {
        out.push({ name: "输出为 JSON", pass: false, detail: "不是合法 JSON" });
      }
    }
  }
  return out;
}
