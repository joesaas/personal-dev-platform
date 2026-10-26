import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const failures = [];

function checkDir(dir) {
  let entries;
  try {
    entries = readdirSync(join(root, dir), { withFileTypes: true });
  } catch {
    failures.push(`missing directory: ${dir}/`);
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgPath = join(root, dir, entry.name, "package.json");
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      if (!pkg.name?.startsWith("@platform/")) {
        failures.push(`${dir}/${entry.name}: package name must start with @platform/`);
      }
    } catch {
      failures.push(`missing or invalid: ${dir}/${entry.name}/package.json`);
    }
  }
}

for (const dir of ["apps", "packages", "docs", "tools"]) {
  try {
    statSync(join(root, dir));
  } catch {
    failures.push(`missing directory: ${dir}/`);
  }
}
checkDir("apps");
checkDir("packages");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("structure ok");
