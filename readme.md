# Pica Library

一个本地优先的漫画收藏管理与增量下载工具。它保留原 `pica-cli` 的站内检索和下载能力，同时增加作者归一、Tag 筛选、热度排序、下载进度与可迁移的 Lite 网页。

> 当前版本：`2.0.0-alpha.1`。请只下载你有权访问和保存的内容，遵守服务条款、当地法律以及创作者的权利。

## 三种使用层次

| 层次 | 适合场景 | 数据位置 | 站内连接与下载 |
| --- | --- | --- | --- |
| GitHub Pages Lite | 临时整理、筛选、作者审核、生成计划 | 浏览器 IndexedDB | 不支持 |
| 本地网页完整版 | 日常管理、同步、搜索、下载 | 本地 SQLite 与文件系统 | 支持 |
| CLI | 批处理、NAS、脚本和自动化 | 本地 SQLite 与文件系统 | 支持 |

Lite 与完整版使用同一套网页。页面能访问本地 API 时自动进入完整版，否则进入 Lite 模式。Lite 可导出作者字典和下载计划，随后交给本地完整版执行。

## 第一版能力

- 导入收藏夹 CSV，或通过账号从站内同步收藏元数据。
- 将 `社团（作者）`、全半角和空白差异归一成作者候选；低置信度结果进入人工审核。
- 手动合并作者别名，并导入/导出可迁移的作者字典。
- 按作者、Tag、分类、完成状态筛选，按更新时间、爱心、浏览量或综合分排序。
- 站内关键词、Tag、分类搜索；搜索结果可直接交给下载器。
- 按漫画、章节和图片稳定 ID 记录进度；重复执行只补缺失图片。
- 对已有下载按规范作者和社团生成视图目录，不复制漫画文件。
- 保留原有 `pica-cli`、`pica-zip` 命令以兼容旧用法。

## 快速开始

需要 Node.js 22.5 或更高版本，推荐 Node.js 24。

```bash
git clone https://github.com/Saber-Alter-Lily/pica-cli.git
cd pica-cli
pnpm install
pnpm build
```

初始化并打开本地网页：

```bash
node dist/library-cli.js init
node dist/library-cli.js serve
```

浏览器打开 `http://127.0.0.1:4789`。服务默认只监听本机，不会把账号、数据库或漫画暴露到公网。

### 连接站内

复制 `.env.template` 为 `.env.local`，只在本地填写：

```dotenv
PICA_ACCOUNT=
PICA_PASSWORD=
PICA_PROXY=
PICA_DL_CONCURRENCY=5
```

随后可执行：

```bash
# 同步收藏元数据
node dist/library-cli.js sync

# 搜索并按爱心排序
node dist/library-cli.js search "关键词" --tag "标签" --sort likes

# 增量下载指定漫画；再次执行只补缺失内容
node dist/library-cli.js download <comic-id> --episodes 1,3,5-10

# 查看本地索引和下载进度
node dist/library-cli.js progress

# 根据已审核作者生成本地视图目录
node dist/library-cli.js organize
```

### Lite 到完整版

1. 在 Lite 网页导入收藏 CSV，在浏览器里筛选并审核作者。
2. 导出 `author-aliases.json` 与 `download-plan.json`。
3. 在本地执行：

```bash
node dist/library-cli.js import favorites.csv
node dist/library-cli.js import-aliases author-aliases.json
node dist/library-cli.js download-plan download-plan.json
node dist/library-cli.js organize
```

也可以在本地完整版网页中直接导入作者字典并点击下载。

## 常用命令

```text
pica-library import <favorites.csv>
pica-library export <favorites.csv>
pica-library status
pica-library progress [comic-id]
pica-library list --tag TAG --author NAME --sort recommended
pica-library authors --pending
pica-library author merge <target-id> <source-id...> --name NAME
pica-library sync
pica-library search [KEYWORD] --tag TAG --category NAME --sort likes
pica-library download <comic-id...> --episodes all --concurrency 5
pica-library download-plan <download-plan.json>
pica-library organize
pica-library serve
pica-library doctor
```

默认数据目录是 `.pica-library`，可用 `--data-dir PATH` 或 `PICA_LIBRARY_HOME` 修改。下载对象位于 `library/objects`，作者和社团视图位于 `library/views`。

## 开发与验证

```bash
pnpm type:check
pnpm test
node --check web/app.js
pnpm build
```

架构说明见 [docs/architecture.md](docs/architecture.md)，安全与公开发布边界见 [SECURITY.md](SECURITY.md)。

## 开源与来源

本项目基于 Neo（justorez）的 `pica-cli` 演进，保留原作者署名与 MIT License。改进版同样以 MIT License 发布；许可证只覆盖仓库代码，不授予任何第三方内容的版权或再分发权。
