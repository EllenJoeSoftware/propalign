import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { getAllPosts, getPost } from '@/lib/posts';

// ---------------------------------------------------------------------------
// Static generation
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

// ---------------------------------------------------------------------------
// Per-post SEO metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = `https://propalign.co.za/blog/${slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'PropAlign',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'en_ZA',
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ['/og-image.png'],
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { Content } = post;

  return (
    <main className="min-h-screen w-full bg-[var(--paper)] flex flex-col">
      {/* ──── Nav ──── */}
      <header className="shrink-0 border-b border-[var(--line)] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/blog"
            className="focus-ring inline-flex items-center gap-1.5 h-8 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] font-medium text-[var(--ink-2)] transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            All posts
          </Link>
          <Link
            href="/"
            className="focus-ring hidden sm:inline-flex items-center gap-1 h-8 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] font-medium text-[var(--ink-2)] transition-colors"
          >
            Home
          </Link>
        </div>

        <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
          Blog
        </p>

        <div className="w-[124px]" />
      </header>

      {/* ──── Article header ──── */}
      <article className="shrink-0 px-6 pt-16 pb-8 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-3.5 w-3.5 text-[var(--accent-color)]" />
          <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
            Article
          </span>
        </div>

        <h1 className="font-editorial text-[32px] leading-[1.2] font-medium text-[var(--ink)] mb-4">
          {post.title}
        </h1>

        <p className="text-[14px] leading-relaxed text-[var(--ink-2)] mb-6">
          {post.description}
        </p>

        <div className="flex items-center gap-2 text-[11px] text-[var(--ink-4)]">
          <Clock className="h-3 w-3" />
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-ZA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </article>

      {/* ──── Article body ──── */}
      <section className="shrink-0 px-6 py-12 border-t border-[var(--line)]">
        <div className="max-w-2xl mx-auto text-[15px] leading-[1.8] text-[var(--ink)]">
          <Content />
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="shrink-0 border-t border-[var(--line)] px-6 py-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-editorial text-[14px] font-medium text-[var(--ink)]">
              PropAlign
            </span>
          </Link>
          <p className="text-[10px] text-[var(--ink-4)]">
            &copy; {new Date().getFullYear()} PropAlign. South Africa&rsquo;s
            property concierge.
          </p>
        </div>
      </footer>
    </main>
  );
}
