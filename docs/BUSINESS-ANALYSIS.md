# Clinical Bench: business, competitive and search-market analysis

Written 11 September 2026 from the live site, the repo, and desk research. Every external
figure carries its source. Where a number could not be verified it is marked as such.
This document is the reasoning behind `SEO-STRATEGY.md` and the content calendar. It is
not served publicly: `/docs/` returns 404 on the live site.

## 1. What the business is

Clinical Bench is a two-sided Australian marketplace. Companies building health products
commission registered doctors, nurses and allied health professionals for commercial work
outside patient care: product testing, advisory boards, workflow mapping, regulatory and
quality input, medical writing, due diligence and clinician-in-the-loop evaluation of
medical AI. Clinicians apply once, are registration-checked, and take fixed-fee
engagements that fit around a roster.

The site says four things that shape everything below:

| Claim on the site | What it commits us to |
|---|---|
| Matched in days, not months | Speed is the wedge. Content should make the brief-to-match path visible |
| Fixed price per engagement | Predictability against hourly expert networks and open-ended consulting |
| Onshore, registration-checked, private input | Compliance and credibility. Never a testimonial or an endorsement |
| Not a CRO, no clinical trials | A boundary to repeat in every piece, because the nearest search neighbours are CROs |

Positioning in one line: the local, verified, fixed-price bench for commercial clinical
judgement, between a survey panel (cheap, anonymous, shallow) and an expert network or
consultancy (expensive, slow, over-scoped).

### The state of the site on 11 September 2026

- Three indexable pages: home, `/clinicians/`, `/privacy/`. No blog, no service pages.
- Technical base is strong: self-hosted fonts and JS, strict CSP, HSTS preload, valid
  Organization, ProfessionalService and FAQPage JSON-LD, canonical tags, `llms.txt`, sitemap,
  `www` to apex 301, sub-500 ms responses from Sydney.
- No analytics of any kind. The Cloudflare Web Analytics beacon is commented out with a
  placeholder token. No Search Console, no Bing Webmaster. Nothing measures anything.
- Two dead `href="#"` links in the home footer (Australia, Terms).
- The `~25%` market figure noted in the README has been replaced on the page with the
  Grand View Research 27.5% CAGR, correctly labelled. That is fine.
- Cloudflare Pages deploys on push to `main`. Build command none. So generated pages must
  be committed, which is what `build.js` now does.

## 2. The market

### Buyers

Australia's healthtech sector is large enough to matter and growing fast. Tracxn counts
4,120 healthtech companies in Australia, 476 of them funded and 198 at Series A or later
([Tracxn](https://tracxn.com/d/explore/healthtech-startups-in-australia/__uWo5p7ZSWG2KBnJ_IS-UOwqUhvcdBplCGK1RYEfZneo)).
ANDHealth reports the digital and connected health sector has grown at a 55 per cent
compound rate since 2018, with company numbers nearly doubling in three years
([ANDHealth via Talking HealthTech](https://www.talkinghealthtech.com/news/five-australian-digital-and-connected-health-companies-to-share-in-up-to-9-million-to-tackle-top-australian-health-issues)).

Two regulatory movements push those companies toward clinician input at the exact moment
they are searching for it:

- The TGA published updated guidance on AI-enabled medical device software on
  5 February 2026, requiring documented clinical validation and stating that synthetic data
  cannot replace real-world clinical data
  ([RegASK summary](https://regask.com/australia-tga-updates-guidance-on-ai-enabled-medical-device-software-and-artg-evidence-requirements/),
  [Clayton Utz](https://www.claytonutz.com/insights/2026/july/healthcare-software-tga-clarifies-when-ai-will-be-regulated-as-a-medical-device)).
- Software as a medical device is one of twelve TGA compliance and enforcement priorities
  for 2026 and 2027 ([Pure Global](https://www.pureglobal.com/news/australia-tga-2026-guidance-on-ai-medical-software-regulation)).

Beyond local startups, the site's flagship line is medical AI evaluation. The global
healthcare data annotation market is forecast to grow from USD 167.4 million in 2023 to
USD 916.8 million in 2030 (Grand View Research, quoted on the site). The 2026 shift in that
market is that foundation models pre-label routine data and human work concentrates on
edge cases and regulated domains where credentialed judgement is required
([Lightly](https://www.lightly.ai/blog/best-data-annotation-companies)). That is exactly
the work a registration-checked, onshore bench sells.

### Supply

Clinicians are searching for this work far more than companies are searching for
clinicians. Google's own autocomplete for Australian users shows the shape:

| Seed typed | Autocomplete returns |
|---|---|
| medical ai evaluation | medical ai evaluation jobs, medical ai review jobs, medical expert ai evaluation |
| clinical annotation | clinical annotation jobs, clinical annotation jobs work from home, clinical data annotation jobs remote |
| medical expert for ai | medical expert for ai training, medical consultant for ai companies, medical expert ai trainer jobs |
| clinical subject matter expert | clinical subject matter expert jobs, clinical subject matter expert salary |
| clinical safety review | clinical safety reviewer jobs, medical safety reviewer jobs remote |
| ahpra registered | ahpra registered nurse, ahpra registered doctors, ahpra registered practitioners |

Every one of those clusters is a clinician looking for paid non-clinical work. The global
platforms (Mercor, Outlier, Sermo, M3) are what they find today, and Mercor's own material
puts credentialed medical experts at USD 50 to 180 an hour
([Mercor](https://www.mercor.com/experts/healthcare/)), with third-party reviews citing
USD 90 to 250 ([HeroHunt](https://www.herohunt.ai/blog/mercor-2026-how-it-works-pay-alternatives/)).
Outlier's expert tier is cited at USD 30 to 60
([The AI Rankings](https://theairankings.com/guides/ai-training-jobs/)).

Why this matters for SEO: a marketplace needs both sides, the clinician side has the search
volume, and nobody Australian is writing for it. Roughly 40 per cent of the calendar is
clinician-facing for that reason.

### What the buyer queries look like

Buyer-side autocomplete is thin and generic ("hire doctors for hospital", "clinical
advisory board purpose"). The buyer does not yet have a name for the thing. That is normal
for a category-creating service and it changes the content job: buyer posts must answer the
problem the buyer has ("how do I get clinicians to test my app", "do I need clinical
validation for a TGA submission", "how much should I pay a clinical advisor") rather than
the category name. Where buyer queries do exist with a name, they are these:

- medical device usability testing (services, FDA, report example)
- clinical advisory board (purpose, member, how to build)
- clinician in the loop ai, physician in the loop ai
- healthcare ai training data
- clinical due diligence (checklist)
- aged care consultant (by city)

**Search volumes are not verified.** Ahrefs and Similarweb connectors are not authorised in
this environment, so no monthly volume figures appear in this document. Autocomplete
presence is used as the proxy for demand. Verifying volumes is a one-hour task once a
keyword tool is connected, and the calendar should be re-ranked when it is.

## 3. Competitors

Nobody does exactly what Clinical Bench does in Australia. The competition is five
adjacent categories, each of which a buyer or clinician will meet in search before they
meet us.

| Category | Who | What they say | Where we differ | Threat to search |
|---|---|---|---|---|
| Expert marketplace, US | [MDisrupt](https://mdisrupt.com/) | 4,000+ vetted health experts, AI matching, fractional roles, and since January 2026 "Health Expert in the Loop" for AI training and validation ([Business Wire](https://www.businesswire.com/news/home/20260108529541/en/)) | US payer and regulatory focus, platform access fee, hourly and fractional pricing. We are onshore, AHPRA-checked, fixed fee | High on buyer terms globally, low in Australia |
| AI-labour marketplaces | [Mercor](https://www.mercor.com/experts/healthcare/), Outlier, Micro1 | High hourly rates, remote, global, open to AU clinicians | They are the clinician's default for AI work. We compete on scoped engagements, local contracting, no platform screening theatre | High on clinician terms |
| Expert networks | GLG (225,000 healthcare professionals), Guidepoint, AlphaSights, Third Bridge | 30 to 60 minute paid calls for investors and corporates | Enterprise pricing, no product testing, no ongoing evaluation work | Medium |
| Physician communities and panels | Sermo (1m+ HCPs), M3 | Paid surveys, anonymous, global | We are named, onshore and accountable for a deliverable | Low on buyer terms, medium on clinician terms |
| Australian clinical recruiters and consultancies | [Clinical Advisors](https://www.clinicaladvisors.com.au/) (CMO and medical director placement, pre-paid strategy sessions), Healthcare Australia advisory, Biointelect, Panoptic (CRO and trials) | Placement, senior roles, trials | They sell people or trials. We sell scoped judgement in days. Clinical Advisors is the closest local name and it is recruiting, not a bench | Medium on "clinical advisor" terms |
| Medical annotation vendors | iMerit, Shaip, Doctors in the Loop, Applied Clinical Judgement (UK) | Credentialed annotators at scale, US and UK | Offshore or foreign, volume-priced. Our angle is onshore Australian data handling and Privacy Act fit | Medium on "medical data annotation" |

Two observations from reading their pages:

1. **MDisrupt is the model to learn from, not to fear.** It has service pages for every
   engagement type, a resource centre, and named case studies. Its search footprint is why
   it appears for "clinician advisory board on demand". Clinical Bench has one page.
2. **No Australian site owns the clinician-side questions.** "Does consulting work affect
   my AHPRA registration", "how much does clinical advisory work pay in Australia", "clinical
   annotation jobs Australia". The results are US blogs and job boards. That is the open
   ground.

## 4. Where Clinical Bench stands in search today

- Google's web index has the home page and returns it for a branded search and for the
  autocomplete-adjacent query "hire clinicians for medical AI evaluation Australia"
  (observed through the WebSearch tool on 11 September 2026, which also surfaced Mercor,
  Doctors in the Loop and Applied Clinical Judgement for the same query).
- For "clinician advisory board on demand healthtech" the home page appears alongside
  MDisrupt. Good sign: the schema and copy are doing work with only one page.
- DuckDuckGo's HTML endpoint returned no results for `site:theclinicalbench.com` from this
  machine. Bing index status is therefore unconfirmed. Bing feeds ChatGPT search and
  Copilot, so this is the first thing to fix: IndexNow key is now in the repo, and Bing
  Webmaster verification is a manual step for Jamie.
- No page on the site answers a question. Every LLM answer engine cites pages that answer
  the question asked. The FAQ schema is the only such content.

## 5. What this means

1. **Content is the whole opportunity.** Technical SEO is already near the ceiling for a
   three-page site. Growth comes from pages that answer buyer problems and clinician
   questions, two a week, gated for quality, each with FAQ schema and an answer-first
   opening so AI engines can lift it.
2. **Write for both sides, clinicians slightly less than buyers.** Buyers pay; clinicians
   are the supply that lets us say "matched in days". Clinician posts also rank sooner,
   because the queries are real and uncontested locally.
3. **Own the compliance angle.** TGA guidance, Privacy Act, AHPRA, indemnity. US
   competitors cannot write these credibly. They are the moat in search.
4. **Measure before the first post ships.** Cloudflare Web Analytics (cookieless, no
   banner), Google Search Console, Bing Webmaster. All free, all manual, all on Jamie.
5. **Never invent proof.** No named clinicians, no case studies until there are real ones
   with written consent, no invented percentages. The gates enforce this mechanically.

## 6. Open questions for Jamie

- Is there a LinkedIn company page? None is linked from the site or schema. If one exists
  it should go in `sameAs`; if not, it is worth creating before the first post.
- Confirm the legal entity name and ABN for the Organization schema and the privacy page.
- Are there any completed engagements that could become an anonymised worked example? One
  real example beats twenty posts.
- Which of the twelve disciplines on the bench actually has depth today? The calendar should
  write to the ones that can be delivered.
