export function BlogPostContent() {
  return (
    <article className="prose-blog">
      <p>
        Searching for a home in South Africa is exhausting. The average buyer
        spends 40–60 hours scrolling listings, driving to viewings, and dealing
        with estate agents — only to find properties that don&rsquo;t match
        their needs.
      </p>

      <p className="mt-6">
        <strong>PropAlign changes this.</strong>
      </p>

      <section className="mt-10 space-y-4">
        <h2>What Makes PropAlign Different</h2>
        <p>
          Instead of keyword searches and price filters, PropAlign understands{' '}
          <em>you</em>. Your life-stage. Your budget. Your non-negotiables. It
          then surfaces only the listings that actually matter.
        </p>

        <ul className="list-disc pl-5 space-y-2 text-[14px] leading-relaxed">
          <li>
            <strong>Life-stage matching:</strong> First-time buyer? Growing
            family? Downsizing? PropAlign adjusts.
          </li>
          <li>
            <strong>Smart filtering:</strong> School proximity, commute times,
            security — not just bedrooms and bathrooms.
          </li>
          <li>
            <strong>No spam:</strong> Only properties that genuinely match your
            criteria.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2>The Numbers</h2>
        <p>
          South Africans view an average of 12 properties before making an
          offer. With PropAlign&rsquo;s AI concierge, our beta users viewed
          just 4 on average — a{' '}
          <strong>67% reduction in wasted time</strong>.
        </p>
      </section>

      <section className="mt-10 space-y-4">
        <h2>Try It Free</h2>
        <p>
          Visit{' '}
          <a
            href="https://propalign.co.za"
            className="text-[var(--accent-color)] underline underline-offset-2 hover:opacity-80"
          >
            propalign.co.za
          </a>{' '}
          and tell us what you&rsquo;re looking for. We&rsquo;ll do the rest.
        </p>
      </section>

      <hr className="my-10 border-[var(--line)]" />

      {/* CTA */}
      <div className="rounded-[10px] border border-[var(--line)] bg-[var(--paper-2)] p-6 text-center">
        <p className="text-[14px] font-medium text-[var(--ink)] mb-4">
          Ready to find your home faster?
        </p>
        <a
          href="https://propalign.co.za"
          className="inline-flex items-center gap-2 h-10 px-5 rounded-[8px] bg-[var(--accent-color)] text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          Start Your Search &rarr;
        </a>
      </div>

      <p className="mt-8 text-[13px] italic text-[var(--ink-3)] text-center">
        PropAlign — Find the right home. Faster.
      </p>
    </article>
  );
}
