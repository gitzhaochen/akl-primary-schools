# 奥克兰小学数据一览

汇集奥克兰 North Shore、Auckland City、Waitakere City 等区域小学的学生人口趋势与学校统计数据，帮助家长全面了解各校情况。

## 技术栈

- **Next.js 15** + React 19
- **Tailwind CSS 4** + shadcn/ui
- **Puppeteer** — 自动截图脚本

## 快速开始

```bash
pnpm install
pnpm dev
```

访问 http://localhost:3000 查看页面。

## 数据来源

| 数据 | 来源 | 截图文件 |
|------|------|----------|
| 学校统计 (Decile / Roll / FTTE) | [education.syncrat.com](https://education.syncrat.com) | `count.png` |
| 学生人口趋势 | [educationcounts.govt.nz](https://www.educationcounts.govt.nz) | `population.png` |

## 添加新学校

### 1. 编辑 newSchoolList.md

在对应区域目录下的 `newSchoolList.md` 中添加一行，格式：

```
- 学校名称, 文件夹名, 学校ID
```

例如：

```
- Upper Harbour School, UpperHarbourSchool, 6955
```

> 学校 ID 可在 [educationcounts.govt.nz](https://www.educationcounts.govt.nz/find-school) 搜索获取，URL 中的 `school=` 参数即为 ID。

### 2. 更新 page.tsx

在 `app/page.tsx` 的 `regions` 数组中，找到对应区域添加学校：

```ts
{ name: 'Upper Harbour School', folder: 'UpperHarbourSchool', id: 6955 },
```

### 3. 运行截图脚本

```bash
pnpm screenshot
```

脚本会：
- 读取所有区域下的 `newSchoolList.md`
- 打开浏览器，逐个学校截图（`count.png` + `population.png`）
- population 页面需要手动完成人机验证，完成后在终端按 Enter
- 截图完成后自动将学校从 `newSchoolList.md` 移到 `doneSchoolList.md`

### 4. 添加新区域

如需添加全新区域（如 Manukau City）：

1. 创建 `public/ManukauCity/newSchoolList.md`，写入学校列表
2. 在 `app/page.tsx` 的 `regions` 中添加新区域配置
3. 在 `app/globals.css` 中添加区域配色变量（参考 `--ns` / `--ac` / `--wc`）
4. 运行 `pnpm screenshot`

## 目录结构

```
public/
├── NorthShore/
│   ├── newSchoolList.md          # 待截图的新学校
│   ├── doneSchoolList.md         # 已完成截图的学校
│   ├── LongBaySchool/
│   │   ├── count.png
│   │   ├── population.png
│   │   └── index.md
│   └── ...
├── AucklandCity/
│   └── ...
└── WaitakereCity/
    └── ...

app/
├── layout.tsx                    # 元数据 & 布局
├── page.tsx                      # 主页面（区域 & 学校数据）
├── globals.css                   # 全局样式 & 区域配色
└── icon.svg                      # Favicon

scripts/
└── screenshot.ts                 # Puppeteer 截图脚本
```
