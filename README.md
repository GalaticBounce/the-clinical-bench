# Clinical Bench — deployable site

Static site for Cloudflare Pages, plus one Pages Function for the enquiry form.
No external CDNs: fonts and JS libraries are self-hosted and version-pinned.

## Structure

```
index.html                 the site (45 KB, no external dependencies)
_headers                   security + caching policy (Cloudflare Pages)
favicon.svg
apple-touch-icon.png
robots.txt
sitemap.xml
assets/js/                 gsap 3.12.5, ScrollTrigger, lenis 1.1.18 (pinned)
assets/fonts/              Onest 400/500/600/700, latin subset (woff2)
assets/img/                responsive webp + jpg at 480/768/1280, plus og.jpg
functions/api/enquiry.ts   form endpoint: Turnstile verify + Resend send
```


## Getting this into GitHub

This folder is already a git repository with one commit. To publish it:

```bash
# 1. Create an empty repo on GitHub (no README, no .gitignore, no licence)
#    https://github.com/new  ->  name it clinical-bench

# 2. From inside this folder:
git remote add origin https://github.com/YOUR-USERNAME/clinical-bench.git
git push -u origin main
```

If you prefer the GitHub CLI, `gh repo create clinical-bench --private --source=. --push`
does the same in one line.

### Then connect Cloudflare Pages

1. Cloudflare dashboard > Workers and Pages > Create > Pages > Connect to Git
2. Pick the repo. Build command: **none**. Build output directory: **/**
3. Add the environment variables listed above, then add the custom domain.

Every push to `main` deploys automatically. Pull requests get preview URLs.

### Keep secrets out of git

`.gitignore` already excludes `.env`, `.dev.vars` and `node_modules`. API keys belong
in the Cloudflare Pages dashboard as encrypted environment variables, never in a file
in this repo.

## Deploy

1. Push this directory to a Git repository.
2. Cloudflare dashboard, Workers and Pages, Create, Pages, connect the repo.
3. Build command: none. Build output directory: the folder containing `index.html`.
4. Add the custom domain under the project's Custom domains tab.

Cloudflare detects `functions/` automatically and deploys `/api/enquiry`.

## Before the form works

Set these in Pages, Settings, Environment variables. Mark the two keys as secrets.

| Variable | Value |
| --- | --- |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `RESEND_API_KEY` | Resend key, "Sending access" only |
| `ENQUIRY_TO` | inbox that receives enquiries |
| `ENQUIRY_FROM` | verified sender, for example website@theclinicalbench.com |

Then replace `TURNSTILE_SITE_KEY` in `index.html` with the real Turnstile site key.

Verify SPF, DKIM and DMARC in Resend before launch, or enquiries will land in spam.
Test the live form end to end and check the message arrives.

## Cost guardrails

- Static requests are unmetered on Pages. Only `/api/enquiry` consumes Workers
  quota (free plan: 100,000 requests per day, shared across Workers and Functions).
- Add a Cloudflare rate-limiting rule on `/api/*` (for example 5 requests per
  minute per IP) so a spam flood cannot burn quota or email credits.
- Set a monthly send cap in Resend.
- The Turnstile widget plus the honeypot field stop nearly all automated submissions.

## Domain

Registered: **theclinicalbench.com** (Porkbun). The bare domain is canonical;
www redirects to it.

DNS and redirect setup:
1. In Porkbun, point the nameservers at Cloudflare (Cloudflare gives you the two
   NS records when you add the site).
2. In Cloudflare Pages, add both `theclinicalbench.com` and `www.theclinicalbench.com`
   as custom domains.
3. Create a Redirect Rule (Rules > Redirect Rules) sending `www` to the bare domain
   with a 301, preserving path and query string. `_redirects` cannot do this because
   it matches on path only.
4. Add the Resend DNS records (SPF, DKIM, DMARC) before sending any mail.

## Placeholders to confirm
- The `~25%` market figure is unverified and currently labelled an industry
  estimate. Substantiate it or remove it before launch.
- No privacy policy page exists yet. The form collects personal data, so this is
  required under the Australian Privacy Act.
- The clinician recruiting page is not built. "For clinicians" links currently
  point at a mailto.

## Editing assets later

`/assets/*` is cached immutably for a year. If you change an image or a library,
rename the file or append `?v=2`, otherwise returning visitors keep the old copy.
