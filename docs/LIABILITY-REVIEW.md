# Clinical Bench: liability and legal exposure review

Written 11 September 2026 at Jamie's request to maximise protection before the business
introduces registered practitioners to companies at scale. This is desk research by a
non-lawyer, with sources linked, organised so a lawyer can confirm or correct each line
quickly. It is not legal advice. Not served publicly.

The model under review: Clinical Bench contracts with a company, scopes a fixed-fee
engagement, selects a registration-checked clinician, the clinician does the work
(mostly remote), Clinical Bench handles contracting and invoicing and pays the clinician.
The site says exactly this on `/clinicians/` ("We handle the contracting and invoicing").

## Summary: the six exposures that matter, ranked

| # | Exposure | Severity | Likelihood | Why it ranks here |
|---|---|---|---|---|
| 1 | **Labour hire licensing** in QLD, VIC, SA and the ACT if engagements look like supplying a worker rather than delivering an outcome | High: criminal penalties, unlicensed operation is an offence | Medium | The site describes contracting and paying clinicians who do "ongoing work of a few hours a week" for clients. That reads as supply of labour to a regulator |
| 2 | **Superannuation guarantee** on payments to clinicians engaged as individuals for their personal labour | Medium: 12% plus charge and penalties, retrospective | High | Contracts wholly or principally for labour with no right to delegate are deemed employment for SG |
| 3 | **Uninsured advice**: a clinician's professional indemnity does not cover the commercial work, and Clinical Bench holds no PI of its own | High | Medium | Ahpra treats advisory work as "practice" requiring PII, but standard practitioner policies may not cover industry consulting |
| 4 | **Endorsement and advertising law**: a client uses clinician input in advertising a therapeutic good | High for the client, reputational and contractual for us | Medium | The Therapeutic Goods Advertising Code bans health-practitioner endorsements outright |
| 5 | **No contracts, no terms, no entity on the site** | High | Certain today | The footer says "Working identity"; the Terms link goes nowhere; no client terms or clinician agreement exist in the repo |
| 6 | **Privacy**: clinician registration data and possibly patient data in AI evaluation work | Medium | Medium | The policy is a draft and until today did not mention clinician applications at all |

Everything else (consumer law, transparency reporting, payroll tax, business name, content
liability) is real but lower order and is covered in section 3.

## 1. The exposures in detail

### 1.1 Labour hire licensing

Four jurisdictions license labour hire providers, and each scheme is broad. Queensland's
Act applies where a person, in the course of carrying on a business, supplies a worker to
another person to do work; a worker is an individual the provider has an arrangement with
and is obliged to pay
([Labour Hire Licensing Queensland](https://www.labourhire.qld.gov.au/licensing),
[Corrs](https://www.corrs.com.au/insights/what-do-queenslands-new-labour-hire-licensing-laws-mean-for-you)).
Victoria's regulator is explicit that contractor management is labour hire when the
provider places independent contractors to perform work "in and as part of a host's
business" and then manages the contract, including through administrative and payroll
functions ([Labour Hire Authority Victoria](https://www.labourhireauthority.vic.gov.au/provider/key-industries/contractor-management-services/)).
South Australia extended its scheme to all industries from 29 January 2026
([CBS SA](https://www.cbs.sa.gov.au/campaigns/labour-hire-licensing-reforms)) and the ACT
has licensed since 2021. Licences are not portable between states
([Rules Mate summary](https://rulesmate.com.au/insights/labour-hire-licensing-by-state-australia)).

Exemptions that do not obviously help: Queensland exempts recruitment and permanent
placement, in-house employees on secondment, and a single individual trading through a
service company ([Corrs overview](https://cdn.corrs.com.au/images/PDFs/Insights/LS875-CL-OverviewOfLabourHire-Jun18.pdf)).
Clinical Bench is none of those. The high-income exemption is framed around annual
earnings and is unlikely to apply to casual engagements.

The line that matters is **outcome versus supply**. A fixed-scope engagement where the
clinician delivers a written report to Clinical Bench, which delivers it to the client, is a
business supplying a service through a subcontractor. A clinician working inside the
client's annotation pipeline for several hours a week, directed by the client, is supply of
a worker. The site currently advertises both. The medical AI evaluation line, described as
"ongoing" and "flexible, done in your own time", is the one closest to the line.

**Protection now:**

- Structure every engagement as a statement of work with a deliverable, a fixed fee and a
  completion date, contracted to Clinical Bench, delivered by Clinical Bench. The
  clinician is Clinical Bench's subcontractor, not the client's worker.
- For ongoing evaluation work, either (a) package it as recurring deliverables (a batch of
  rated items, a weekly evaluation report) with the clinician working to Clinical Bench's
  brief and not the client's direction, or (b) get advice on a licence in the state where
  the work is performed before selling it. Choose before the first such engagement.
- Ask a lawyer the single question: "On these two contract templates, are we a labour hire
  provider in QLD or VIC?" That answer is cheap and settles the largest exposure.
- Do not describe the offer as "supplying clinicians" or "hire a doctor" in contracts or
  on the site. The home page title is "Hire Doctors, Nurses and Allied Health". That is a
  search title, but a regulator reads it too. Consider "Commission" language throughout.

### 1.2 Superannuation guarantee

A contract that is wholly or principally for a person's labour, where the person must do
the work personally and cannot delegate, is deemed employment for superannuation, and the
party paying is liable for SG on the labour component
([ATO, super for independent contractors](https://www.ato.gov.au/businesses-and-organisations/super-for-employers/work-out-if-you-have-to-pay-super/super-for-independent-contractors)).
The ATO's own examples put a professional engaged for their skills, paid more than half
for their labour, in scope. From 1 July 2026 contributions must be paid on payday, not
quarterly ([ATO](https://www.ato.gov.au/businesses-and-organisations/super-for-employers/work-out-if-you-have-to-pay-super/super-for-independent-contractors)).
SG does not apply where the contract is with the worker's company or trust rather than
the individual.

A clinician engaged personally to write a report is squarely a contract for labour. The
registration check means Clinical Bench cannot honestly offer a right to delegate.

**Protection now:**

- Engage clinicians through their own company, trust or partnership wherever they have
  one, and say so in the onboarding form. Many specialists and GPs already do.
- Where the clinician is engaged personally, budget SG on the fee (12 per cent) and pay
  it. Price it into the client's fixed fee. This is cheaper than the charge and it is the
  honest position.
- Have the accountant confirm the position on the ATO's intermediary ruling (SGR 2005/2)
  for the tripartite model, since Clinical Bench pays but the client directs some work.
- Check the payroll tax "relevant contract" rules in the operating state once contractor
  payments approach the threshold ($1.3m a year in Queensland). Not yet.

### 1.3 Professional indemnity and Clinical Bench's own insurance

Ahpra's registration standard defines practice as any role using the practitioner's
skills and knowledge, including "direct non-clinical relationship with clients" and
"advisory, regulatory or policy development roles", and requires professional indemnity
insurance for all aspects of practice
([Ahpra PII standard](https://www.ahpra.gov.au/Registration/Registration-Standards/PII)).
So a clinician on the bench is practising when they advise a company, must be insured for
it, and is subject to the Board's code of conduct while doing it, including its rules on
conflicts of interest and financial dealings with companies that make healthcare products
([Medical Board, Good medical practice](https://www.medicalboard.gov.au/codes-guidelines-policies/code-of-conduct.aspx)).

Whether a standard practitioner policy covers commercial consulting to a medtech or AI
company is a policy-by-policy question. Avant notes that employer or hospital cover
usually does not extend to advisory or consulting work
([Avant](https://avant.org.au/practitioners)). Several insurers offer non-clinical or
medico-legal extensions; some exclude product endorsement, expert work for industry or
work outside Australia.

Clinical Bench itself has no professional indemnity or public liability cover on record.
As the contracting party delivering the report, it carries the primary contractual
exposure to the client, and it carries vicarious exposure for the clinician's work.

**Protection now:**

- Clinician agreement: warranty of current registration, warranty of PII that covers the
  engagement, obligation to notify any change, and a right to ask for the certificate.
  Record the check on the same register entry as the registration check.
- Clinical Bench: obtain professional indemnity (professional services and consulting),
  public liability and cyber cover before the next engagement. Ask the broker specifically
  about cover for work performed by subcontracted practitioners and for medical AI
  evaluation work. Set a limit that matches the largest plausible client claim, not the
  fee.
- Every deliverable carries the same reliance statement: the findings are professional
  input to the client, not clinical evidence, not regulatory advice, not a warranty of
  safety or fitness, and not to be published or attributed.

### 1.4 Endorsements and advertising

The Therapeutic Goods Advertising Code 2021 prohibits advertising of therapeutic goods
that contains an endorsement or testimonial from a current or former health practitioner,
health professional or medical researcher
([TGA, testimonials and endorsements](https://www.tga.gov.au/products/regulations-all-products/advertising/applying-advertising-code/testimonials-and-endorsements-advertising)).
Separately, section 133 of the National Law bans testimonials in advertising a regulated
health service, with penalties of $30,000 for an individual and $60,000 for a body
corporate ([Ahpra advertising guidelines](https://www.ahpra.gov.au/Resources/Advertising-hub/Advertising-guidelines-and-other-guidance/Advertising-guidelines.aspx)).

The site already says the right thing ("never a public endorsement"). It needs to be a
contract term with teeth, because the breach happens on the client's website, months
later, with the clinician's name on it.

**Protection now:**

- Client terms: no use of the clinician's name, image, title, registration or the
  existence of the engagement in any marketing, listing, investor material or regulatory
  submission without separate written consent from Clinical Bench and the clinician;
  indemnity from the client for any breach; a licence to the deliverable for internal use
  only.
- Clinician agreement: mirror clause, and a duty to tell Clinical Bench if approached
  directly for an endorsement.
- For pharmaceutical and medtech clients who are members of Medicines Australia or the
  MTAA, payments to healthcare professionals for advisory boards and consultancies are
  reportable by the client ([Medicines Australia transparency reporting](https://www.medicinesaustralia.com.au/code/transparency-reporting/)).
  Collect the clinician's consent to disclosure at onboarding and keep payment records in
  a form the client can report. That turns a compliance headache for the client into a
  reason to use the bench.

### 1.5 Contracts, terms and the entity

There is no client agreement, no clinician agreement and no website terms in the repo.
The footer link to Terms is `href="#"`. The footer says "Working identity" where a legal
name and ABN would go. Under the Business Names Registration Act a business trading under
a name other than its own must register that name with ASIC; a company's ACN or ABN should
appear on its public documents.

**Protection now:** the term sheets in `CONTRACT-TERM-SHEETS.md`, which a lawyer can turn
into three documents in a day: client terms with a statement of work schedule, a
clinician subcontractor agreement, and website terms of use. Then put the entity name and
ABN in the footer and publish the terms page.

### 1.6 Privacy

An organisation that provides a health service and holds health information is an APP
entity regardless of turnover ([OAIC](https://www.oaic.gov.au/privacy/your-privacy-rights/health-information/what-is-a-health-service-provider)).
Clinical Bench probably does not provide a health service, so the small business
exemption may apply below $3m turnover. Do not rely on it: the privacy policy already
promises APP handling, clinicians' registration details are sensitive to them, and the
statutory tort for serious invasions of privacy that commenced on 10 June 2025 applies to
any entity, not only APP entities ([OAIC](https://www.oaic.gov.au/privacy/your-privacy-rights/more-privacy-rights/statutory-tort-for-serious-invasions-of-privacy)).

The real exposure is patient data in medical AI evaluation work. If a client hands a
clinician identifiable health records to annotate, the client needs a lawful basis under
the Privacy Act and the relevant state health records legislation, and Clinical Bench is
in the chain.

**Protection now:**

- Client terms: the client warrants that any data supplied is de-identified or lawfully
  disclosed, indemnifies for breach, and keeps data on its own systems (the clinician
  works inside the client's environment, nothing is downloaded).
- Clinician agreement: confidentiality, no copying of client data, no use of personal
  devices for identifiable data unless the client's controls allow it.
- The privacy page now covers clinician applications and registration checks (added
  11 September 2026). It remains a draft for legal review.

## 2. What is already right

- The site never claims to be a clinical service, a CRO or to run trials, and repeats that
  nothing is an endorsement. The article gates enforce this in every post.
- Registration is checked before matching. Keep the record.
- Fixed fee per scoped engagement is the right commercial structure for the labour hire
  question and for consumer law.
- The privacy policy is honest about overseas disclosure (Cloudflare, SMTP2GO).

## 3. Lower-order exposures

| Exposure | Position | What to do |
|---|---|---|
| Australian Consumer Law guarantees | Services under $100,000 attract the consumer guarantees even when the buyer is a business, and they cannot be excluded ([KWM](https://www.kwm.com/au/en/insights/latest-thinking/consumer-threshold-increased-to-100000-is-your-business-ready.html)). Liability can be limited to re-supply under s64A for business services | Draft the limitation clause to s64A exactly; a badly drafted one fails entirely ([Cornwalls](https://www.cornwalls.com.au/scope-of-purchases-protected-by-the-australian-consumer-law-enhanced/)) |
| Misleading or deceptive conduct (ACL s18) | Every claim on the site must be true in practice: "registration checked", "matched in days", "fixed price", "screened for commercial experience" | Keep the process behind each claim written down. Remove "verified" anywhere it means more than the register check |
| Content liability from the blog | Articles discuss TGA, Ahpra, ethics and indemnity | Every post now carries a general-information disclaimer, and a gate rejects absolute legal statements ("you do not need", "is not regulated") |
| Conflicts of interest for clinicians | The Board's code requires disclosure and management of financial interests in companies making healthcare products | Clinician agreement: declare conflicts per engagement; no engagement that touches the clinician's own patients or employer without disclosure |
| Payroll tax on contractor payments | Relevant-contract rules can treat contractor payments as wages above the state threshold | Revisit at $1m of annual contractor payments |
| Intellectual property | Who owns the report and any annotations | Clinician assigns to Clinical Bench on payment; Clinical Bench licenses to client for internal use, assigns on request for a fee. Clinician retains the right to their own know-how |
| Defamation or product disparagement | A clinician's findings say a product is unsafe | Findings are confidential professional input to the client; never published; clinician agreement and client terms both say so |
| Employment status of clinicians | Sham contracting if the relationship looks like employment | Fixed-scope, their own equipment, free to decline, free to work elsewhere. The site already says all of this. Keep it true |

## 4. The protection checklist, in order

1. Ask a lawyer two questions with the term sheets attached: are we a labour hire
   provider in QLD and VIC on these terms, and is the s64A limitation drafted correctly.
2. Get PI, PL and cyber quotes for Clinical Bench. Do not run another engagement uninsured.
3. Turn `CONTRACT-TERM-SHEETS.md` into client terms, a clinician agreement and website
   terms. Publish the terms page and fix the footer.
4. Put the legal entity and ABN on the site. Register "Clinical Bench" as a business name
   if the entity has a different name.
5. Add PII evidence, conflict declaration, contracting entity (company or individual) and
   disclosure consent to clinician onboarding.
6. Decide the model for ongoing AI evaluation work before selling it: deliverable-based
   through Clinical Bench, or licensed.
7. Budget SG on fees paid to individuals from the first engagement.
8. Finalise the privacy policy with a lawyer, including the clinician section added today.
