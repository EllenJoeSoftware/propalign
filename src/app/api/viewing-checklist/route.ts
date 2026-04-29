/**
 * Generates a tailored "things to check at the viewing" list for a specific
 * property. The list is grounded in: property type, age signals from the
 * description (e.g. "1970s", "newly renovated"), suburb hints (e.g. coastal
 * → corrosion checks; KZN → humidity / damp; Cape Town → water restrictions),
 * and red flags hinted at in the listing copy (e.g. "shared yard", "no pets").
 */

import { createAnthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getDb } from '@/lib/firebase';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
const MODEL =
  process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5-20250929';

const ChecklistSchema = z.object({
  intro: z
    .string()
    .describe('One-sentence framing for why this checklist suits this listing'),
  groups: z
    .array(
      z.object({
        title: z.string().describe('Short heading e.g. "Structural", "Damp", "Costs"'),
        items: z
          .array(
            z.object({
              question: z
                .string()
                .describe('A specific thing to check or ask, in plain language'),
              why: z
                .string()
                .describe('Brief context — why this matters for THIS property'),
            }),
          )
          .min(2)
          .max(5),
      }),
    )
    .min(3)
    .max(6),
  redFlags: z
    .array(z.string())
    .describe('2-4 specific red flags inferred from the listing description'),
});

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not set' },
      { status: 500 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const propertyId: string = body.propertyId;
  if (!propertyId) {
    return Response.json({ error: 'propertyId required' }, { status: 400 });
  }

  try {
    const db = getDb();
    const doc = await db.collection('properties').doc(propertyId).get();
    if (!doc.exists) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }
    const p = doc.data() as Record<string, any>;

    const fullDesc = p.fullDescription ?? p['full description'] ?? p.description ?? '';
    const features = (() => {
      try {
        return JSON.parse(p.features ?? '[]');
      } catch {
        return [];
      }
    })();

    const result = await generateObject({
      model: anthropic(MODEL),
      schema: ChecklistSchema,
      prompt: `You are an experienced South African property inspector preparing a viewer for a show day. Generate a focused, specific checklist for THIS property — not generic advice.

Property:
- Title: ${p.title}
- Type: ${p.propertyType}
- Bedrooms / bathrooms: ${p.bedrooms} / ${p.bathrooms}
- Suburb: ${p.location}, ${p.province ?? ''}
- ${p.isForRent ? 'For rent' : 'For sale'} at R${p.price?.toLocaleString?.('en-ZA')}
- Features: ${features.join(', ') || 'none listed'}
- Description: """${fullDesc.slice(0, 1200)}"""

Tailor the checklist to:
- The property TYPE (sectional title vs freestanding has different concerns).
- Age clues in the description (e.g. "1970s", "newly renovated", "established").
- Climate of the province (coastal: corrosion, salt; Highveld: hail, lightning; KZN: humidity, damp; Western Cape: water restrictions).
- Red flags hinted in the listing copy (e.g. "shared yard" → privacy, "no pets" → restrictive rules, "prepaid electricity" → no flat-rate, "shared utilities" → bills negotiation).
- For sectional title: ask about levies, special levies, complex rules, body corp finances.
- For freestanding: ask about rates account, fence/security, garden upkeep.
- For rent: ask about deposit, lease term, escalation clause, who pays utilities.
- For sale: ask about offers received, days on market, transfer date.

Keep questions concrete and answerable on the day. Avoid generic items like "check the kitchen" — make it "ask if the gas geyser was serviced this year, and check the date on the sticker."`,
    });

    return Response.json(result.object);
  } catch (err: any) {
    console.error('viewing-checklist error:', err?.message ?? err);
    return Response.json(
      { error: err?.message ?? 'Could not generate checklist' },
      { status: 500 },
    );
  }
}
