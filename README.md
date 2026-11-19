# 海纳平台前端演示仓库

本仓库只放可公开演示的前端代码与虚构数据。SCC、PSI、PAY 各自独立构建，共用视觉规范，但不共用业务状态或接口权限。

| 子系统 | 前端目录 | 演示路径 | 当前状态 |
| --- | --- | --- | --- |
| SCC 供应链协同 | `scc-web/` | `/scc/` | 供应商信息管理可交互原型 |
| PSI 进销存管理 | `psi-web/` | `/psi/` | 预留入口 |
| PAY 支付服务 | `pay-web/` | `/pay/` | 预留入口 |

站点根路径 `/` 是演示入口页。SCC 使用哈希路由，例如 `/scc/#/login`，因此刷新业务页也能在静态托管平台上打开。后续子系统沿用独立路径；不把多个应用合成一个前端路由或复用本地状态。

## 构建与发布

```bash
pnpm install --frozen-lockfile
pnpm build
```

`dist/` 包含四个入口，可整体发布为静态站点。默认构建适用于站点根路径。GitHub Pages 使用项目路径 `/hainaZULG/`，构建命令为 `DEMO_BASE_PATH=/hainaZULG/ pnpm build`。仓库中的 `.github/workflows/pages.yml` 在推送 `main` 后构建并发布。首次使用需在仓库 Settings → Pages 中将 Source 设为 GitHub Actions；私有仓库发布 Pages 需要支持该功能的 GitHub 付费计划。发布后入口为 `https://unclevan.github.io/hainaZULG/`。

本仓库不包含 `../docs/` 文档仓库、旧 EDI 数据、OSS 凭证或后端代码。演示登录、短信、审核和附件均使用浏览器本地模拟数据。视觉约定见 [STYLE_GUIDE.md](STYLE_GUIDE.md)。
