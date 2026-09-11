# The routine, in one page

The daily runner is the scheduled task `clinical-bench-seo-publisher`. Its full spec is
`~/.claude/scheduled-tasks/clinical-bench-seo-publisher/SKILL.md` and its scripts sit
beside it. This page is the orientation for a person.

## What happens on a weekday wake

1. **Preflight.** Every script, every selftest, the calendar, the repo state, the live site.
   Prints which jobs may run. A dirty or unpushed repo blocks releasing but not drafting.
2. **Job B, release.** If a draft is `approved` and its `publish_on` is today or earlier,
   the runner re-reads it, gates it, publishes it (move, build, commit, push), waits until
   the live page serves today's date, pings IndexNow, marks the slot published.
3. **Job A, draft.** If a calendar slot is 4 to 10 days out and still `backlog`, the runner
   researches the queries on the slot, fetches its sources, writes the post, gates it, builds
   a preview, leaves it at `ready for review`, and commits the draft.
4. **Mondays only.** Job T runs the technical SEO audit and logs it. Job G searches every
   tracked query and logs where the site appears.

## What Jamie does

| When | Command or action |
|---|---|
| A draft is waiting | Read `content/drafts/<slug>.md` (or the preview HTML). Then `python3 ~/.claude/scheduled-tasks/clinical-bench-seo-publisher/calendar.py approve <slug>` |
| A draft is wrong | `calendar.py reject <slug> "what is wrong"`. The runner redrafts if the slot is still in its window |
| The calendar is running out | Add slots to `content/calendar.yaml`. Copy an existing block |
| A hand-page fault is logged in `docs/seo-issues.md` | Fix `index.html` or `clinicians/index.html` by hand |
| Once, soon | Enable Cloudflare Web Analytics, verify Google Search Console and Bing Webmaster, submit the sitemap |

The runner never sets `approved`. Nothing reaches the live site without that one command.

## Where things are

| Thing | Path |
|---|---|
| Spec | `~/.claude/scheduled-tasks/clinical-bench-seo-publisher/SKILL.md` |
| Strategy and analysis | `docs/SEO-STRATEGY.md`, `docs/BUSINESS-ANALYSIS.md` |
| Calendar | `content/calendar.yaml` |
| Tracked queries | `content/queries.yaml` |
| Drafts | `content/drafts/` |
| Published sources | `content/insights/` |
| Logs | `docs/visibility-log.md`, `docs/seo-issues.md`, `docs/seo-audit-latest.json` |
