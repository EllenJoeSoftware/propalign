import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { findCandidates } from '@/lib/properties-repo';
import { calculateSuitabilityScore, UserProfile } from '@/lib/scoring';

export const maxDuration = 30;

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const CLAUDE_MODEL =
  process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-5-20250929';

export async function POST(req: Request) {
  console.log('Chat API hit');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is missing!');
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set' }),
      { status: 500 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
    });
  }

  const { messages, profile } = body;
  console.log('messages count:', messages?.length);

  const currentProfile: UserProfile = profile || {
    netIncome: 0,
    budget: 0,
    isBuying: false,
    schoolLocations: [],
    transportMode: 'car',
    minBedrooms: 1,
    lifestylePreferences: [],
  };

  const isFamily =
    currentProfile.lifeStage === 'young_family' ||
    currentProfile.lifeStage === 'school_family';

  try {
    const result = streamText({
      model: anthropic(CLAUDE_MODEL),
      messages,
      system: `You are PropAlign — a calm, knowledgeable South African real-estate concierge.
Speak like an estate agent walking someone through a property decision: confident, warm, brief, never salesy.

Your job is to find the right home in the fewest questions possible by asking the things that actually predict
long-term housing satisfaction (life-stage, real-priorities trade-offs, vibe, location, budget) and skipping
the things people adapt to (square footage, finishes, vague "lifestyle preferences").

Current profile: ${JSON.stringify(currentProfile)}

ASK IN THIS ORDER (skip a step if the profile already has the data):
1. Rent or buy? — first message; offer the inline Rent/Buy buttons. Already known if isBuying is set in profile.
2. Life stage — call askLifeStage. Already known if profile.lifeStage is set.
3. Net income — call askForIncome. Already known if netIncome > 0.
4. Budget — call askForBudget. Already known if budget > 0.
5. Top-2 trade-offs — call askTopTwoTradeoffs. Already known if profile.topPriorities has length 2.
6. Vibe proxies — call askVibeProxies. Already known if profile.socialDensityPref AND profile.aestheticEra AND profile.securityTier are all set.
7. Location — call askForLocation. Already known if profile.suburbs has length > 0.
8. Schools (FAMILIES ONLY) — call askForSchools right after location, ONLY if lifeStage is young_family or school_family AND profile.schoolLocations.length === 0. The user can skip — that's fine.
9. Minimum bedrooms — call askForBedrooms. Already known if profile.minBedrooms > 1.

WHEN ENOUGH IS KNOWN — call searchProperties:
Required minimums: isBuying, budget>0, suburbs.length>0. Everything else is bonus precision.
If the user says any variant of "find me homes now" / "show me options" / "skip the rest" — call searchProperties immediately
with whatever data is on the profile, regardless of what's missing.
Pass the chosen suburbs as the "areas" array.

TOOL RULES:
- The ONLY tools you may call are: askLifeStage, askForIncome, askForBudget, askTopTwoTradeoffs, askVibeProxies, askForLocation, askForSchools, askForBedrooms, searchProperties.
- Never ask about income, budget, or location in plain text — always use the matching tool.
- After a user submits a tool answer, briefly acknowledge it in one short sentence, then move to the next missing step.

STAY ON TOPIC:
- You ONLY help with finding SA properties. If asked anything off-topic (politics, news, weather, jokes, general knowledge),
  reply with one short sentence: "I'm only here to help you find a home in South Africa — let's keep going." Then move to the next step.
- Do not engage with the off-topic question. No facts, no opinions, no acknowledgement of the topic itself.
- Never suggest external websites. You know all SA suburbs.

VOICE:
- Plain conversational text. No bullet lists in chat. No emojis.
- Address the person directly. Acknowledge briefly ("got it", "okay") then proceed.

Context flags for this turn: isFamily=${isFamily}.`,
      tools: {
        askLifeStage: tool({
          description:
            'Show a list of life-stage options for the user to pick from (solo, couple, young family, school-age family, empty-nester/retiring, roommates). Call this ONCE when the profile.lifeStage is not yet set.',
          parameters: z.object({}),
        }),

        askForIncome: tool({
          description:
            'Show an interactive slider for monthly NET income in ZAR. Call ONLY when collecting income.',
          parameters: z.object({
            initialValue: z
              .number()
              .optional()
              .describe('Starting slider value in ZAR, e.g. 20000'),
          }),
        }),

        askForBudget: tool({
          description:
            'Show an interactive slider for monthly budget in ZAR. Call ONLY when collecting budget. The widget reads netIncome from the client and warns if budget exceeds 30% of income.',
          parameters: z.object({
            initialValue: z
              .number()
              .optional()
              .describe('Starting slider value in ZAR, e.g. 10000'),
          }),
        }),

        askTopTwoTradeoffs: tool({
          description:
            'Show a forced-choice grid of six priorities; user picks the TWO most important. Call ONCE when profile.topPriorities is missing. Pass showSchools=true only when the user is in a family life-stage (young_family or school_family).',
          parameters: z.object({
            showSchools: z
              .boolean()
              .default(false)
              .describe('Show the schools card. Only true for families.'),
          }),
        }),

        askVibeProxies: tool({
          description:
            'Show three forced-choice paired prompts to infer social density, aesthetic era, and security tier. Call ONCE when any of socialDensityPref, aestheticEra, or securityTier is missing.',
          parameters: z.object({}),
        }),

        askForLocation: tool({
          description:
            'Show a two-step picker (province multi-select then filterable suburbs). Call ONLY when collecting preferred location.',
          parameters: z.object({}),
        }),

        askForBedrooms: tool({
          description:
            'Show a 1-to-10 number picker for the minimum acceptable number of bedrooms. Call ONCE when profile.minBedrooms is missing or still at the default of 1.',
          parameters: z.object({}),
        }),

        askForSchools: tool({
          description:
            'Show a searchable picker of well-known SA schools. Call ONLY for families (lifeStage = young_family or school_family) AND only when profile.schoolLocations is empty. The user may skip; that is acceptable.',
          parameters: z.object({}),
        }),

        searchProperties: tool({
          description:
            'Search and rank properties. Call once enough is known (isBuying, budget>0, suburbs.length>0) OR if the user explicitly asks to see homes now.',
          parameters: z.object({
            limit: z.number().default(5),
            area: z.string().optional(),
            areas: z.array(z.string()).optional(),
            isBuying: z.boolean().optional(),
            budget: z.number().optional(),
            minBedrooms: z.number().optional(),
            propertyType: z.string().optional(),
          }),
          execute: async ({
            limit,
            area,
            areas,
            isBuying,
            budget,
            minBedrooms,
            propertyType,
          }) => {
            const profileSuburbs = currentProfile.suburbs;
            const mergedAreas = Array.from(
              new Set(
                [
                  ...(areas ?? []),
                  ...(area ? [area] : []),
                  ...(profileSuburbs ?? []),
                ].filter(Boolean),
              ),
            );

            const mergedProfile: UserProfile = {
              ...currentProfile,
              ...(isBuying !== undefined && { isBuying }),
              ...(budget !== undefined && { budget }),
              ...(minBedrooms !== undefined && { minBedrooms }),
            };

            try {
              const candidates = await findCandidates({
                isBuying: mergedProfile.isBuying,
                budget:
                  mergedProfile.budget && mergedProfile.budget > 0
                    ? mergedProfile.budget
                    : undefined,
                minBedrooms:
                  mergedProfile.minBedrooms && mergedProfile.minBedrooms > 0
                    ? mergedProfile.minBedrooms
                    : undefined,
                propertyType,
                areas: mergedAreas.length > 0 ? mergedAreas : undefined,
                // Pull a wide candidate window so the suburb partial-match
                // filter (applied in-memory after the Firestore fetch) has
                // enough to work with. Firestore doesn't support `contains`
                // on strings, so a too-small window misses everything in
                // the specific suburbs the user picked.
                limit: 5000,
              });

              console.log(
                'searchProperties: found ' + candidates.length + ' candidates',
              );

              if (!candidates.length) {
                return {
                  error: 'No properties found matching your criteria',
                };
              }

              const scored = candidates.map((p) =>
                calculateSuitabilityScore(p, mergedProfile),
              );

              return scored
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);
            } catch (dbErr: any) {
              console.error(
                'DB error in searchProperties:',
                dbErr?.message,
                dbErr?.stack,
              );
              return {
                error: 'Could not fetch properties. Please try again.',
              };
            }
          },
        }),
      },
      onError: (error) => {
        console.error('streamText onError:', JSON.stringify(error, null, 2));
      },
      onFinish: ({ text, finishReason }) => {
        console.log(
          'streamText finished. reason:',
          finishReason,
          'text length:',
          text?.length,
        );
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error('stream error:', JSON.stringify(error, null, 2));
        if (error instanceof Error) return error.message;
        return String(error);
      },
    });
  } catch (e: any) {
    console.error('streamText threw:', e?.message, e?.stack);
    return new Response(
      JSON.stringify({ error: e?.message ?? 'Unknown error' }),
      { status: 500 },
    );
  }
}
