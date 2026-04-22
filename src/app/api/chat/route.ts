import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { calculateSuitabilityScore, UserProfile } from '@/lib/scoring';

export const maxDuration = 30;

// NVIDIA NIM — OpenAI-compatible endpoint
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
      model: nvidia('google/gemma-3n-e4b-it'),
      messages,
      system: `You are PropAlign AI, a friendly real estate assistant for South Africa.
Your goal is to build a user profile and find the best properties.
Be conversational and ask one question at a time.

Current User Profile: ${JSON.stringify(currentProfile)}

If the profile is incomplete, ask for the missing info.`,
      tools: {
        updateProfile: tool({
          description: 'Update the user profile with information the user provided',
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
          description: 'Show an interactive budget slider widget to the user',
          parameters: z.object({ initialValue: z.number().optional() }),
          execute: async () => ({ success: true }),
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
      onFinish: ({ text, finishReason, usage }) => {
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
