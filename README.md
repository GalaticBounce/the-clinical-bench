# Clinical Bench — deployable site

Static site for Cloudflare Pages, plus two Pages Functions for the enquiry and clinician forms.
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
functions/api/enquiry.ts   enquiry form endpoint: Turnstile verify + SMTP2GO send
functions/api/clinician.ts clinician application endpoint: Turnstile verify + SMTP2GO send
```


## Getting this into GitHub

This folder is already a git repository with one commit. To publish it:

Repository: <https://github.com/GalaticBounce/the-clinical-bench>

The remote is already configured. From inside this folder:

```bash
git push -u origin main
```

If the GitHub repo was created with a README or licence, the histories will differ.
Either start it empty, or force the first push (safe here, the remote has nothing worth keeping):

```bash
git push -u origin main --force
```

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

Cloudflare detects `functions/` automatically and deploys `/api/enquiry` and `/api/clinician`.

## Before the forms work

Set these in Pages, Settings, Environment variables. Mark the API key as a secret.

| Variable | Value |
| --- | --- |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `SMTP2GO_API_KEY` | SMTP2GO API key, sending-only |
| `ENQUIRY_TO` | inbox that receives enquiries |
| `ENQUIRY_FROM` | verified sender, for example website@theclinicalbench.com |
| `APPLY_TO` | inbox that receives clinician applications |
| `APPLY_FROM` | verified sender, for example website@theclinicalbench.com |

Then replace `TURNSTILE_SITE_KEY` in `index.html` and `clinicians/index.html` with the real Turnstile site key.

Verify SPF, DKIM and DMARC for SMTP2GO before launch, or messages will land in spam.
Inbound mail for the domain stays with Porkbun's forwarding; SMTP2GO is outbound-only.
Test both live forms end to end and check the messages arrive.

## Cost guardrails

- Static requests are unmetered on Pages. Only `/api/enquiry` and `/api/clinician`
  consume Workers quota (free plan: 100,000 requests per day, shared across Workers
  and Functions).
- Add a Cloudflare rate-limiting rule on `/api/*` (for example 5 requests per
  minute per IP) so a spam flood cannot burn quota or email credits.
- Set a monthly send cap in SMTP2GO.
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
4. Add the SMTP2GO DNS records (SPF, DKIM, DMARC) before sending any mail. Porkbun's
   existing MX records handle inbound mail and are untouched by this.

## Placeholders to confirm
- The `~25%` market figure is unverified and currently labelled an industry
  estimate. Substantiate it or remove it before launch.
- The privacy policy at `/privacy/` is a draft pending legal review. Do not present
  it as final until it has been signed off.

## Editing assets later

`/assets/*` is cached immutably for a year. If you change an image or a library,
rename the file or append `?v=2`, otherwise returning visitors keep the old copy.
