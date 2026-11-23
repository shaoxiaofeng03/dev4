import fs from 'node:fs/promises';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

const MAX_BODY = 2 * 1024 * 1024;

export interface LocalDataOptions {
  checkins: string;
  review: string;
}

const CHECKINS_NOTE = '打卡数据。可手动编辑，格式见 docs/guide/data-format.md';
const REVIEW_NOTE = '记忆卡复习状态（SM-2）。可手动编辑，格式见 docs/guide/data-format.md';

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > MAX_BODY) throw new Error('请求体过大');
    chunks.push(buf);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function isCheckinsPayload(value: unknown): value is { entries: { date: string; items: string[] }[] } {
  if (!value || typeof value !== 'object') return false;
  const entries = (value as { entries?: unknown }).entries;
  if (!Array.isArray(entries)) return false;
  return entries.every((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const e = entry as { date?: unknown; items?: unknown };
    return (
      typeof e.date === 'string' &&
      Array.isArray(e.items) &&
      e.items.every((id) => typeof id === 'string')
    );
  });
}

function isReviewPayload(value: unknown): value is { cards: Record<string, unknown> } {
  if (!value || typeof value !== 'object') return false;
  const cards = (value as { cards?: unknown }).cards;
  if (!cards || typeof cards !== 'object' || Array.isArray(cards)) return false;
  return Object.values(cards as Record<string, unknown>).every(
    (rec) => rec && typeof rec === 'object' && !Array.isArray(rec)
  );
}

/**
 * 开发服务器专用接口：让页面直接读写仓库里的打卡与复习 JSON。
 * 只在 `vitepress dev` 时注册（apply: 'serve'），构建和 GitHub Pages 上都不存在。
 * 同步仍然由用户手动 git commit / push，不需要任何 Token。
 */
export function localDataPlugin(options: LocalDataOptions): Plugin {
  const routes = new Map<string, { file: string; kind: 'checkins' | 'review'; note: string }>([
    ['/__local/checkins', { file: path.resolve(options.checkins), kind: 'checkins', note: CHECKINS_NOTE }],
    ['/__local/review-state', { file: path.resolve(options.review), kind: 'review', note: REVIEW_NOTE }],
  ]);
  const files = new Set([...routes.values()].map((r) => r.file));

  return {
    name: 'dev4-local-data',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawPath = (req.url ?? '/').split('?')[0];
        // VitePress 的 base 会出现在请求路径里（例如 /dev4/__local/checkins），
        // 这里剥掉 base 再匹配路由。
        const base = server.config.base || '/';
        const pathname =
          base !== '/' && rawPath.startsWith(base)
            ? `/${rawPath.slice(base.length)}`
            : rawPath;
        const route = routes.get(pathname);
        if (!route) {
          next();
          return;
        }

        try {
          if (req.method === 'GET') {
            const raw = await fs.readFile(route.file, 'utf8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store');
            res.end(raw);
            return;
          }

          if (req.method === 'PUT') {
            const raw = await readBody(req);
            const parsed = JSON.parse(raw) as unknown;
            let payload: unknown;
            if (route.kind === 'checkins') {
              if (!isCheckinsPayload(parsed)) {
                sendJson(res, 400, { ok: false, error: '打卡数据结构不合法' });
                return;
              }
              payload = { version: 1, note: route.note, entries: parsed.entries };
            } else {
              if (!isReviewPayload(parsed)) {
                sendJson(res, 400, { ok: false, error: '复习数据结构不合法' });
                return;
              }
              payload = { version: 1, note: route.note, cards: parsed.cards };
            }
            await fs.writeFile(route.file, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
            sendJson(res, 200, { ok: true });
            return;
          }

          res.setHeader('Allow', 'GET, PUT');
          sendJson(res, 405, { ok: false, error: '只支持 GET / PUT' });
        } catch (err) {
          sendJson(res, 500, {
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
    },
    handleHotUpdate({ file }) {
      // 写入数据文件后不要触发整页刷新，页面自己维护 store。
      if (files.has(path.resolve(file))) return [];
      return;
    },
  };
}
