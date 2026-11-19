# 海纳平台前端演示仓库

本仓库只放可公开演示的前端代码与虚构数据。V0.8 的 PSI 运营后台与 SCC 供应商门户使用同一页面源码构建两个独立静态入口，共用视觉规范和本地演示数据，角色登录入口相互隔离。正式系统的数据协同须由服务端鉴权接口实现。

| 子系统 | 前端目录 | 演示路径 | 当前状态 |
| --- | --- | --- | --- |
| SCC 供应链协同 | `scc-web/` | `/scc/` | 供应商门户，仅供应商主账号和子账号登录 |
| PSI 进销存管理 | `psi-web/`（原型共用 `scc-web/` 页面源码） | `/psi/` | 运营后台，业主管理、采购审核和财务人员登录 |
| PAY 支付服务 | `pay-web/` | `/pay/` | 预留入口 |

站点根路径 `/` 是演示入口页。两个前端都使用哈希路由，例如 `/scc/#/login` 和 `/psi/#/login`。前端演示共享浏览器中的虚构供应商数据，便于展示供应商提交后运营审核；会话和页签按入口分开。正式部署的两个域名待业主确认。

## 构建与发布

```bash
pnpm install --frozen-lockfile
pnpm build
```

`dist/` 包含四个入口，可整体发布为静态站点。默认构建适用于站点根路径。GitHub Pages 使用项目路径 `/hainaZULG/`，构建命令为 `DEMO_BASE_PATH=/hainaZULG/ pnpm build`。仓库中的 `.github/workflows/pages.yml` 在推送 `main` 后构建并发布。首次使用需在仓库 Settings → Pages 中将 Source 设为 GitHub Actions；私有仓库发布 Pages 需要支持该功能的 GitHub 付费计划。发布后入口为 `https://unclevan.github.io/hainaZULG/`。

本仓库不包含 `../docs/` 文档仓库、旧 EDI 数据、OSS 凭证或后端代码。演示登录、短信、审核和附件均使用浏览器本地模拟数据。视觉约定见 [STYLE_GUIDE.md](STYLE_GUIDE.md)。
