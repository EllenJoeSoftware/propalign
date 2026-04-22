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
      system: `You are PropAlign AI — a friendly real estate assistant for South Africa.
You have full knowledge of all South African suburbs, cities, and areas.
Never refuse or deflect questions about SA locations — you know them all.

Your job is to collect property requirements through natural conversation, then find matches.

Current profile: ${JSON.stringify(currentProfile)}

Collection order (one question at a time):
1. Rent or buy? → already known if isBuying is true/false in profile
2. Monthly net income in ZAR? → already known if netIncome > 0
3. Budget → ONLY use the askForBudget tool for this, never ask as plain text → already known if budget > 0
4. Preferred suburb or area in SA?
5. Minimum bedrooms?
6. Lifestyle preferences (schools nearby, pet friendly, transport, etc)?

IMPORTANT RULES:
- Respond ONLY with plain conversational text. Do NOT call updateProfile — just talk naturally.
- The ONLY tools you may call are: askForBudget (when collecting budget) and searchProperties (when ready to search).
- After the user answers a question, immediately acknowledge it briefly and ask the next one in the same message.
- When you have rent/buy, budget confirmed, and area — call searchProperties.
- Never say you lack info about any SA area. Never suggest external websites.`,
      tools: {
        // Client-side tool — no execute. Shows slider, stays in 'call' until user confirms.
        askForBudget: tool({
          description: 'Show an interactive slider for the user to pick their monthly budget in ZAR. Call this ONLY when asking about budget.',
          parameters: z.object({
            initialValue: z.number().optional().describe('Starting slider value in ZAR, e.g. 10000'),
          }),
        }),

        searchProperties: tool({
          description: 'Search and rank properties against the user profile. Call once you have enough info.',
          parameters: z.object({
            limit: z.number().default(5),
            area: z.string().optional().describe('Preferred suburb or area — matches the location column'),
            isBuying: z.boolean().optional().describe('true = for sale, false = for rent'),
            budget: z.number().optional().describe('Max price in ZAR'),
            minBedrooms: z.number().optional().describe('Minimum number of bedrooms'),
            propertyType: z.string().optional().describe('e.g. Apartment, House, Cottage, Studio, Townhouse'),
          }),
          execute: async ({ limit, area, isBuying, budget, minBedrooms, propertyType }) => {
            const mergedProfile: UserProfile = {
              ...currentProfile,
              ...(isBuying !== undefined && { isBuying }),
              ...(budget !== undefined && { budget }),
              ...(minBedrooms !== undefined && { minBedrooms }),
              ...(area && {
                lifestylePreferences: [
                  ...(currentProfile.lifestylePreferences ?? []),
                  area,
                ],
              }),
            };

            try {
              // Build WHERE filters that match the SQL schema columns
              const where: any = {};

              // isForRent column: true = renting, false = buying
              if (isBuying !== undefined) {
                where.isForRent = !isBuying;
              }

              // Filter by location (suburb/city) — partial match
              if (area) {
                where.location = { contains: area };
              }

              // Filter by max price
              if (budget && budget > 0) {
                where.price = { lte: budget };
              }

              // Filter by minimum bedrooms
              if (minBedrooms && minBedrooms > 0) {
                where.bedrooms = { gte: minBedrooms };
              }

              // Filter by property type
              if (propertyType) {
                where.propertyType = propertyType;
              }

              console.log("searchProperties WHERE:", JSON.stringify(where));

              // Fetch up to 30 candidates then score & rank
              const properties = await prisma.property.findMany({
                where,
                take: 30,
                orderBy: { price: 'asc' },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  price: true,
                  location: true,
                  propertyType: true,
                  bedrooms: true,
                  bathrooms: true,
                  lat: true,
                  lng: true,
                  features: true,
                  imageUrl: true,
                  isForRent: true,
                },
              });

              console.log(`searchProperties: found ${properties.length} candidates`);

              if (!properties.length) {
                return { error: 'No properties found matching your criteria' };
              }

              const scored = properties.map((p: any) =>
                calculateSuitabilityScore(p, mergedProfile)
              );

              return scored
                .sort((a: any, b: any) => b.score - a.score)
                .slice(0, limit);

            } catch (dbErr: any) {
              console.error("DB error in searchProperties:", dbErr?.message, dbErr?.stack);
              return { error: 'Could not fetch properties. Please try again.' };
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
