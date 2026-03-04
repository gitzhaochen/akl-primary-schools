import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

const SYNCRAT_URL = (id: number) =>
  `https://education.syncrat.com/education/school/${id}`;

const EDUCOUNTS_URL = (id: number) =>
  `https://www.educationcounts.govt.nz/find-school/school/population/year?district=&region=&school=${id}`;

interface SchoolTask {
  regionBase: string;
  name: string;
  folder: string;
  id: number;
  rawLine: string;
}

/**
 * 扫描 public 下所有区域的 newSchoolList.md，解析待截图学校
 * 格式: - 学校名称, 文件夹名, 学校ID
 */
function loadNewSchools(): SchoolTask[] {
  const tasks: SchoolTask[] = [];
  const regionDirs = fs.readdirSync(PUBLIC_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const dir of regionDirs) {
    const listFile = path.join(PUBLIC_DIR, dir.name, 'newSchoolList.md');
    if (!fs.existsSync(listFile)) continue;

    const content = fs.readFileSync(listFile, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('-')) continue;

      const parts = trimmed.slice(1).split(',').map(s => s.trim());
      if (parts.length < 3) {
        console.warn(`⚠ 跳过格式不正确的行: "${trimmed}" (需要: - 名称, 文件夹, ID)`);
        continue;
      }

      const [name, folder, idStr] = parts;
      const id = parseInt(idStr, 10);
      if (isNaN(id)) {
        console.warn(`⚠ 跳过无效 ID: "${trimmed}"`);
        continue;
      }

      tasks.push({ regionBase: dir.name, name, folder, id, rawLine: trimmed });
    }
  }

  return tasks;
}

/**
 * 截图完成后，将学校从 newSchoolList.md 移到 doneSchoolList.md
 */
function markDone(task: SchoolTask) {
  const newFile = path.join(PUBLIC_DIR, task.regionBase, 'newSchoolList.md');
  const doneFile = path.join(PUBLIC_DIR, task.regionBase, 'doneSchoolList.md');

  // 追加到 doneSchoolList.md
  const doneEntry = `- ${task.name}, ${task.folder}, ${task.id}\n`;
  fs.appendFileSync(doneFile, doneEntry, 'utf-8');

  // 从 newSchoolList.md 中移除
  if (fs.existsSync(newFile)) {
    const content = fs.readFileSync(newFile, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== task.rawLine);
    fs.writeFileSync(newFile, lines.join('\n'), 'utf-8');
  }
}

async function captureCount(page: puppeteer.Page, schoolId: number, outputPath: string) {
  const url = SYNCRAT_URL(schoolId);
  console.log(`    count.png  ← ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });
  await page.screenshot({ path: outputPath, fullPage: true });
}

async function capturePopulation(page: puppeteer.Page, schoolId: number, outputPath: string) {
  const url = EDUCOUNTS_URL(schoolId);
  console.log(`    population.png ← ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });
  await page.screenshot({ path: outputPath, fullPage: true });
}

async function main() {
  const tasks = loadNewSchools();

  if (tasks.length === 0) {
    console.log('\n✅ 没有需要截图的新学校 (所有 newSchoolList.md 为空)\n');
    return;
  }

  console.log(`\n📸 准备截图 ${tasks.length} 所学校...\n`);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const dir = path.join(PUBLIC_DIR, task.regionBase, task.folder);
    fs.mkdirSync(dir, { recursive: true });

    console.log(`  [${i + 1}/${tasks.length}] ${task.regionBase}/${task.folder} (id=${task.id})`);

    await captureCount(page, task.id, path.join(dir, 'count.png'));
    await capturePopulation(page, task.id, path.join(dir, 'population.png'));

    markDone(task);
    console.log(`  ✓ 完成\n`);
  }

  await browser.close();
  console.log(`\n🎉 全部完成！共截图 ${tasks.length} 所学校。\n`);
}

main().catch(err => {
  console.error('截图出错:', err);
  process.exit(1);
});
