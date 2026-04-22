# PropAlign AI - UI & System Design
**Date:** 2026-04-21
**Status:** Approved

## 1. Overview
PropAlign AI is a conversational real estate assistant for South Africa. It uses a hybrid chat/widget interface to build user profiles and match them with properties using a weighted suitability score.

## 2. Tech Stack
- **Framework:** Next.js 14/15 (App Router)
- **Styling:** Tailwind CSS + Shadcn/UI
- **AI Integration:** Vercel AI SDK (Generative UI / Tool Calling)
- **Database:** MySQL
- **ORM:** Prisma or Drizzle
- **Animations:** Framer Motion (for widget transitions)

## 3. Core Components
- **ChatInterface:** Main container for streaming LLM responses.
- **Generative Widgets:** 
  - Budget Slider (Shadcn)
  - Property Type Selector
  - Suburb Search (Command/Combobox)
- **ProfileProgress:** Persistent tracker showing captured vs. missing data.
- **PropertyResultCard:** High-density card showing Suitability Score, price, and key distances (work/school).

## 4. Scoring Algorithm (Weights)
- **Affordability (30%):** Price vs. Income ratio.
- **Commute (20%):** Distance to work location.
- **School Proximity (15%):** Distance to children's schools.
- **Transport (15%):** Method compatibility.
- **Lifestyle (10%):** Feature matching (security, quiet, etc.).
- **Property Fit (10%):** Beds/Baths/Type.

## 5. Data Flow
1. User enters text or interacts with a widget.
2. useChat hook sends input to Next.js API route.
3. LLM processes input and updates the User Profile state.
4. LLM calls the 'searchProperties' tool.
5. Backend queries MySQL, calculates scores, and returns JSON.
6. Frontend renders 'PropertyResultCard' inline in the chat.
