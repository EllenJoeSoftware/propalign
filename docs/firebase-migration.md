# PropAlign — Firebase Migration

PropAlign now uses **Cloud Firestore** as its database, accessed server-side
via the Firebase Admin SDK. MariaDB / Prisma is no longer required at runtime.

> The old Prisma artifacts (`prisma/`, `mariadb`, `@prisma/*`) are still in the
> repo but unused. They can be deleted once you're sure nothing depends on
> them — the only runtime path that touched them was `searchProperties`, and
> that now goes through `src/lib/properties-repo.ts`.

---

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com
2. **Add project** — name it whatever (e.g. `propalign`).
3. In the left rail: **Build → Firestore Database → Create database** in
   production mode. Pick a region close to your users (e.g. `europe-west` for
   SA, or `us-central1` if you need it global).

## 2. Generate a service-account key

1. Project settings (gear icon) → **Service accounts** tab.
2. **Generate new private key** → confirm. A JSON file downloads.
3. Treat it like a password — never commit it.

## 3. Wire it into `.env`

Open `F:\2026\code\repos\propalign\.env` and add **either** of these:

### Option A — single JSON variable (cleanest)

Take the whole downloaded JSON, paste it as one line into:

```
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"…","private_key":"-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----\n","client_email":"…","…":"…"}'
```

The whole thing wrapped in single quotes so the embedded `\n` inside
`private_key` survives.

### Option B — three separate variables

```
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-…@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----\n"
```

## 4. Install + seed

```
npm install
npm run seed:firestore
```

The seed creates 4 demo properties in the `properties` collection. Open
http://localhost:3000/api/db-check after `npm run dev` — it should return:

```json
{
  "status": "connected",
  "backend": "firestore",
  "collection": "properties",
  "sampleCount": 1,
  "sampleTitle": "Modern Apartment in Sandton"
}
```

## 5. Try the chat

`npm run dev` and walk through the interview. When `searchProperties` runs
you'll see logs in the terminal like `searchProperties: found 4 candidates`.

---

## Data model

Collection `properties`, each document:

```ts
{
  title: string;
  description: string;
  price: number;        // Rand
  location: string;     // suburb / city
  propertyType: string; // "Apartment" | "House" | "Cottage" | "Studio" | …
  bedrooms: number;
  bathrooms: number;
  lat: number;
  lng: number;
  features: string;     // JSON-encoded string[] e.g. '["Security","Pool"]'
  imageUrl: string | null;
  isForRent: boolean;   // true = rent, false = sale
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

> `features` is stored as a stringified JSON array for compatibility with the
> existing `scoring.ts`. You can migrate it to a native Firestore array later
> — the repo would need a one-line change.

## Query strategy

Firestore can only apply **one** range filter per query. The repo
(`src/lib/properties-repo.ts`) pushes the most selective filters server-side
and finishes the rest in JavaScript on a bounded candidate set:

| Filter        | Where applied | Reason                                        |
|---------------|---------------|-----------------------------------------------|
| `isForRent`   | Firestore     | equality, free                                |
| `propertyType`| Firestore     | equality, free                                |
| `price <= X`  | Firestore     | the primary range filter, used for ordering   |
| `bedrooms >= Y` | JS in-memory | Firestore disallows two range filters         |
| `location` partial-match across multiple suburbs | JS in-memory | Firestore has no `contains` |

For ≤5,000 listings this is fast and simple. For more, add a `tags` array
field on each property (`['sandton','rosebank','rent','apartment']`) and use
`array-contains-any` queries.

## Indexes

Firestore auto-builds single-field indexes. The first time you run a query
that needs a composite index, the error message in the dev console gives you
a one-click link to create it. Likely composite indexes you'll need:

- `(isForRent ASC, price ASC)` — already covered by the auto-index
- `(propertyType ASC, isForRent ASC, price ASC)` — composite. Click the link.

## Removing Prisma later

When you're confident the migration is complete:

```
npm uninstall @prisma/client @prisma/adapter-mariadb mariadb prisma ts-node
rm -rf prisma/ src/lib/prisma.ts prisma.config.ts
```

Drop the `prisma` block from `package.json`. Drop `DATABASE_URL` from `.env`.
