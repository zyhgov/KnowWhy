/**
 * IndexNow 全量推送:读取站点地图的全部链接,一次性推送到 Bing 的 IndexNow 接口。
 *
 * 运行方式(项目根目录下):
 *   npm run indexnow                         # 推送默认站点地图的全部链接
 *   node scripts/indexnow.mjs                # 同上
 *   node scripts/indexnow.mjs <sitemap地址>  # 指定其他站点地图
 *
 * 说明:
 * - 站点地图入口 /sitemap.xml 为 sitemapindex,脚本会递归展开子 sitemap 并收集全部 <loc>;
 * - IndexNow 密钥从 public/ 下的密钥文件读取(部署后即线上可访问),
 *   并随请求以 keyLocation 显式声明该文件的线上地址;
 * - 单次请求最多推送 10000 个链接,超出会自动分批。
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 站点地图入口(可被命令行参数覆盖) */
const SITEMAP_URL = process.argv[2] ?? 'https://knowwhy.zyhorg.cn/sitemap.xml';
/** IndexNow 密钥文件(位于 public/,部署后线上可访问;注意与微信验证文件区分) */
const KEY_FILE = 'eb7fc2ca3be64e4aa4a4e490dac3a406.txt';
/** Bing 的 IndexNow 推送接口 */
const INDEXNOW_ENDPOINT = 'https://www.bing.com/indexnow';
/** 接口单次请求的 URL 上限 */
const MAX_URLS_PER_PUSH = 10000;

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

/** 提取 XML 文本中的全部 <loc> 值 */
const extractLocs = (xml) => [...xml.matchAll(/<loc>\s*([^<>\s]+)\s*<\/loc>/g)].map((m) => m[1]);

/** 抓取站点地图;若为 sitemapindex 则递归展开子 sitemap,返回全部页面 URL */
async function collectUrls(sitemapUrl) {
	const res = await fetch(sitemapUrl, { signal: AbortSignal.timeout(30000) });
	if (!res.ok) throw new Error(`读取站点地图失败:${sitemapUrl} → HTTP ${res.status}`);
	const xml = await res.text();
	const locs = extractLocs(xml);
	if (!/<sitemapindex[\s>]/.test(xml)) return locs;
	const all = [];
	for (const child of locs) all.push(...(await collectUrls(child)));
	return all;
}

const key = (await readFile(path.join(root, 'public', KEY_FILE), 'utf8')).trim();
if (!key) throw new Error(`IndexNow 密钥文件为空:public/${KEY_FILE}`);

console.log(`读取站点地图:${SITEMAP_URL}`);
const urls = [...new Set(await collectUrls(SITEMAP_URL))];
if (urls.length === 0) throw new Error('未从站点地图中解析到任何链接');
console.log(`共收集到 ${urls.length} 个链接`);

const sitemap = new URL(SITEMAP_URL);
const payloadBase = {
	host: sitemap.host,
	key,
	keyLocation: `${sitemap.origin}/${KEY_FILE}`,
};

let pushed = 0;
for (let i = 0; i < urls.length; i += MAX_URLS_PER_PUSH) {
	const batch = urls.slice(i, i + MAX_URLS_PER_PUSH);
	const res = await fetch(INDEXNOW_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
		body: JSON.stringify({ ...payloadBase, urlList: batch }),
		signal: AbortSignal.timeout(30000),
	});
	const text = (await res.text()).trim();
	console.log(`推送 ${batch.length} 个链接 → HTTP ${res.status}${text ? ` ${text}` : ''}`);
	if (!res.ok) throw new Error(`推送失败(HTTP ${res.status});链接状态见上方输出`);
	pushed += batch.length;
}

console.log(`完成:已向 IndexNow(Bing)推送 ${pushed} 个链接。`);
