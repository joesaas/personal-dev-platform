# apps/

可独立运行的应用，每个应用一个目录。

- 目录名即应用名，`package.json` 的 `name` 用 `@platform/<名字>`。
- 共享逻辑优先复用 `packages/`，不要在应用之间互相 import 源码。
- 示例 `example-app` 只证明骨架能跑通，第一个真实应用进来时可删可留。
