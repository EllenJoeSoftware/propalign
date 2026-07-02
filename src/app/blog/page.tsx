import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { getAllPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Blog — PropAlign',
  description:
    'South African property tips, rental guides, and buying advice from the PropAlign team.',
  openGraph: {
    title: 'Blog — PropAlign',
    description:
      'South African property tips, rental guides, and buying advice from the PropAlign team.',
    url: 'https://propalign.co.za/blog',
    siteName: 'PropAlign',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — PropAlign',
    description:
      'South African property tips, rental guides, and buying advice from the PropAlign team.',
    images: ['/og-image.png'],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen w-full bg-[var(--paper)] flex flex-col">
      {/* ──── Nav ──── */}
      <header className="shrink-0 border-b border-[var(--line)] px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-1.5 h-8 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper-2)] hover:border-[var(--line-strong)] text-[11px] font-medium text-[var(--ink-2)] transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to PropAlign
        </Link>

        <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium">
          Blog
        </p>

        <div className="w-[124px]" />
      </header>

      {/* ──── Hero ──── */}
      <section className="shrink-0 px-6 pt-16 pb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--line)] bg-[var(--paper-2)] text-[10px] font-medium text-[var(--ink-3)] mb-5">
          <BookOpen className="h-3 w-3" />
          Articles
        </div>
        <h1 className="font-editorial text-[36px] leading-[1.15] font-medium text-[var(--ink)] mb-4">
          PropAlign Blog
        </h1>
        <p className="text-[14px] leading-relaxed text-[var(--ink-2)] max-w-lg mx-auto">
          Rental tips, buying guides, and everything you need to navigate the
          South African property market with confidence.
        </p>
      </section>

      {/* ──── Posts ──── */}
      <section className="shrink-0 px-6 py-12 border-t border-[var(--line)]">
        <div className="max-w-2xl mx-auto">
          {posts.length === 0 ? (
            <p className="text-[14px] text-[var(--ink-3)] text-center py-12">
              No posts yet. Check back soon.
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] p-5 hover:border-[var(--line-strong)] transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-3 w-3 text-[var(--ink-4)]" />
                    <time
                      dateTime={post.date}
                      className="text-[11px] text-[var(--ink-4)]"
                    >
                      {new Date(post.date).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <h2 className="font-editorial text-[16px] font-medium text-[var(--ink)] group-hover:text-[var(--accent-color)] transition-colors mb-1.5">
                    {post.title}
                  </h2>
                  <p className="text-[12px] leading-relaxed text-[var(--ink-3)]">
                    {post.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="shrink-0 border-t border-[var(--line)] px-6 py-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-[14px] font-medium text-[var(--ink)]">
              PropAlign
            </span>
          </div>
          <p className="text-[10px] text-[var(--ink-4)]">
            &copy; {new Date().getFullYear()} PropAlign. South Africa&rsquo;s
            property concierge.
          </p>
        </div>
      </footer>
    </main>
  );
}
