import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { calculateSuitabilityScore, UserProfile } from '@/lib/scoring';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log("Chat API hit");

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("GOOGLE_GENERATIVE_AI_API_KEY is missing!");
    return new Response(JSON.stringify({ error: 'GOOGLE_GENERATIVE_AI_API_KEY is not set' }), { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    console.error("Failed to parse request body:", e);
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
  }

  const { messages, data } = body;
  console.log("messages count:", messages?.length, "data:", JSON.stringify(data));

  const currentProfile: UserProfile = data?.profile || {
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
      model: google('gemini-1.5-flash'),
      messages,
      system: `You are PropAlign AI, a friendly real estate assistant for South Africa. 
      Your goal is to build a user profile and find the best properties.
      Be conversational, ask one question at a time.
      
      Current User Profile: ${JSON.stringify(currentProfile)}
      
      If the profile is incomplete, ask for the missing info.`,
      tools: {
        updateProfile: tool({
          description: 'Update the user profile',
          parameters: z.object({
            name: z.string().optional(),
            netIncome: z.number().optional(),
            budget: z.number().optional(),
            isBuying: z.boolean().optional(),
            workLocation: z.object({ lat: z.number(), lng: z.number(), address: z.string() }).optional(),
          }),
          execute: async (params) => {
            return { success: true, updatedFields: Object.keys(params) };
          },
        }),
        askForBudget: tool({
          description: 'Show a budget slider',
          parameters: z.object({ initialValue: z.number().optional() }),
          execute: async () => ({ success: true }),
        }),
        searchProperties: tool({
          description: 'Search for properties',
          parameters: z.object({ limit: z.number().default(5) }),
          execute: async ({ limit }) => {
            const properties = await prisma.property.findMany({ take: 20 });
            const scored = properties.map((p: any) => calculateSuitabilityScore(p, currentProfile));
            return scored.sort((a: any, b: any) => b.score - a.score).slice(0, limit);
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (e: any) {
    console.error("streamText error:", e?.message, e?.cause, e?.stack);
    return new Response(JSON.stringify({ error: e?.message ?? 'Unknown error' }), { status: 500 });
  }
}
