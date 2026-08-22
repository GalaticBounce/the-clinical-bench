/**
 * POST /api/enquiry
 *
 * Handles the Clinical Bench enquiry form.
 * Flow: validate input -> verify Cloudflare Turnstile -> send email via SMTP2GO.
 *
 * Required Pages environment variables (Settings > Environment variables):
 *   TURNSTILE_SECRET_KEY  (secret) - from Cloudflare Turnstile
 *   SMTP2GO_API_KEY       (secret) - from SMTP2GO, sending-only API key
 *   ENQUIRY_TO            (plain)  - inbox that receives enquiries
 *   ENQUIRY_FROM          (plain)  - verified sender, e.g. website@theclinicalbench.com
 *
 * Docs:
 *   Turnstile server-side validation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *   SMTP2GO send email API:           https://apidoc.smtp2go.com/documentation/#/POST/email/send
 */

import { parsePhoneNumberFromString } from '../_lib/libphonenumber-min.js';

interface Env {
  TURNSTILE_SECRET_KEY: string;
  SMTP2GO_API_KEY: string;
  ENQUIRY_TO: string;
  ENQUIRY_FROM: string;
}

interface Smtp2goSendResponse {
  data?: { succeeded?: number; failed?: number; error?: string };
}

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

const MAX_EMAIL = 254;
const MAX_MESSAGE = 2000;
const MAX_PHONE = 30;
const MAX_SERVICES = 10;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

/** Deliberately permissive: real validation is the confirmation email bouncing. */
function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= MAX_EMAIL;
}

/**
 * Accepts a full E.164 number (starts with +), or a local number combined
 * with the selected country's ISO 3166-1 alpha-2 code (e.g. "AU"). Validated
 * against real per-country numbering rules via libphonenumber-js, not just a
 * digit-count guess. Returns the normalised E.164 form on success.
 */
function normalizePhone(value: string, countryIso: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith('+') && !countryIso) return null;
  try {
    const parsed = trimmed.startsWith('+')
      ? parsePhoneNumberFromString(trimmed)
      : parsePhoneNumberFromString(trimmed, countryIso);
    return parsed && parsed.isValid() ? parsed.number : null;
  } catch {
    return null;
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Fail loudly in logs if the project is misconfigured, but stay vague to the client.
  if (!env.TURNSTILE_SECRET_KEY || !env.SMTP2GO_API_KEY || !env.ENQUIRY_TO || !env.ENQUIRY_FROM) {
    console.error('enquiry: missing environment variables');
    return json({ ok: false, error: 'Server not configured.' }, 500);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'Invalid request.' }, 400);
  }

  const email = String(form.get('email') ?? '').trim();
  const phoneRaw = String(form.get('phone') ?? '').trim().slice(0, MAX_PHONE);
  const phoneCountry = String(form.get('phone_country') ?? '').trim().toUpperCase().slice(0, 2);
  const occupation = String(form.get('occupation') ?? '').trim().slice(0, 80);
  const services = form.getAll('services').map((v) => String(v).trim().slice(0, 80)).filter(Boolean).slice(0, MAX_SERVICES);
  const need = String(form.get('need') ?? '').trim().slice(0, MAX_MESSAGE);
  const token = String(form.get('cf-turnstile-response') ?? '');
  const honeypot = String(form.get('company_website') ?? ''); // hidden field, humans leave it empty

  if (honeypot) {
    // Bot: return success so it does not retry or probe.
    return json({ ok: true }, 200);
  }
  if (!isEmail(email)) {
    return json({ ok: false, error: 'Please enter a valid work email.' }, 400);
  }
  const phone = normalizePhone(phoneRaw, phoneCountry);
  if (!phone) {
    return json({ ok: false, error: 'Please enter a valid phone number.' }, 400);
  }
  if (!token) {
    return json({ ok: false, error: 'Please complete the verification check.' }, 400);
  }

  // --- Turnstile server-side verification ---
  const verifyBody = new FormData();
  verifyBody.append('secret', env.TURNSTILE_SECRET_KEY);
  verifyBody.append('response', token);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) verifyBody.append('remoteip', ip);

  let verdict: TurnstileVerifyResponse;
  try {
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: verifyBody,
    });
    verdict = await verifyRes.json<TurnstileVerifyResponse>();
  } catch (err) {
    console.error('enquiry: turnstile request failed', err);
    return json({ ok: false, error: 'Verification unavailable. Please try again.' }, 502);
  }

  if (!verdict.success) {
    console.warn('enquiry: turnstile rejected', verdict['error-codes']);
    return json({ ok: false, error: 'Verification failed. Please try again.' }, 403);
  }

  // --- Send the enquiry ---
  const submittedAt = new Date().toISOString();
  const country = request.headers.get('CF-IPCountry') ?? 'unknown';
  const servicesText = services.length ? services.join(', ') : 'Not supplied';
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeOccupation = escapeHtml(occupation || 'Not supplied');
  const safeServices = escapeHtml(servicesText);
  const safeNeed = escapeHtml(need || 'Not supplied');

  try {
    const sendRes = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        api_key: env.SMTP2GO_API_KEY,
        sender: `Clinical Bench <${env.ENQUIRY_FROM}>`,
        to: [env.ENQUIRY_TO],
        custom_headers: [{ header: 'Reply-To', value: email }],
        subject: `Enquiry from ${email}`,
        text_body: `New enquiry\n\nEmail: ${email}\nPhone: ${phone}\nOccupation needed: ${occupation || 'Not supplied'}\nService required: ${servicesText}\nNeed: ${need || 'Not supplied'}\nCountry: ${country}\nSubmitted: ${submittedAt}\n`,
        html_body:
          `<h2 style="font-family:system-ui,sans-serif">New enquiry</h2>` +
          `<p style="font-family:system-ui,sans-serif"><strong>Email:</strong> ${safeEmail}<br>` +
          `<strong>Phone:</strong> ${safePhone}<br>` +
          `<strong>Occupation needed:</strong> ${safeOccupation}<br>` +
          `<strong>Service required:</strong> ${safeServices}<br>` +
          `<strong>Need:</strong> ${safeNeed}<br>` +
          `<strong>Country:</strong> ${escapeHtml(country)}<br>` +
          `<strong>Submitted:</strong> ${submittedAt}</p>`,
      }),
    });

    const result = await sendRes.json<Smtp2goSendResponse>().catch(() => null);
    if (!sendRes.ok || !result?.data?.succeeded) {
      console.error('enquiry: smtp2go failed', sendRes.status, JSON.stringify(result));
      return json({ ok: false, error: 'Could not send right now. Please email us directly.' }, 502);
    }
  } catch (err) {
    console.error('enquiry: smtp2go request threw', err);
    return json({ ok: false, error: 'Could not send right now. Please email us directly.' }, 502);
  }

  return json({ ok: true }, 200);
};

/** Anything other than POST gets a clear answer rather than the SPA shell. */
export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed.' }, 405);
  }
  return context.next();
};
