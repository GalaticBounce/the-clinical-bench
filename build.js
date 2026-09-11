#!/usr/bin/env node
/**
 * build.js: zero-dependency static build for the Clinical Bench insights section.
 *
 *   node build.js          read content/insights/*.md (status: published) and write
 *                          insights/<slug>/index.html, insights/index.html,
 *                          insights/rss.xml, sitemap.xml and the "## Insights"
 *                          section of llms.txt
 *   node build.js --check  exit 1 if a build would change anything on disk, else 0
 *                          (writes nothing; use it in CI to prove reproducibility)
 *   node build.js --preview <path-to-draft.md>
 *                          render one markdown file with the post template regardless
 *                          of its status, to content/drafts/preview/<slug>.html
 *                          (git-ignored). Touches nothing else.
 *
 * Output is deterministic: no "now" timestamps, only the dates in frontmatter.
 * Cloudflare Pages has no build step, so generated files are committed as-is.
 *
 * Frontmatter contract (one "key: value" per line between --- fences):
 *   title        required  string
 *   description  required  string (meta description, card blurb, RSS description)
 *   slug         required  [a-z0-9-]+ and must equal the filename without .md
 *   date         required  YYYY-MM-DD
 *   updated      optional  YYYY-MM-DD (dateModified and sitemap lastmod)
 *   status       required  only "published" is built; anything else is skipped
 *   audience     required  "companies" or "clinicians" (drives label, nav CTA, box)
 *   keywords     required  comma separated
 *   cluster      required  string (topic cluster, used as articleSection)
 *   ogImage      optional  path relative to /assets/, e.g. img/insights/foo.jpg
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE = 'https://theclinicalbench.com';
const CONTENT_DIR = path.join(ROOT, 'content', 'insights');
const OUT_DIR = path.join(ROOT, 'insights');
const STATIC_LASTMOD = '2026-09-11';
const DEFAULT_OG = SITE + '/assets/img/og.jpg?v=6';
const LOGO = SITE + '/assets/brand/app-icon-512.png';
const WPM = 220;
const CHECK = process.argv.includes('--check');
const PREVIEW = process.argv.includes('--preview');
const PREVIEW_DIR = path.join(ROOT, 'content', 'drafts', 'preview');

const REQUIRED = ['title', 'description', 'slug', 'date', 'status', 'audience', 'keywords', 'cluster'];
// Shown under every post's CTA. Clinical Bench supplies professional input for commercial
// work; its articles describe practice and regulation in general terms only.
const DISCLAIMER = 'This article is general information for teams and clinicians. It is not legal, regulatory, clinical or financial advice. It does not describe your situation. Clinical Bench supplies private professional input for commercial work. It is not a clinical service, does not run clinical trials and its clinicians do not endorse products.';

const AUDIENCES = {
  companies: {
    label: 'For teams building healthcare products',
    short: 'For companies',
    navCta: { text: 'Enquire', href: '/#contact' },
    box: {
      heading: 'Need a clinician on this?',
      body: 'Tell us what you are building and we will match you with a registered Australian professional in days.',
      cta: 'Scope an engagement',
      href: '/#contact',
    },
  },
  clinicians: {
    label: 'For doctors, nurses and allied health',
    short: 'For clinicians',
    navCta: { text: 'Apply to join', href: '/clinicians/#apply' },
    box: {
      heading: 'Want paid work like this?',
      body: 'Registered Australian doctors, nurses and allied health professionals join the bench for scoped, fixed-fee commercial engagements.',
      cta: 'Apply to join the bench',
      href: '/clinicians/#apply',
    },
  },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fail(msg) {
  console.error('build.js: ' + msg);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripTags(html) {
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function isoDateTime(iso) {
  return iso + 'T00:00:00+10:00';
}

function rfc822(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = DAYS[new Date(iso + 'T00:00:00Z').getUTCDay()];
  return `${dow}, ${String(d).padStart(2, '0')} ${MONTHS[m - 1].slice(0, 3)} ${y} 00:00:00 +1000`;
}

/** JSON for an inline <script type="application/ld+json">; "</" is escaped so no
 *  string can close the script element early. "<\/" is valid JSON. */
function jsonLd(obj) {
  return JSON.stringify(obj).replace(/<\//g, '<\\/');
}

/* ------------------------------------------------------------------ */
/* Frontmatter                                                         */
/* ------------------------------------------------------------------ */

function parseFrontmatter(raw, file) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/);
  if (!m) fail(`${file}: missing frontmatter block (--- ... --- at the top of the file)`);
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const kv = line.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) fail(`${file}: cannot parse frontmatter line "${line}" (expected key: value)`);
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"') && v.length > 1) || (v.startsWith("'") && v.endsWith("'") && v.length > 1)) {
      v = v.slice(1, -1);
    }
    fm[kv[1]] = v;
  }
  return { fm, body: m[2] };
}

/* ------------------------------------------------------------------ */
/* Markdown                                                            */
/* ------------------------------------------------------------------ */

const NUL = '\u0000';

function inline(text) {
  const codes = [];
  let s = text.replace(/`([^`\n]+)`/g, (_, c) => {
    codes.push('<code>' + esc(c) + '</code>');
    return NUL + (codes.length - 1) + NUL;
  });
  s = esc(s);
  s = s.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_, t, u) => {
    const external = /^https?:\/\//i.test(u) && !u.startsWith(SITE + '/') && u !== SITE;
    return `<a href="${u}"${external ? ' rel="noopener"' : ''}>${t}</a>`;
  });
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?=[^*\w]|$)/g, '$1<em>$2</em>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
  return s;
}

const RE_HEADING = /^(#{2,4})\s+(.+?)\s*#*\s*$/;
const RE_HR = /^(?:-{3,}|\*{3,}|_{3,})\s*$/;
const RE_LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const RE_TABLE_SEP = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const RE_RAW = /^<(figure|svg|table|div|details)\b/;

function isTableStart(lines, i) {
  return /^\|/.test(lines[i]) && i + 1 < lines.length && RE_TABLE_SEP.test(lines[i + 1]);
}

function isBlockStart(lines, i) {
  const l = lines[i];
  return /^#/.test(l) || RE_HR.test(l) || /^>/.test(l) || /^```/.test(l) || RE_LIST.test(l) || RE_RAW.test(l) || isTableStart(lines, i);
}

function parseListItems(itemLines) {
  const items = [];
  const stack = [];
  for (const l of itemLines) {
    const m = l.match(RE_LIST);
    if (m) {
      const item = { indent: m[1].length, ordered: /\d/.test(m[2]), text: m[3], children: [] };
      while (stack.length && stack[stack.length - 1].indent >= item.indent) stack.pop();
      if (stack.length) stack[stack.length - 1].children.push(item);
      else items.push(item);
      stack.push(item);
    } else if (stack.length) {
      stack[stack.length - 1].text += ' ' + l.trim();
    }
  }
  return items;
}

function renderList(items) {
  const tag = items[0].ordered ? 'ol' : 'ul';
  const lis = items.map((it) => {
    const kids = it.children.length ? '\n' + renderList(it.children) + '\n' : '';
    return `<li>${inline(it.text)}${kids}</li>`;
  });
  return `<${tag}>\n${lis.join('\n')}\n</${tag}>`;
}

function splitRow(row) {
  return row
    .trim()
    .replace(/\\\|/g, NUL)
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.replace(/\u0000/g, '|').trim());
}

/** Parses markdown lines into an array of { type, html, plain, level?, id? } blocks. */
function parseBlocks(lines, ctx) {
  const blocks = [];
  const push = (type, html, extra) => {
    blocks.push(Object.assign({ type, html, plain: stripTags(html) }, extra || {}));
  };
  let i = 0;
  const n = lines.length;
  while (i < n) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const buf = [];
      i++;
      while (i < n && !/^```\s*$/.test(lines[i])) buf.push(lines[i++]);
      if (i >= n) fail(`${ctx.file}: unclosed code fence`);
      i++;
      push('code', `<pre><code${lang ? ` class="language-${esc(lang)}"` : ''}>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    const raw = line.match(RE_RAW);
    if (raw) {
      const tag = raw[1];
      const open = new RegExp('<' + tag + '\\b', 'g');
      const close = new RegExp('</' + tag + '\\s*>', 'g');
      const buf = [];
      let depth = 0;
      while (i < n) {
        const l = lines[i++];
        buf.push(l);
        depth += (l.match(open) || []).length;
        depth -= (l.match(close) || []).length;
        if (depth <= 0) break;
      }
      if (depth > 0) fail(`${ctx.file}: unclosed <${tag}> block starting "${line.slice(0, 60)}"`);
      push('html', buf.join('\n'));
      continue;
    }

    if (/^#(\s|$)/.test(line)) {
      fail(`${ctx.file}: body contains an H1 ("${line.trim()}"). The title supplies the H1; start sections at ##.`);
    }
    const hd = line.match(RE_HEADING);
    if (hd) {
      const level = hd[1].length;
      const html = inline(hd[2]);
      const plain = stripTags(html);
      let id = slugify(plain);
      let k = 2;
      while (ctx.ids.has(id)) id = slugify(plain) + '-' + k++;
      ctx.ids.add(id);
      push('heading', `<h${level} id="${id}">${html}</h${level}>`, { level, id });
      i++;
      continue;
    }
    if (/^#/.test(line)) fail(`${ctx.file}: malformed heading "${line.trim()}" (use ## to ####, followed by a space)`);

    if (RE_HR.test(line)) { push('hr', '<hr>'); i++; continue; }

    if (/^>/.test(line)) {
      const buf = [];
      while (i < n && /^>/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      const inner = parseBlocks(buf, ctx);
      push('blockquote', `<blockquote>\n${inner.map((b) => b.html).join('\n')}\n</blockquote>`);
      continue;
    }

    if (isTableStart(lines, i)) {
      const rows = [];
      while (i < n && /^\|/.test(lines[i])) rows.push(lines[i++]);
      const header = splitRow(rows[0]);
      const aligns = splitRow(rows[1]).map((c) => {
        const l = c.startsWith(':');
        const r = c.endsWith(':');
        return l && r ? 'center' : r ? 'right' : '';
      });
      const cell = (tag, txt, j) => `<${tag}${aligns[j] ? ` style="text-align:${aligns[j]}"` : ''}>${inline(txt)}</${tag}>`;
      const thead = `<thead>\n<tr>${header.map((h, j) => cell('th', h, j)).join('')}</tr>\n</thead>`;
      const body = rows.slice(2).map((r) => {
        const cells = splitRow(r);
        while (cells.length < header.length) cells.push('');
        return `<tr>${cells.slice(0, header.length).map((c, j) => cell('td', c, j)).join('')}</tr>`;
      });
      const tbody = body.length ? `\n<tbody>\n${body.join('\n')}\n</tbody>` : '';
      push('table', `<div class="tbl">\n<table>\n${thead}${tbody}\n</table>\n</div>`);
      continue;
    }

    if (RE_LIST.test(line)) {
      const buf = [];
      while (i < n) {
        const l = lines[i];
        if (RE_LIST.test(l)) { buf.push(l); i++; continue; }
        if (l.trim() && /^\s+\S/.test(l) && !isBlockStart(lines, i)) { buf.push(l); i++; continue; }
        if (!l.trim()) {
          let j = i + 1;
          while (j < n && !lines[j].trim()) j++;
          if (j < n && RE_LIST.test(lines[j]) && /^\s/.test(lines[j])) { i = j; continue; }
        }
        break;
      }
      push('list', renderList(parseListItems(buf)));
      continue;
    }

    const buf = [line];
    i++;
    while (i < n && lines[i].trim() && !isBlockStart(lines, i)) buf.push(lines[i++]);
    push('p', `<p>${inline(buf.join('\n'))}</p>`);
  }
  return blocks;
}

function markdown(body, file) {
  const ctx = { file, ids: new Set() };
  const blocks = parseBlocks(body.replace(/\r\n/g, '\n').split('\n'), ctx);
  const html = blocks.map((b) => b.html).join('\n');
  const words = blocks.reduce((sum, b) => sum + (b.plain ? b.plain.split(/\s+/).filter(Boolean).length : 0), 0);
  return { html, blocks, words };
}

/** Q and A pairs from "## Common questions": each "### ...?" plus the blocks under it. */
function extractFaq(blocks) {
  const faqs = [];
  let inSection = false;
  let current = null;
  for (const b of blocks) {
    if (b.type === 'heading' && b.level === 2) {
      inSection = /^common questions$/i.test(b.plain);
      current = null;
      continue;
    }
    if (!inSection) continue;
    if (b.type === 'heading') {
      current = null;
      if (b.level === 3 && b.plain.endsWith('?')) {
        current = { q: b.plain, a: [] };
        faqs.push(current);
      }
      continue;
    }
    if (current && b.plain) current.a.push(b.plain);
  }
  return faqs.filter((f) => f.a.length).map((f) => ({ q: f.q, a: f.a.join(' ') }));
}

/* ------------------------------------------------------------------ */
/* Load posts                                                          */
/* ------------------------------------------------------------------ */

/**
 * Reads and validates one markdown file. Returns null when the post is not
 * published (unless opts.anyStatus). Unknown frontmatter keys are ignored.
 */
function loadPost(absPath, file, opts) {
  const anyStatus = Boolean(opts && opts.anyStatus);
  const f = path.basename(absPath);
  const rawText = fs.readFileSync(absPath, 'utf8');
  const { fm, body } = parseFrontmatter(rawText, file);
  if (!anyStatus && fm.status !== 'published') {
    console.log(`skip  ${file} (status: ${fm.status || 'missing'})`);
    return null;
  }
  const missing = REQUIRED.filter((k) => !fm[k]);
  if (missing.length) fail(`${file}: missing required frontmatter key(s): ${missing.join(', ')}`);
  if (!/^[a-z0-9-]+$/.test(fm.slug)) fail(`${file}: slug "${fm.slug}" may only contain a-z, 0-9 and hyphens`);
  if (fm.slug + '.md' !== f) fail(`${file}: slug "${fm.slug}" does not match the filename (expected ${fm.slug}.md)`);
  if (!isValidDate(fm.date)) fail(`${file}: date "${fm.date}" is not a valid YYYY-MM-DD date`);
  if (fm.updated && !isValidDate(fm.updated)) fail(`${file}: updated "${fm.updated}" is not a valid YYYY-MM-DD date`);
  if (fm.updated && fm.updated < fm.date) fail(`${file}: updated (${fm.updated}) is earlier than date (${fm.date})`);
  if (!AUDIENCES[fm.audience]) fail(`${file}: audience must be "companies" or "clinicians", got "${fm.audience}"`);
  if (fm.ogImage && !/^[A-Za-z0-9_\-./]+$/.test(fm.ogImage)) fail(`${file}: ogImage "${fm.ogImage}" must be a plain path relative to /assets/`);

  const md = markdown(body, file);
  if (!md.blocks.length) fail(`${file}: body is empty`);
  const keywords = fm.keywords.split(',').map((k) => k.trim()).filter(Boolean);
  const ogImage = fm.ogImage ? SITE + '/assets/' + fm.ogImage.replace(/^\/?(assets\/)?/, '') : DEFAULT_OG;

  return {
    file,
    title: fm.title,
    description: fm.description,
    slug: fm.slug,
    date: fm.date,
    updated: fm.updated || '',
    modified: fm.updated || fm.date,
    status: fm.status,
    audience: fm.audience,
    keywords,
    cluster: fm.cluster,
    ogImage,
    url: `${SITE}/insights/${fm.slug}/`,
    path: `/insights/${fm.slug}/`,
    html: md.html,
    words: md.words,
    minutes: Math.max(1, Math.round(md.words / WPM)),
    faq: extractFaq(md.blocks),
  };
}

/** All published posts from content/insights, newest first (slug breaks ties). */
function loadPosts() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md')).sort();
  const posts = [];
  const seen = new Set();
  for (const f of files) {
    const file = path.posix.join('content', 'insights', f);
    const post = loadPost(path.join(CONTENT_DIR, f), file);
    if (!post) continue;
    if (seen.has(post.slug)) fail(`${file}: duplicate slug "${post.slug}"`);
    seen.add(post.slug);
    posts.push(post);
  }
  posts.sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : a.date < b.date ? 1 : -1));
  return posts;
}

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

const MARK = '<svg class="mk" viewBox="0 0 24 24" fill="none" aria-hidden="true"><g fill="none" stroke="#1E7A5A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8.2 4.4H6.6a2 2 0 0 0-2 2v11.2a2 2 0 0 0 2 2h1.6"/><path d="M15.8 4.4h1.6a2 2 0 0 1 2 2v11.2a2 2 0 0 1-2 2h-1.6"/></g><circle cx="12" cy="9.9" r="3" fill="#2E9D74"/><path d="M7.3 18.2a4.7 4.7 0 0 1 9.4 0Z" fill="#2E9D74"/></svg>';

const CSS = `
@font-face{font-family:"Onest";font-style:normal;font-weight:400;font-display:swap;src:url("/assets/fonts/onest-latin-400-normal.woff2") format("woff2")}
@font-face{font-family:"Onest";font-style:normal;font-weight:500;font-display:swap;src:url("/assets/fonts/onest-latin-500-normal.woff2") format("woff2")}
@font-face{font-family:"Onest";font-style:normal;font-weight:600;font-display:swap;src:url("/assets/fonts/onest-latin-600-normal.woff2") format("woff2")}
@font-face{font-family:"Onest";font-style:normal;font-weight:700;font-display:swap;src:url("/assets/fonts/onest-latin-700-normal.woff2") format("woff2")}
:root{--bg:#F7F6F2;--ink:#111315;--muted:#5F646A;--line:#E7E4DB;--accent:#1E7A5A;--accent-soft:#E4F0EA;--body:#33383D;--mx:clamp(20px,5vw,72px)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Onest",system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:var(--accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:6px}
[id]{scroll-margin-top:92px}
.wrap{max-width:720px;margin:0 auto;padding:0 var(--mx)}
header{border-bottom:1px solid var(--line);background:rgba(247,246,242,.9);position:sticky;top:0;backdrop-filter:blur(12px);z-index:10}
.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;height:74px;max-width:1240px;margin:0 auto;padding:0 var(--mx)}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:19px;letter-spacing:-.02em;text-decoration:none;color:var(--ink);white-space:nowrap}
.brand .mk{width:22px;height:22px;flex:none}
.nav-c{display:flex;gap:28px;font-size:15px;font-weight:500}
.nav-c a{color:var(--muted);text-decoration:none;display:inline-flex;align-items:center;min-height:34px}
.nav-c a:hover,.nav-c a[aria-current]{color:var(--ink)}
.pill{display:inline-flex;align-items:center;gap:9px;font-weight:600;font-size:15px;padding:12px 22px;border-radius:999px;background:var(--ink);color:#fff;text-decoration:none;white-space:nowrap;border:1px solid transparent;transition:transform .3s cubic-bezier(.22,1,.36,1),background .25s}
.pill:hover{transform:translateY(-2px);background:#000}
.pill .arw{transition:transform .3s cubic-bezier(.22,1,.36,1)}
.pill:hover .arw{transform:translateX(3px)}
@media(max-width:640px){.nav-c{display:none}.pill{padding:10px 16px;font-size:14px}}
main{padding:clamp(40px,6vw,72px) 0 clamp(60px,8vw,100px)}
.crumbs{font-size:14px;color:var(--muted);margin-bottom:22px}
.crumbs a{color:var(--muted);text-decoration:none}
.crumbs a:hover{color:var(--ink)}
.label{display:block;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}
h1{font-size:clamp(32px,4.6vw,48px);font-weight:700;letter-spacing:-.035em;line-height:1.08;overflow-wrap:anywhere}
.meta{color:var(--muted);font-size:14.5px;margin-top:16px;padding-bottom:28px;border-bottom:1px solid var(--line)}
.intro{color:var(--body);font-size:18px;margin-top:16px;max-width:60ch}
article{margin-top:32px}
article h2{font-size:clamp(22px,2.6vw,28px);font-weight:600;letter-spacing:-.02em;line-height:1.2;margin:44px 0 12px}
article h3{font-size:clamp(18px,2vw,21px);font-weight:600;letter-spacing:-.015em;line-height:1.3;margin:32px 0 10px}
article h4{font-size:17px;font-weight:600;margin:24px 0 8px}
article p,article li{color:var(--body);font-size:17px}
article p{margin-bottom:16px}
article ul,article ol{margin:0 0 18px 24px}
article li{margin-bottom:8px}
article li>ul,article li>ol{margin:8px 0 0 20px}
article a{text-decoration:underline;text-underline-offset:2px}
article strong{color:var(--ink)}
article blockquote{border-left:3px solid var(--accent);background:var(--accent-soft);padding:16px 22px;border-radius:0 12px 12px 0;margin:24px 0}
article blockquote p:last-child{margin-bottom:0}
article code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.9em;background:#fff;border:1px solid var(--line);border-radius:6px;padding:1px 6px}
article pre{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px 20px;overflow-x:auto;margin:0 0 20px;font-size:14px;line-height:1.5}
article pre code{border:0;padding:0;background:none;font-size:inherit}
article hr{border:0;border-top:1px solid var(--line);margin:40px 0}
.tbl{overflow-x:auto;margin:24px 0;border:1px solid var(--line);border-radius:12px;background:#fff}
.tbl table{border-collapse:collapse;width:100%;min-width:480px;font-size:15.5px}
.tbl th,.tbl td{text-align:left;padding:12px 16px;border-bottom:1px solid var(--line);vertical-align:top;color:var(--body)}
.tbl th{font-weight:600;color:var(--ink);background:var(--bg)}
.tbl tr:last-child td{border-bottom:0}
article figure{margin:28px 0}
article figure img,article figure svg{max-width:100%;height:auto;border-radius:12px;display:block}
article figcaption{font-size:14px;color:var(--muted);margin-top:10px}
article details{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin:0 0 16px}
article summary{cursor:pointer;font-weight:600}
.cta{background:#fff;border:1px solid var(--line);border-radius:18px;padding:28px 30px;margin:56px 0 0}
.cta h2{font-size:24px;font-weight:600;letter-spacing:-.02em;line-height:1.2;margin:0 0 8px}
.cta p{color:var(--body);font-size:16.5px;margin-bottom:18px}
.cta .disclaimer{font-size:13px;color:var(--muted);margin:18px 0 0;line-height:1.5}
.more{margin-top:48px;padding-top:32px;border-top:1px solid var(--line)}
.more h2{font-size:13px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:18px}
.more a{display:block;font-weight:600;color:var(--ink);text-decoration:none;font-size:17px;line-height:1.35}
.more a:hover{color:var(--accent)}
.more p{color:var(--muted);font-size:15px;margin:4px 0 18px}
.cards{margin-top:40px;display:grid;gap:16px;list-style:none}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px 26px}
.card .label{margin-bottom:8px}
.card h2{font-size:22px;font-weight:600;letter-spacing:-.02em;line-height:1.25;margin-bottom:8px}
.card h2 a{color:var(--ink);text-decoration:none}
.card h2 a:hover{color:var(--accent)}
.card p{color:var(--body);font-size:16px;margin-bottom:12px}
.card .meta{margin:0;padding:0;border:0;font-size:14px}
.empty{background:#fff;border:1px dashed var(--line);border-radius:18px;padding:28px;color:var(--muted);margin-top:40px}
footer{border-top:1px solid var(--line);padding:28px 0;color:var(--muted);font-size:13.5px}
footer .wrap{display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
footer a{color:var(--muted)}
footer a:hover{color:var(--ink)}
`.trim();

function headerHtml(audience, current) {
  const a = AUDIENCES[audience] || AUDIENCES.companies;
  const link = (href, text, key) => `<a href="${href}"${current === key ? ' aria-current="page"' : ''}>${text}</a>`;
  return `<header>
  <div class="nav">
    <a class="brand" href="/">${MARK} Clinical Bench</a>
    <nav class="nav-c" aria-label="Site">
      ${link('/insights/', 'Insights', 'insights')}
      ${link('/', 'For companies', 'companies')}
      ${link('/clinicians/', 'For clinicians', 'clinicians')}
    </nav>
    <a class="pill" href="${a.navCta.href}">${a.navCta.text} <span class="arw" aria-hidden="true">&rarr;</span></a>
  </div>
</header>`;
}

const FOOTER = `<footer>
  <div class="wrap">
    <span>Clinical Bench &middot; Australia</span>
    <span><a href="/privacy/">Privacy</a> &middot; <a href="/insights/rss.xml">RSS feed</a></span>
    <span>&copy; 2026</span>
  </div>
</footer>`;

function headHtml(o) {
  const lines = [
    '<!DOCTYPE html>',
    '<html lang="en-AU">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `<title>${esc(o.title)}</title>`,
    `<meta name="description" content="${esc(o.description)}">`,
    '<meta name="robots" content="index, follow">',
    `<link rel="canonical" href="${o.url}">`,
    '<link rel="alternate" type="application/rss+xml" title="Clinical Bench Insights" href="/insights/rss.xml">',
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<meta name="theme-color" content="#F7F6F2">',
    `<meta property="og:type" content="${o.ogType}">`,
    '<meta property="og:locale" content="en_AU">',
    '<meta property="og:site_name" content="Clinical Bench">',
    `<meta property="og:title" content="${esc(o.ogTitle)}">`,
    `<meta property="og:description" content="${esc(o.description)}">`,
    `<meta property="og:url" content="${o.url}">`,
    `<meta property="og:image" content="${esc(o.ogImage)}">`,
  ];
  if (o.ogImage === DEFAULT_OG) {
    lines.push('<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">');
  }
  if (o.published) lines.push(`<meta property="article:published_time" content="${isoDateTime(o.published)}">`);
  if (o.modified && o.modified !== o.published) lines.push(`<meta property="article:modified_time" content="${isoDateTime(o.modified)}">`);
  lines.push(
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${esc(o.ogTitle)}">`,
    `<meta name="twitter:description" content="${esc(o.description)}">`,
    `<meta name="twitter:image" content="${esc(o.ogImage)}">`,
  );
  for (const ld of o.jsonLd) lines.push(`<script type="application/ld+json">${jsonLd(ld)}</script>`);
  lines.push(
    '<link rel="preload" href="/assets/fonts/onest-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>',
    '<link rel="preload" href="/assets/fonts/onest-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>',
    '<style>',
    CSS,
    '</style>',
    '</head>',
  );
  return lines.join('\n');
}

function pageTitle(title) {
  const full = `${title} | Clinical Bench`;
  return full.length <= 60 ? full : title;
}

function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

function renderPost(post, all) {
  const a = AUDIENCES[post.audience];
  const blog = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: post.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': post.url },
    datePublished: isoDateTime(post.date),
    dateModified: isoDateTime(post.modified),
    author: { '@type': 'Organization', name: 'Clinical Bench', url: SITE + '/' },
    publisher: {
      '@type': 'Organization',
      name: 'Clinical Bench',
      url: SITE + '/',
      logo: { '@type': 'ImageObject', url: LOGO },
    },
    image: post.ogImage,
    keywords: post.keywords,
    articleSection: post.cluster,
    wordCount: post.words,
    inLanguage: 'en-AU',
    isPartOf: { '@type': 'CollectionPage', '@id': SITE + '/insights/', name: 'Insights' },
  };
  const crumbs = breadcrumbLd([
    { name: 'Home', url: SITE + '/' },
    { name: 'Insights', url: SITE + '/insights/' },
    { name: post.title, url: post.url },
  ]);
  const ld = [blog, crumbs];
  if (post.faq.length) {
    ld.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  const others = all.filter((p) => p.slug !== post.slug);
  const more = others.filter((p) => p.audience === post.audience).concat(others.filter((p) => p.audience !== post.audience)).slice(0, 3);
  const moreHtml = more.length
    ? `
<section class="more" aria-labelledby="more-h">
  <h2 id="more-h">More from the bench</h2>
${more.map((p) => `  <a href="${p.path}">${esc(p.title)}</a>
  <p>${esc(p.description)}</p>`).join('\n')}
</section>`
    : '';

  const head = headHtml({
    title: pageTitle(post.title),
    ogTitle: post.title,
    description: post.description,
    url: post.url,
    ogType: 'article',
    ogImage: post.ogImage,
    published: post.date,
    modified: post.modified,
    jsonLd: ld,
  });

  const updatedNote = post.updated && post.updated !== post.date ? ` &middot; Updated ${longDate(post.updated)}` : '';

  return `${head}
<body>

${headerHtml(post.audience, 'insights')}

<main>
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/insights/">Insights</a> / ${esc(post.title)}</nav>
    <span class="label">${a.label}</span>
    <h1>${esc(post.title)}</h1>
    <p class="meta"><time datetime="${post.date}">${longDate(post.date)}</time>${updatedNote} &middot; ${post.minutes} min read</p>

<article>
${post.html}
</article>

<aside class="cta">
  <h2>${a.box.heading}</h2>
  <p>${a.box.body}</p>
  <a class="pill" href="${a.box.href}">${a.box.cta} <span class="arw" aria-hidden="true">&rarr;</span></a>
  <p class="disclaimer">${DISCLAIMER}</p>
</aside>
${moreHtml}
  </div>
</main>

${FOOTER}

</body>
</html>
`;
}

const INDEX_DESCRIPTION = 'Practical articles on commissioning Australian clinicians for product testing, advisory boards and AI evaluation, plus paid commercial work for clinicians.';

function renderIndex(posts) {
  const url = SITE + '/insights/';
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url,
    name: 'Insights',
    headline: 'Insights from Clinical Bench',
    description: INDEX_DESCRIPTION,
    url,
    inLanguage: 'en-AU',
    isPartOf: { '@type': 'WebSite', name: 'Clinical Bench', url: SITE + '/' },
    publisher: { '@type': 'Organization', name: 'Clinical Bench', url: SITE + '/', logo: { '@type': 'ImageObject', url: LOGO } },
    hasPart: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: p.url,
      datePublished: isoDateTime(p.date),
      dateModified: isoDateTime(p.modified),
    })),
  };
  const crumbs = breadcrumbLd([
    { name: 'Home', url: SITE + '/' },
    { name: 'Insights', url },
  ]);
  const head = headHtml({
    title: pageTitle('Insights'),
    ogTitle: 'Insights from Clinical Bench',
    description: INDEX_DESCRIPTION,
    url,
    ogType: 'website',
    ogImage: DEFAULT_OG,
    jsonLd: [collection, crumbs],
  });

  const list = posts.length
    ? `<ul class="cards">
${posts.map((p) => `  <li class="card">
    <span class="label">${AUDIENCES[p.audience].short}</span>
    <h2><a href="${p.path}">${esc(p.title)}</a></h2>
    <p>${esc(p.description)}</p>
    <p class="meta"><time datetime="${p.date}">${longDate(p.date)}</time> &middot; ${p.minutes} min read</p>
  </li>`).join('\n')}
</ul>`
    : `<div class="empty">
      <p>First articles are on their way. Subscribe to the <a href="/insights/rss.xml">RSS feed</a> to catch them as they are published.</p>
    </div>`;

  return `${head}
<body>

${headerHtml('companies', 'insights')}

<main>
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> / Insights</nav>
    <h1>Insights</h1>
    <p class="intro">Short, practical articles from Clinical Bench. For teams building healthcare products, how to commission clinicians well. For doctors, nurses and allied health, what paid commercial work looks like.</p>
    ${list}
  </div>
</main>

${FOOTER}

</body>
</html>
`;
}

function renderRss(posts) {
  const items = posts.map((p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${p.url}</link>
      <guid isPermaLink="true">${p.url}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`);
  const lastBuild = posts.length ? `\n    <lastBuildDate>${rfc822(posts[0].modified)}</lastBuildDate>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Clinical Bench Insights</title>
    <link>${SITE}/insights/</link>
    <description>${esc(INDEX_DESCRIPTION)}</description>
    <language>en-au</language>
    <atom:link href="${SITE}/insights/rss.xml" rel="self" type="application/rss+xml"/>${lastBuild}
${items.join('\n')}${items.length ? '\n' : ''}  </channel>
</rss>
`;
}

function renderSitemap(posts) {
  const newest = posts.length ? posts.reduce((m, p) => (p.modified > m ? p.modified : m), posts[0].modified) : STATIC_LASTMOD;
  const url = (loc, lastmod, freq, pri) =>
    `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`;
  const rows = [
    url(SITE + '/', STATIC_LASTMOD, 'monthly', '1.0'),
    url(SITE + '/clinicians/', STATIC_LASTMOD, 'monthly', '0.8'),
    url(SITE + '/privacy/', STATIC_LASTMOD, 'yearly', '0.3'),
    url(SITE + '/insights/', newest, 'weekly', '0.7'),
    ...posts.map((p) => url(p.url, p.modified, 'monthly', '0.6')),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join('\n')}
</urlset>
`;
}

function renderLlms(existing, posts) {
  const lines = existing.split('\n');
  const section = ['## Insights'];
  if (posts.length) {
    for (const p of posts) section.push(`- [${p.title}](${p.url}): ${p.description}`);
  } else {
    section.push(`- No articles published yet. Index: ${SITE}/insights/`);
  }
  const start = lines.findIndex((l) => /^## Insights\s*$/.test(l));
  if (start >= 0) {
    let end = start + 1;
    while (end < lines.length && !/^## /.test(lines[end])) end++;
    const tail = end < lines.length ? [''] : [];
    lines.splice(start, end - start, ...section, ...tail);
  } else {
    const contact = lines.findIndex((l) => /^## Contact\s*$/.test(l));
    if (contact >= 0) lines.splice(contact, 0, ...section, '');
    else lines.push('', ...section);
  }
  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

function preview() {
  const arg = process.argv[process.argv.indexOf('--preview') + 1];
  if (!arg || arg.startsWith('--')) fail('usage: node build.js --preview <path-to-draft.md>');
  const abs = path.resolve(process.cwd(), arg);
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) fail(`${arg}: file not found`);
  if (!abs.endsWith('.md')) fail(`${arg}: expected a .md file`);
  const file = path.relative(ROOT, abs).split(path.sep).join('/');
  const draft = loadPost(abs, file, { anyStatus: true });
  const published = loadPosts().filter((p) => p.slug !== draft.slug);
  const out = path.join(PREVIEW_DIR, draft.slug + '.html');
  fs.mkdirSync(PREVIEW_DIR, { recursive: true });
  fs.writeFileSync(out, renderPost(draft, published), 'utf8');
  console.log(`preview ${path.relative(ROOT, out).split(path.sep).join('/')} (status: ${draft.status}, ${draft.words} words, ${draft.minutes} min read)`);
}

function main() {
  if (PREVIEW && CHECK) fail('--preview and --check cannot be combined');
  if (PREVIEW) return preview();
  const posts = loadPosts();
  const llmsPath = path.join(ROOT, 'llms.txt');
  if (!fs.existsSync(llmsPath)) fail('llms.txt is missing at the repo root');

  const outputs = new Map();
  for (const p of posts) outputs.set(path.posix.join('insights', p.slug, 'index.html'), renderPost(p, posts));
  outputs.set('insights/index.html', renderIndex(posts));
  outputs.set('insights/rss.xml', renderRss(posts));
  outputs.set('sitemap.xml', renderSitemap(posts));
  outputs.set('llms.txt', renderLlms(fs.readFileSync(llmsPath, 'utf8'), posts));

  const keep = new Set(posts.map((p) => p.slug));
  const stale = fs.existsSync(OUT_DIR)
    ? fs.readdirSync(OUT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory() && !keep.has(d.name)).map((d) => d.name)
    : [];

  const changed = [];
  for (const [rel, content] of outputs) {
    const abs = path.join(ROOT, rel);
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
    if (current !== content) changed.push(rel);
  }
  for (const d of stale) changed.push(`insights/${d}/ (stale, would be removed)`);

  if (CHECK) {
    if (changed.length) {
      console.error('build.js --check: the build would change these files:');
      for (const c of changed) console.error('  ' + c);
      process.exit(1);
    }
    console.log(`build.js --check: up to date (${posts.length} published post${posts.length === 1 ? '' : 's'})`);
    return;
  }

  for (const [rel, content] of outputs) {
    const abs = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content, 'utf8');
    console.log(`${changed.includes(rel) ? 'write' : 'same '} ${rel}`);
  }
  for (const d of stale) {
    fs.rmSync(path.join(OUT_DIR, d), { recursive: true, force: true });
    console.log(`rm    insights/${d}/`);
  }
  console.log(`done: ${posts.length} published post${posts.length === 1 ? '' : 's'}, ${changed.length} file${changed.length === 1 ? '' : 's'} changed`);
}

main();
