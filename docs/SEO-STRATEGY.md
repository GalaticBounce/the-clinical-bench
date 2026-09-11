# Clinical Bench: SEO and LLM search strategy

Version 1, 11 September 2026. Read `BUSINESS-ANALYSIS.md` for the reasoning. Read
`ROUTINE.md` for how the daily runner executes this. Not served publicly.

## Goal

Get theclinicalbench.com found, cited and clicked by two readers: a person at a company
building a health product who needs clinical judgement, and an Australian clinician who
wants paid work that is not another shift. "Found" means Google and Bing organic. "Cited"
means named in ChatGPT, Perplexity, Claude, Copilot and Google AI answers to the questions
in `content/queries.yaml`.

## The four levers, in order of expected return

### 1. Answer-first articles, two a week

The `/insights/` section is the engine. Each post is built to be lifted by an answer
engine and ranked by a web engine at the same time:

- Opens with a quotable definition or direct answer in 70 words or fewer, before any heading
- Headings carry the language a reader types
- At least one table or list, because structured content is what LLMs extract accurately
- A `## Common questions` section of two or more `### ...?` items, emitted as FAQPage schema
- A close that puts a question to the reader about their own situation, then the CTA
- 800 words or more of prose, title 60 characters or fewer, meta 140 to 160
- Every percentage or currency figure sits in a paragraph that links its source
- No named clinicians, no clients, no testimonials, no invented numbers
- Australian English, no em dashes, no comma before "and", no puffery

Cadence: Tuesday and Thursday, alternating companies and clinicians. The calendar runs to
10 December 2026 and the runner warns when it is under six weeks from the end.

Clusters, by buyer problem rather than by service name:

| Cluster | Reader | Why it earns a place |
|---|---|---|
| product-testing | companies | The service that is "available now"; the clearest buyer question |
| medical-ai-evaluation | companies | The flagship; global demand; onshore angle nobody else can claim |
| advisory-boards | companies | Named query with intent; MDisrupt owns it globally, nobody locally |
| regulatory | companies | TGA SaMD and AI guidance are live 2026 topics with enforcement behind them |
| buying-guide, briefing | companies | Comparison and how-to-brief pages convert; they also define the category |
| ai-evaluation-work, annotation-work | clinicians | Highest real search volume in the whole map |
| side-income, advisory-work | clinicians | Uncontested Australian questions (AHPRA, indemnity, pay) |
| discipline pages (physio, pharmacy, psychology) | clinicians | Long tail, cheap to rank, feeds the bench |

### 2. Technical and structural SEO

Already strong. The runner keeps it that way with a weekly audit (`seo_audit.py`) and
fixes anything mechanical inside generated files itself. Changes made on 11 September:

- `build.js` generates post pages, the insights index, `rss.xml`, `sitemap.xml` with
  `lastmod`, and the Insights section of `llms.txt`
- BlogPosting, BreadcrumbList and FAQPage JSON-LD on every post; Organization logo fixed
- `robots.txt` names each AI crawler and allows it, so the policy is a decision on record
- IndexNow key file at the root; every publish pings Bing and partners
- `/content/` and `/docs/` return 404 through a Pages Function so sources stay private
- Insights link in both hand-authored navs and footers

Still to do by hand (Jamie):

| Task | Why | Effort |
|---|---|---|
| Cloudflare Web Analytics: enable auto-inject for the Pages site | Cookieless pageviews and referrers; the only way to see what works | 5 min |
| Google Search Console: verify the domain (DNS TXT), submit sitemap | Impressions, queries, index coverage. Without it the routine is blind | 15 min |
| Bing Webmaster Tools: verify, submit sitemap | Bing feeds ChatGPT search and Copilot | 10 min |
| Fix two `href="#"` footer links (Australia, Terms) | Dead links are a crawl and accessibility wart | 5 min |
| Add LinkedIn company page to Organization `sameAs` | Entity confirmation for knowledge graphs and LLMs | 5 min |
| Confirm entity name and ABN on privacy page and schema | Entity trust | 10 min |

### 3. LLM appearance (generative engine optimisation)

What answer engines reward, and what the site now does about it:

| What engines reward | Implementation |
|---|---|
| A crawlable, clearly described entity | `llms.txt` describes the business and lists every page; Organization and ProfessionalService schema; robots allows every AI crawler |
| Pages that answer a question directly | Answer-first opening, gated to 70 words; FAQ schema on every post |
| Consistent naming and claims across sources | The same one-sentence definition of Clinical Bench in llms.txt, schema, home FAQ and each post's CTA |
| Fresh, dated, attributed content | `datePublished` and `dateModified` on every post; sources linked inline |
| Presence in Bing's index | IndexNow on publish; Bing Webmaster (manual) |
| Being mentioned elsewhere | Off-site: LinkedIn posts, directory listings (Talking HealthTech, ANDHealth network, MedTech Actuator community). Out of the runner's scope, listed for Jamie |

Measured weekly by Job G: the runner searches each query in `content/queries.yaml`, records
whether the site appears and which domains hold the top results, and logs it to
`docs/visibility-log.md`. The four LLM prompts are recorded the same way through search
and, once a quarter, by asking the assistants directly.

### 4. Conversion on the pages we already have

Every post ends with the audience's CTA (enquiry form or clinician application) and three
related posts. The home page FAQ already carries FAQPage schema. When the first ten posts
are live, the next structural step is service pages: `/product-testing/`,
`/medical-ai-evaluation/`, `/advisory-boards/`, `/for-clinicians/ai-evaluation/`. They are
not in scope for the runner; they are a design job, and the posts will show which ones
deserve a page.

## What the routine does not do

- It never approves its own draft. Jamie approves with one command.
- It never invents a news peg, a statistic, a clinician or a client.
- It never touches `index.html` or `clinicians/index.html`; it reports faults there.
- It never posts to social media. There is no LinkedIn integration yet.
- It never gives legal, regulatory or clinical advice. Every post carries a
  general-information disclaimer and a gate rejects absolute legal statements. The
  liability position behind this is in `LIABILITY-REVIEW.md`.
- It cannot read analytics until Search Console and Web Analytics exist. Until then every
  report says so rather than guessing.

## Success measures

| Horizon | Measure | Source |
|---|---|---|
| 30 days | 6 posts live, all indexed in Google and Bing; visibility log started | Search Console, Bing Webmaster, Job G |
| 90 days | 24 posts live; site appears for at least 5 of the 20 tracked queries; first enquiry or application attributable to a post | Search Console queries, form referrers |
| 180 days | Named in at least one AI assistant answer to a tracked prompt; 3 or more posts on page one for their intent | Manual prompt checks, Search Console |
