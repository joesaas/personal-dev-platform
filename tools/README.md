# tools/

仓库级脚本，不发布成包。

- `check-structure.mjs`：校验 `apps/`、`packages/` 的目录与 `package.json` 结构，根目录 `npm run check` 即跑它。
- 新脚本放这里，用 Node 标准库即可，不引入额外依赖。
