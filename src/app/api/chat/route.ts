import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { calculateSuitabilityScore, UserProfile } from '@/lib/scoring';

export const maxDuration = 30;

const nvidia = createOpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY!,
});

export async function POST(req: Request) {
  console.log("Chat API hit");

  if (!process.env.NVIDIA_API_KEY) {
    console.error("NVIDIA_API_KEY is missing!");
    return new Response(JSON.stringify({ error: 'NVIDIA_API_KEY is not set' }), { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const { messages, profile } = body;
  console.log("messages count:", messages?.length);

  const currentProfile: UserProfile = profile || {
    netIncome: 0,
    budget: 0,
    isBuying: false,
    schoolLocations: [],
    transportMode: 'car',
    minBedrooms: 1,
    lifestylePreferences: [],
  };

  try {
    const result = streamText({
      model: nvidia('mistralai/mistral-large-3-675b-instruct-2512'),
      messages,
      system: `You are PropAlign AI — a real estate assistant exclusively for South Africa.
You have full knowledge of South African suburbs, cities, and property market including areas like
Roodepoort, Sandton, Soweto, Cape Town, Durban, Pretoria, Johannesburg, Centurion, and all other SA locations.
Never say you lack information about South African areas — you know them well.

Your ONLY job is to collect the user's property requirements and find matches. Stay focused on this task at all times.
Do not refuse questions about SA areas. Do not suggest external websites. Just help them find a property.

Current User Profile: ${JSON.stringify(currentProfile)}

Collect the following — ask one question at a time, conversationally:
1. Rent or buy (if not set)
2. Monthly net income in ZAR (if netIncome is 0)
3. Budget — use the askForBudget tool, never ask as plain text (if budget is 0)
4. Preferred area or suburb in South Africa (acknowledge the area they mention positively)
5. Minimum bedrooms (if minBedrooms is 1 / default)
6. Lifestyle preferences e.g. near schools, pet friendly, close to transport

Rules:
- When the user mentions an area like "Roodepoort", acknowledge it and record it as a lifestyle preference, then ask the next question.
- Always call updateProfile immediately when the user provides any info.
- Call askForBudget when it's time to ask about budget.
- Call searchProperties once you have rent/buy, budget, and area.
- Never break character. Never say you can't help with SA locations.`,
      tools: {
        updateProfile: tool({
          description: 'Update the user profile with information the user provided',
          parameters: z.object({
            netIncome: z.number().optional(),
            budget: z.number().optional(),
            isBuying: z.boolean().optional(),
            minBedrooms: z.number().optional(),
            transportMode: z.enum(['car', 'public', 'walk', 'bike']).optional(),
            lifestylePreferences: z.array(z.string()).optional(),
          }),
          execute: async (params) => {
            return { success: true, updatedFields: Object.keys(params) };
          },
        }),

        // No execute = client-side tool. Stays in 'call' state until addToolResult is called.
        askForBudget: tool({
          description: 'Show an interactive budget slider widget so the user can select their monthly budget in ZAR',
          parameters: z.object({
            initialValue: z.number().optional().describe('Starting value for the slider in ZAR'),
          }),
        }),

        searchProperties: tool({
          description: 'Search and score properties based on the current user profile',
          parameters: z.object({ limit: z.number().default(5) }),
          execute: async ({ limit }) => {
            try {
              const properties = await prisma.property.findMany({ take: 20 });
              const scored = properties.map((p: any) => calculateSuitabilityScore(p, currentProfile));
              return scored.sort((a: any, b: any) => b.score - a.score).slice(0, limit);
            } catch (dbErr: any) {
              console.error("DB error in searchProperties:", dbErr?.message);
              return { error: 'Could not fetch properties' };
            }
          },
        }),
      },
      onError: (error) => {
        console.error("streamText onError:", JSON.stringify(error, null, 2));
      },
      onFinish: ({ text, finishReason }) => {
        console.log("streamText finished. reason:", finishReason, "text length:", text?.length);
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (error) => {
        console.error("stream error:", JSON.stringify(error, null, 2));
        if (error instanceof Error) return error.message;
        return String(error);
      },
    });
  } catch (e: any) {
    console.error("streamText threw:", e?.message, e?.stack);
    return new Response(JSON.stringify({ error: e?.message ?? 'Unknown error' }), { status: 500 });
  }
}
