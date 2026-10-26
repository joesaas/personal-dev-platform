# packages/

多应用共用的共享库，每个包一个目录。

- `package.json` 的 `name` 用 `@platform/<名字>`。
- 只放确实多应用共用的东西，单个应用专用的代码留在那个应用里。
- 内部依赖走 workspace，不走已发布的版本号。
