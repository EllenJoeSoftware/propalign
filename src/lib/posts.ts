import { BlogPostContent } from '@/content/blog/first-time-renter-joburg-questions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  keywords: string[];
}

export interface BlogPost extends BlogPostMeta {
  Content: React.ComponentType;
}

// ---------------------------------------------------------------------------
// Registry — add new posts here
// ---------------------------------------------------------------------------

const posts: BlogPost[] = [
  {
    slug: 'first-time-renter-joburg-questions',
    title:
      '5 Questions Every First-Time Renter in Joburg Should Ask Before Signing a Lease',
    description:
      'Moving out for the first time? Ask these 5 questions before you sign anything. PropAlign helps you find rentals that actually fit your life.',
    date: '2026-07-02',
    keywords: [
      'first time renter Johannesburg',
      'Joburg rental questions',
      'SA rental tips',
      'questions to ask before renting',
      'tenant rights South Africa',
    ],
    Content: BlogPostContent,
  },
];

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/** Returns lightweight metadata for every published post (newest first). */
export function getAllPosts(): BlogPostMeta[] {
  return posts
    .map(({ slug, title, description, date, keywords }) => ({
      slug,
      title,
      description,
      date,
      keywords,
    }))
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
}

/** Returns a full post (metadata + content component) by slug. */
export function getPost(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
