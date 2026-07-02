export function BlogPostContent() {
  return (
    <article className="prose-blog">
      <p>
        Finding your first rental in Johannesburg is exciting — but signing a
        lease without doing your homework can cost you. Here are 5 questions
        every first-time renter should ask before putting pen to paper:
      </p>

      <section className="mt-8 space-y-4">
        <h2>1. What&rsquo;s included in the rental?</h2>
        <p>
          Water? Electricity? WiFi? Levies? Many Joburg landlords advertise
          &ldquo;R8,000/month&rdquo; but the real cost is R10,500 once utilities
          hit. <strong>Get it in writing.</strong>
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>2. What&rsquo;s the area like after hours?</h2>
        <p>
          That quiet Sandton complex at 11am might be a different story at 11pm.
          Visit twice — once during the day, once in the evening. Walk around.
          Talk to a neighbour if you can.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>3. What&rsquo;s the lease break penalty?</h2>
        <p>
          Life changes fast. Most SA leases require 1–2 months&rsquo; notice
          plus a &ldquo;reasonable&rdquo; penalty — but
          &ldquo;reasonable&rdquo; isn&rsquo;t defined. Negotiate a cap upfront
          (e.g., max 1 month&rsquo;s rent).
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>4. Who handles maintenance — and how fast?</h2>
        <p>
          A dripping geyser or broken gate motor isn&rsquo;t your problem —
          unless the landlord drags their feet for weeks. Ask: &ldquo;What&rsquo;s
          your average response time for urgent repairs?&rdquo;
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <h2>
          5. Is the deposit in an interest-bearing account?
        </h2>
        <p>
          By law (Rental Housing Act), your deposit must earn interest. Ask for
          the account details and a statement when you move out.
        </p>
      </section>

      <hr className="my-10 border-[var(--line)]" />

      <p className="text-[var(--ink-2)]">
        <strong>Bottom line:</strong> The right rental is out there — but you
        need to ask the right questions. PropAlign matches you to listings based
        on your life-stage, budget, and what you actually care about.{' '}
        <a
          href="https://propalign.co.za"
          className="text-[var(--accent-color)] underline underline-offset-2 hover:opacity-80"
        >
          Try it free at propalign.co.za
        </a>
        .
      </p>
    </article>
  );
}
