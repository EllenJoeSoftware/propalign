import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { UserProfile } from '@/lib/scoring';

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
      model: nvidia('google/gemma-3n-e4b-it'),
      messages,
      system: `You are PropAlign AI, a friendly real estate assistant for South Africa.
Your goal is to collect information from the user and help them find the best properties to rent or buy.
Be warm, conversational, and ask one question at a time.

Current User Profile: ${JSON.stringify(currentProfile)}

Guide the conversation to collect:
1. Whether they want to rent or buy (isBuying: true/false)
2. Their monthly net income in ZAR
3. Their budget (max rent or purchase price in ZAR)
4. Minimum number of bedrooms
5. Preferred areas or suburbs
6. Any lifestyle preferences (e.g. near schools, near public transport, pet friendly)

Once you have enough info, tell them you'll search for matching properties and summarise what you found from the profile.
Do NOT make up property listings — just have the conversation and collect the profile.`,
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
