# Pica Library

一个把 Pica 收藏夹整理成「可搜索、可按作者归档、可增量下载」的工具。

它有两种用法：打开网页即可整理收藏；运行本地引擎后，可以同步收藏、搜索站内内容和下载漫画。

## 先试试网页

打开 **[Pica Library Lite](https://saber-alter-lily.github.io/pica-cli/)**：

1. 首次使用先 Fork 项目，在自己的 Fork 中设置账号 Secrets。
2. 运行 `prepare-library` Action，下载 `pica-library-bundle.json`。
3. 将数据包导入 Lite 页面。
4. 在“收藏库”按标题、作者、Tag 筛选，在“专属推荐”查看真实关联作品。
5. 在“作者归一”审核别名，最后导出作者字典或下载计划。

Lite 模式只在浏览器本地处理文件，不需要在网页填写账号，也不会下载漫画。数据包不会上传到 GitHub；其中包含你的收藏元数据，请自行保管。

首页只需要选一个动作：导入收藏、生成推荐、打开 GitHub 下载，或安装本地完整版。

## GitHub 下载

如果不想安装 Node.js，可以使用仓库的 `limited-download` Actions。第一次使用时，在仓库的 **Settings → Secrets and variables → Actions** 添加 `PICA_ACCOUNT` 和 `PICA_PASSWORD`，之后打开 [Actions 工作流](https://github.com/Saber-Alter-Lily/pica-cli/actions/workflows/download.yml)，点击 **Run workflow**，填写漫画 ID 和章节范围。

普通用户需要先 Fork 仓库，因为只有 Fork 的拥有者才能设置自己的 Secrets 和运行工作流。`prepare-library` 只读取收藏元数据并生成 `favorites.csv` 与 `pica-library-bundle.json`，不下载漫画图片；数据包同时包含收藏画像和最多 100 条可解释推荐，可直接导入 Pages Lite。

工作流保留了原项目的收藏夹分页体验：可以一次下载指定的一页收藏（站点通常每页约 20 本），也可以输入最多 20 个漫画 ID。图片并发为 5，不设置额外任务超时，多个手动任务可并行运行。Artifact 只保留 1 天，并且不再使用第三方临时文件上传服务；图片已经压缩过，上传时关闭二次压缩以缩短等待时间。

下载内部仍用漫画 ID 维护稳定的增量状态，但 Artifact 会转换为 `[归一作者] 漫画标题 [短ID]` 的可读文件夹。短 ID 用来区分重名作品；本地长期库则使用 `作者/漫画标题 [完整ID]` 视图，避免重复显示作者名。

请仅下载你有权访问和保存的内容，不要将 Artifact 用于公开再分发。GitHub Free 当前包含 500 MB Artifact 存储，500–1000 MB 的单个任务可能快速占用或超过免费额度；实际可用量还受账号计划、同时保留的 Artifact 和 GitHub 政策影响。GitHub 的公开仓库标准 runner 免费，但仍受 GitHub 的[Actions 计费与用量规则](https://docs.github.com/en/billing/concepts/product-billing/github-actions)和[可接受使用政策](https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies?apiVersion=2022-11-28)约束。

## 需要同步和下载时

本地完整版使用原项目的站内接口和下载能力。需要 Node.js 22.5+，推荐 Node.js 24。

```bash
git clone https://github.com/Saber-Alter-Lily/pica-cli.git
cd pica-cli
pnpm install
pnpm build
node dist/library-cli.js serve
```

然后打开 <http://127.0.0.1:4789>。

### 配置账号

复制 `.env.template` 为 `.env.local`，填写：

```dotenv
PICA_ACCOUNT=你的账号
PICA_PASSWORD=你的密码
# 有需要时填写代理，例如 http://127.0.0.1:7890
PICA_PROXY=
PICA_DL_CONCURRENCY=5
```

账号只在本机使用，不会写入数据库或日志。不要把 `.env.local` 提交到 Git。

Windows 用户可以在项目根目录运行 `powershell -ExecutionPolicy Bypass -File scripts/setup-windows.ps1`，脚本会检查 Node/pnpm、创建 `.env.local` 并完成构建；它不会替你读取或上传账号。

### 常用操作

```bash
# 同步收藏夹元数据
node dist/library-cli.js sync

# 按关键词、Tag 搜索并按爱心排序
node dist/library-cli.js search "关键词" --tag "标签" --sort likes

# 下载一部漫画的指定章节；再次运行只补缺失图片
node dist/library-cli.js download 漫画ID --episodes 1,3,5-10

# 查看章节和图片进度
node dist/library-cli.js progress

# 按归一后的作者和社团生成本地浏览目录
node dist/library-cli.js organize
```

## 从 Lite 继续下载

Lite 导出的文件可以交给本地 CLI：

```bash
node dist/library-cli.js import favorites.csv
node dist/library-cli.js import-aliases author-aliases.json
node dist/library-cli.js download-plan download-plan.json
node dist/library-cli.js organize
```

也可以直接在本地网页中导入作者字典并操作。

## 原来的命令还能用吗？

可以。原有命令仍然保留：

```bash
pica-cli
pica-zip
```

新功能使用 `pica-library`：

```text
pica-library init                         初始化数据库
pica-library import <favorites.csv>       导入收藏夹
pica-library status                       查看统计
pica-library list --tag TAG                筛选本地收藏
pica-library authors --pending             查看待审核作者
pica-library sync                         同步站内收藏
pica-library search [KEYWORD]             站内搜索
pica-library download <comic-id>          增量下载
pica-library serve                        启动本地网页
```

## 常见问题

**网页能直接下载漫画吗？**

Lite 网页本身不能直接使用你的账号。你可以选择本地完整版，或通过 GitHub Actions 的受限工作流下载临时 Artifact；本地完整版更适合长期库和增量更新。

**推荐是怎么来的？**

系统从收藏夹统计作者、社团、Tag、分类、完结比例和爱心/浏览量。连接本地引擎后，它还会读取收藏作品的站内关联推荐，排除已收藏内容、限制同一作者占比，并在每张卡片显示匹配理由。Lite 模式可以先展示收藏画像，不能凭空获得站内候选。

**每次同步会不会重新下载？**

不会。程序按漫画、章节和图片的稳定 ID 记录状态，只下载缺失内容。

**作者归一会不会误合并？**

系统只生成候选，不会把相似名字自动当成同一人。低置信度关系会进入审核；确认后才用于作者目录。

**GitHub 会保存我的漫画吗？**

不会。GitHub 只保存代码、文档和构建流程；账号、收藏数据和下载文件均保存在你的本地环境。

## 开发

```bash
pnpm type:check
pnpm test
node --check web/app.js
pnpm build
```

更详细的内容：

- [架构说明](docs/architecture.md)
- [安全说明](SECURITY.md)
- [在线 Lite 页面](https://saber-alter-lily.github.io/pica-cli/)

## 来源与许可证

本项目基于 Neo（justorez）的 `pica-cli` 演进，保留原作者署名和 MIT License。请只下载你有权访问和保存的内容，并遵守站点规则及适用法律。
