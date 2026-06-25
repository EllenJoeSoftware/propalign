'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  Home,
  Users,
  TrendingUp,
  Shield,
  Send,
  ArrowLeft,
  Check,
  MapPin,
  Building2,
  Sparkles,
  BadgeCheck,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Free listing exposure',
    body: 'Your properties reach qualified buyers and renters actively searching — at no cost to you.',
  },
  {
    icon: Users,
    title: 'Life-stage matched leads',
    body: 'Every lead is matched by budget, commute, family size, and long-term goals. No spray-and-pray.',
  },
  {
    icon: Sparkles,
    title: 'Smart property insights',
    body: 'Each listing gets cost breakdowns, suburb context, honesty badges, and rent-vs-buy analysis.',
  },
  {
    icon: Shield,
    title: 'Zero commitment',
    body: 'No contracts, no exclusivity, no hidden fees. List what you want, when you want.',
  },
];

const WHAT_WE_DO = [
  {
    icon: MapPin,
    title: 'Intelligent matching',
    body: 'We surface properties that fit a buyer\u2019s life-stage, budget, and personal preferences — not just square metres.',
  },
  {
    icon: Building2,
    title: 'SA-wide coverage',
    body: 'Gauteng, Western Cape, KZN, and beyond. Urban flats, suburban houses, coastal retreats.',
  },
  {
    icon: BadgeCheck,
    title: 'Honest by design',
    body: 'Transparent cost breakdowns, suburb context, days-on-market history. Buyers make informed decisions.',
  },
];

export default function PartnersPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setError('');

    const form = e.currentTarget;
    const body = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      agency: (form.elements.namedItem('agency') as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim(),
    };

    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

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
          For Agents &amp; Agencies
        </p>

        {/* spacer to center the label */}
        <div className="w-[124px]" />
      </header>

      {/* ──── Hero ──── */}
      <section className="shrink-0 px-6 pt-16 pb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--line)] bg-[var(--paper-2)] text-[10px] font-medium text-[var(--good)] mb-5">
          <BadgeCheck className="h-3 w-3" />
          Free for agents
        </div>
        <h1 className="font-editorial text-[36px] leading-[1.15] font-medium text-[var(--ink)] mb-4">
          Partner with PropAlign
        </h1>
        <p className="text-[14px] leading-relaxed text-[var(--ink-2)] max-w-lg mx-auto mb-8">
          South Africa&rsquo;s property concierge — we match serious buyers and
          renters to the right home. List your properties for free and reach
          qualified leads who are ready to move.
        </p>
        <a
          href="#contact"
          className="focus-ring inline-flex items-center gap-2 h-10 px-5 rounded-[6px] bg-[var(--accent-color)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity"
        >
          <Send className="h-3.5 w-3.5" />
          List your properties — free for agents
        </a>
      </section>

      {/* ──── What we do ──── */}
      <section className="shrink-0 px-6 py-12 border-t border-[var(--line)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium mb-3">
            About PropAlign
          </p>
          <h2 className="font-editorial text-[22px] font-medium text-[var(--ink)] mb-8">
            What we do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WHAT_WE_DO.map((item) => (
              <article
                key={item.title}
                className="rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] p-5"
              >
                <item.icon
                  className="h-5 w-5 text-[var(--accent-color)] mb-3"
                  strokeWidth={1.5}
                />
                <h3 className="text-[13px] font-semibold text-[var(--ink)] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-[12px] leading-relaxed text-[var(--ink-3)]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Agent benefits ──── */}
      <section className="shrink-0 px-6 py-12 border-t border-[var(--line)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium mb-3">
            Why partner with us
          </p>
          <h2 className="font-editorial text-[22px] font-medium text-[var(--ink)] mb-2">
            Benefits for agents
          </h2>
          <p className="text-[12px] text-[var(--ink-3)] mb-8">
            Everything you need to get your listings in front of the right
            people — at zero cost.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BENEFITS.map((item) => (
              <article
                key={item.title}
                className="rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] p-5 flex gap-4"
              >
                <div className="shrink-0 w-9 h-9 rounded-[8px] bg-[var(--accent-tint)] flex items-center justify-center">
                  <item.icon
                    className="h-4 w-4 text-[var(--accent-color)]"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-[var(--ink)] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-[var(--ink-3)]">
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Contact form ──── */}
      <section
        id="contact"
        className="shrink-0 px-6 py-12 border-t border-[var(--line)]"
      >
        <div className="max-w-lg mx-auto">
          <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-3)] font-medium mb-3">
            Get started
          </p>
          <h2 className="font-editorial text-[22px] font-medium text-[var(--ink)] mb-2">
            Let&rsquo;s work together
          </h2>
          <p className="text-[12px] text-[var(--ink-3)] mb-8">
            Drop your details and we&rsquo;ll get back to you within 24 hours.
          </p>

          {sent ? (
            <div className="rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] p-6 text-center">
              <Check
                className="h-8 w-8 text-[var(--good)] mx-auto mb-3"
                strokeWidth={1.5}
              />
              <h3 className="font-editorial text-[16px] font-medium text-[var(--ink)] mb-1">
                Thanks for reaching out
              </h3>
              <p className="text-[12px] text-[var(--ink-3)]">
                We&rsquo;ll be in touch shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-medium text-[var(--ink-2)]">
                    Name
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Dlamini"
                    className="focus-ring w-full h-9 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] text-[12px] text-[var(--ink)] placeholder:text-[var(--ink-4)]"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-medium text-[var(--ink-2)]">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="jane@agency.co.za"
                    className="focus-ring w-full h-9 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] text-[12px] text-[var(--ink)] placeholder:text-[var(--ink-4)]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-medium text-[var(--ink-2)]">
                    Agency
                  </span>
                  <input
                    name="agency"
                    type="text"
                    placeholder="Pam Golding, RE/MAX, etc."
                    className="focus-ring w-full h-9 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] text-[12px] text-[var(--ink)] placeholder:text-[var(--ink-4)]"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-medium text-[var(--ink-2)]">
                    Phone
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="+27 82 123 4567"
                    className="focus-ring w-full h-9 px-3 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] text-[12px] text-[var(--ink)] placeholder:text-[var(--ink-4)]"
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-[11px] font-medium text-[var(--ink-2)]">
                  Message
                </span>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Tell us about your agency and the areas you cover..."
                  className="focus-ring w-full px-3 py-2 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] text-[12px] text-[var(--ink)] placeholder:text-[var(--ink-4)] resize-y"
                />
              </label>

              {error && (
                <p className="text-[11px] text-[var(--danger)]">{error}</p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="focus-ring inline-flex items-center gap-2 h-10 px-5 rounded-[6px] bg-[var(--accent-color)] text-white text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sending ? (
                  'Sending…'
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="shrink-0 border-t border-[var(--line)] px-6 py-6 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-[var(--accent-color)]" strokeWidth={1.5} />
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
