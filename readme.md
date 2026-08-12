# Pica Library

一个把 Pica 收藏夹整理成「可搜索、可按作者归档、可增量下载」的工具。

它有两种用法：打开网页即可整理收藏；运行本地引擎后，可以同步收藏、搜索站内内容和下载漫画。

## 先试试网页

打开 **[Pica Library Lite](https://saber-alter-lily.github.io/pica-cli/)**：

1. 选择你的收藏夹 CSV 文件并导入。
2. 在“收藏库”里按标题、作者、Tag 筛选，按爱心数或浏览量排序。
3. 在“作者归一”里审核或合并同一作者的不同写法。
4. 导出作者字典或下载计划。

Lite 模式只在浏览器本地处理文件，不需要账号，也不会下载漫画。你的 CSV 不会上传到 GitHub。

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

在线 Lite 网页不能。它用于整理元数据和生成计划；下载需要在自己的电脑上运行本地完整版，这样账号和文件都留在本机。

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
