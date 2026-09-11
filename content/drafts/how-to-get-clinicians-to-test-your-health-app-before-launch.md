---
title: How to get clinicians to test your health app before launch
description: How to put registered Australian doctors, nurses and allied health professionals on your health app before launch: who to ask, what to send, what comes back.
slug: how-to-get-clinicians-to-test-your-health-app-before-launch
date: 2026-09-11
publish_on: 2026-09-22
status: ready for review
audience: companies
keywords: clinician testing health app, clinical usability testing, get doctors to test my app, health app validation australia, clinician feedback
cluster: product-testing
slot: W01
---

Clinician testing means a registered doctor, nurse or allied health professional uses your health app the way they would in practice, then tells you in writing what works, what is unsafe and what you have missed. You do not need a hospital partnership or a research ethics application to get it. You need the right person, a short written brief and a fixed scope.

Most teams building a health product know they should do this. Fewer manage it before launch, because the usual routes are slow. A friend of a friend who is a GP gives you twenty minutes over coffee. A LinkedIn post asks for volunteers and attracts the wrong ones. A hospital innovation unit says yes, then schedules you for next quarter. This is a guide to doing it properly, in days, without any of that.

## Why a clinician test is different from user testing

Ordinary usability testing tells you whether a person can complete a task. A clinician test tells you whether the task is the right one. The person doing it has a mental model of the care workflow your app sits inside. They notice the things a general tester cannot: an order of steps that would never happen on a ward, a wording that means something different in clinical use, a default value that would be wrong for the patients the product is aimed at.

Three kinds of finding come back from a good clinician test. Each is worth a different amount to you.

| Finding | What it looks like | What it saves you |
|---|---|---|
| Safety | A field that accepts a dangerous value, a result shown without its context, a nudge that would be wrong for a subgroup | The recall, the complaint, the regulator's letter |
| Fit | The app assumes a workflow that does not exist or asks for information the clinician never has at that moment | Months of building features nobody uses |
| Language | Terms used differently in practice, tone that a patient-facing app should not have, a claim that a professional would not stand behind | Trust. And the rewrite after launch |

The first category matters most if your product is heading toward the [Therapeutic Goods Administration](https://www.tga.gov.au/products/medical-devices/software-and-artificial-intelligence-ai/overview). The TGA's starting point for any software product is four questions: whether it meets the medical device definition, whether an exclusion or exemption applies, which classification it falls in and what evidence of safety and performance you hold. A clinician's written findings are not clinical evidence in the regulatory sense. They are the fastest way to discover you need some.

## Who to ask

The reflex is to ask a doctor. Often the right person is a nurse, a pharmacist or a physiotherapist, because they are the ones who would actually use the thing or supervise its use. Match the discipline to the moment of care the app touches:

- A medication app: a pharmacist first, then a GP.
- A post-discharge or monitoring app: a registered nurse who has run a ward or a community caseload.
- A rehabilitation or exercise app: a physiotherapist or occupational therapist.
- A mental health app: a psychologist. A GP too if it sits in a referral pathway.
- A clinical decision tool: the specialist whose decision it supports, plus a junior doctor who will use it at 3 am.

Two other things matter more than seniority. The person should be currently registered and currently practising, so their sense of the workflow is this year's rather than a memory. And they should be able to explain their reasoning to a non-clinical team, in writing, without hedging. That second skill is rarer than the first.

The registration check is not optional. The Australian Health Practitioner Regulation Agency publishes a [public register](https://www.ahpra.gov.au/Registration/Registers-of-Practitioners.aspx) you can search by name. If a marketplace or an agency supplies the person, ask how they verified it.

## What to give them

A short brief beats a long one. The clinician needs enough to test the product as it would be used. Not so much that they test your intentions instead of your app. A brief that works has six parts:

1. **What the product does and who it is for**, in two sentences. Include the care setting.
2. **Access.** A test account, sample data that looks like real patients without being real patients. The device it is meant to run on.
3. **The tasks.** Three to six things a user is supposed to be able to do. Written as the user would think of them, not as features.
4. **The questions you are afraid of.** Every team has two or three. Say them. "Would you trust the risk score?" gets a better answer than "any feedback welcome".
5. **What you want back.** A written report, a recorded walkthrough or an hour on a call afterwards. Ask for the written version even if you also want the call.
6. **The scope, the fee and the confidentiality terms**, agreed before they start.

Do not give them your roadmap, your pitch deck or the reasons the design is the way it is. The value of the exercise is their first reaction.

## How long it takes and what it costs

A first clinician test of a working app is usually a scoped engagement of a few hours: the time to read the brief, use the product properly and write the findings up. Where a team needs more, it is because the product has several user types or because the first test found enough to justify a second pass after changes.

Cost depends on the seniority required and the hours scoped. The important thing is the pricing model, not the number. An hourly arrangement with no cap tends to produce a short engagement and a thin report, because the clinician is watching the clock on your behalf. A fixed fee agreed against a written scope produces the report you actually asked for. Ask for a fixed price before work starts and decline anything open-ended.

On timing, the constraint is finding the person, not the work itself. If you already have someone suitable, the whole thing can run inside a week. If you do not, a marketplace that already holds verified, screened clinicians can match one in days. Clinical Bench does this for [companies building healthcare products](/), with the registration check done before the match and a fixed fee per engagement.

## What you get back and what to do with it

Expect a written document that separates what the clinician saw from what they recommend. If it does not, ask for that split. Then sort the findings into three piles:

| Pile | Rule |
|---|---|
| Fix before launch | Anything in the safety row above. No exceptions. |
| Fix in the next release | Fit and language findings the team agrees with |
| Disagree and record | Findings you have decided not to act on, with the reason written down |

The third pile is the one teams skip. Write it anyway. If the product ever needs a regulatory submission, an investor's due diligence or an incident review, the record of clinical input you received and how you handled it will be asked for. One dated document is worth a great deal at that point.

One thing the report is not: an endorsement. A clinician who tests your product is giving you private professional input. Using their name in marketing or describing the product as clinician-approved on the strength of a test, is a different arrangement and needs their separate written consent. Most will say no. The ones who say yes without being asked properly are not the ones you want.

## Common questions

### Do I need ethics approval to have a clinician test my app?

No. A clinician using your product and giving you professional feedback is commercial consulting work, not research on human participants. Ethics approval becomes relevant when you study patients or collect data from them for research. If your testing involves real patients or real patient data, get advice before you start.

### How many clinicians should test it?

One good one, for a first pass. The aim is to find the categories of problem, not to count them. A second clinician from a different discipline is useful when the app touches more than one part of the care pathway. Panels of ten tell you what a survey would tell you.

### Can I use the findings in a TGA submission?

Not directly. Clinical evidence for a regulated medical device has its own requirements, set out in the TGA's guidance. A clinician test tells you whether you are likely to need that evidence. It shows where the product would fail on safety before you get there. Treat it as the step before the regulatory work, not a substitute for it.

### What if the clinician says the product should not exist?

That happens. It is the most valuable outcome a test can produce before launch rather than after. Ask them what would need to be true for the product to be safe and useful. Then decide. The fee was small compared with the alternative.

## What would a clinician find in your first ten minutes?

Every health product team can guess at the answer. The screen you have argued about, the value nobody is sure is right, the step you know is in the wrong order. A clinician will find those in the first ten minutes and then keep going. If you would rather know now than after launch, send a short brief through the [enquiry form](/#contact) and you will get back a named professional, a scope and a fixed price within days.
