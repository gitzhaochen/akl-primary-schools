import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import readline from 'readline';

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

function markDone(task: SchoolTask) {
  const newFile = path.join(PUBLIC_DIR, task.regionBase, 'newSchoolList.md');
  const doneFile = path.join(PUBLIC_DIR, task.regionBase, 'doneSchoolList.md');

  const doneEntry = `- ${task.name}, ${task.folder}, ${task.id}\n`;
  fs.appendFileSync(doneFile, doneEntry, 'utf-8');

  if (fs.existsSync(newFile)) {
    const content = fs.readFileSync(newFile, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== task.rawLine);
    fs.writeFileSync(newFile, lines.join('\n'), 'utf-8');
  }
}

function waitForEnter(prompt: string): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

/**
/**
 * count.png — 只截取表格区域
 */
async function captureCount(page: import('puppeteer').Page, schoolId: number, outputPath: string) {
  const url = SYNCRAT_URL(schoolId);
  console.log(`    count.png  ← ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });

  // 定位表格元素并截图
  const table = await page.$('table');
  if (table) {
    await table.screenshot({ path: outputPath });
  } else {
    console.warn('    ⚠ 未找到表格元素，使用全页截图');
    await page.screenshot({ path: outputPath, fullPage: true });
  }
}

/**
 * population.png — 需要用户过人机验证，滚动到底部后截图
 */
async function capturePopulation(page: import('puppeteer').Page, schoolId: number, outputPath: string) {
  const url = EDUCOUNTS_URL(schoolId);
  console.log(`    population.png ← ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 });

  await waitForEnter('    ⏳ 请在浏览器中完成人机验证，完成后按 Enter 继续...');

  // 滚动到页面最底部，确保所有内容加载
  let previousHeight = 0;
  while (true) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight as number);
    if (currentHeight === previousHeight) break;
    previousHeight = currentHeight;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 800));
  }

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: outputPath, fullPage: true });
}

async function main() {
  const tasks = loadNewSchools();

  if (tasks.length === 0) {
    console.log('\n✅ 没有需要截图的新学校 (所有 newSchoolList.md 为空)\n');
    return;
  }

  console.log(`\n📸 准备截图 ${tasks.length} 所学校...\n`);

  const browser = await puppeteer.launch({ headless: false });
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
