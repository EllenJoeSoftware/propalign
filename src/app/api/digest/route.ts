/**
 * Weekly digest scaffold.
 *
 * Iterates every saved profile that has `wantsAlerts: true`, computes top
 * matches, and (if RESEND_API_KEY is set) emails a digest. Without the key
 * it logs the digests to stdout — useful for local testing.
 *
 * Trigger this from a scheduler (Cloud Scheduler / Vercel cron / GitHub
 * Action). Authentication: require a header `x-cron-secret` matching the
 * `CRON_SECRET` env var so randos can't trigger emails.
 */

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase';
import { findCandidates } from '@/lib/properties-repo';
import { calculateSuitabilityScore, type UserProfile } from '@/lib/scoring';
import { fmtRand } from '@/lib/sa-financial';

export async function POST(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const got = req.headers.get('x-cron-secret');
    if (got !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const db = getDb();
    const snap = await db
      .collection('saved_profiles')
      .where('wantsAlerts', '==', true)
      .get();

    const results: Array<{ email: string; sent: boolean; matches: number }> = [];

    for (const doc of snap.docs) {
      const data = doc.data() as { email: string; profile: UserProfile };
      const candidates = await findCandidates({
        isBuying: data.profile.isBuying,
        budget:
          data.profile.budget && data.profile.budget > 0
            ? data.profile.budget
            : undefined,
        minBedrooms:
          data.profile.minBedrooms && data.profile.minBedrooms > 1
            ? data.profile.minBedrooms
            : undefined,
        areas:
          data.profile.suburbs && data.profile.suburbs.length > 0
            ? data.profile.suburbs
            : undefined,
        limit: 200,
      });

      const top = candidates
        .map((p) => calculateSuitabilityScore(p, data.profile))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      const html = renderDigestHtml(data.email, top);
      const sent = await sendEmailIfConfigured(data.email, html, top.length);
      results.push({ email: data.email, sent, matches: top.length });
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    console.error('digest error:', err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? 'Unknown error' },
      { status: 500 },
    );
  }
}

function renderDigestHtml(
  email: string,
  matches: Array<{
    title: string;
    location: string;
    price: number;
    isForRent: boolean;
    score: number;
    listingUrl?: string;
  }>,
): string {
  const items = matches
    .map(
      (m, i) => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #eee;">
            <div style="font-family:Georgia,serif;font-size:16px;color:#0e1623;">
              ${i + 1}. ${escapeHtml(m.title)}
            </div>
            <div style="font-size:12px;color:#6b7280;margin-top:4px;">
              ${escapeHtml(m.location)} · ${m.score}/100 match
            </div>
            <div style="font-size:14px;color:#0e1623;margin-top:6px;font-family:monospace;">
              ${fmtRand(m.price)}${m.isForRent ? '/mo' : ''}
              ${m.listingUrl ? `&middot; <a href="${escapeHtml(m.listingUrl)}" style="color:#1e3a5f;">View</a>` : ''}
            </div>
          </td>
        </tr>`,
    )
    .join('');

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#faf7f2;font-family:system-ui,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:8px;">
      <div style="padding:20px 24px;border-bottom:1px solid #eee;">
        <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">PropAlign — weekly digest</div>
        <h1 style="margin:6px 0 0;font-family:Georgia,serif;font-size:20px;color:#0e1623;">Your top ${matches.length} match${matches.length === 1 ? '' : 'es'}</h1>
      </div>
      <table cellspacing="0" cellpadding="0" style="width:100%;">${items}</table>
      <div style="padding:16px 24px;color:#9ca3af;font-size:11px;">
        You're receiving this because you saved a profile to ${escapeHtml(email)}. You can adjust or unsubscribe in PropAlign anytime.
      </div>
    </div>
  </body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendEmailIfConfigured(
  email: string,
  html: string,
  matchCount: number,
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(
      `[digest] (no RESEND_API_KEY) would send ${matchCount} matches to ${email}`,
    );
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.DIGEST_FROM ?? 'PropAlign <digest@propalign.co.za>',
        to: email,
        subject: `${matchCount} new matches on PropAlign`,
        html,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error('resend error:', err);
    return false;
  }
}
