# PropAlign — Adaptive Interview Algorithm

A 7-question, evidence-backed flow for matching South African home-seekers to
the right property. Designed to maximize signal per question, infer personality
without asking directly, and personalize the suitability scoring rather than
applying a one-size-fits-all weight set.

> **Goal:** Match the satisfaction quality of a 20-question form in 7 questions
> by asking what *actually predicts* long-term residential satisfaction
> (commute, chronic stressors, security, life stage, fit-for-personality) and
> dropping what doesn't (square footage, finishes, vague "lifestyle" prompts).

---

## Research foundations

The flow is built on these findings (full sources at the end):

1. **People adapt to space and finishes within months** (Frederick & Loewenstein, 1999) — don't waste questions on "ideal size" or "modern kitchen?". Treat bedrooms as a *constraint*, not a preference.
2. **People do NOT adapt to commute, noise, neighbour conflict, light** (Stutzer & Frey, 2008 — "commuting paradox") — these deserve heavy weight and explicit asking.
3. **Affective forecasting is unreliable** (Gilbert & Wilson, 2005) — Likert-scale "rate the importance of X" is poor signal. Use forced-choice trade-offs.
4. **Big Five traits predict neighbourhood fit** (Rentfrow, Gosling, Potter, 2008) — but you can infer them via paired vibe choices instead of personality questions.
5. **Life-stage archetype dominates variance** (Beer et al., Housing Transitions) — one upfront archetype question unlocks downstream priorities.
6. **Computer Adaptive Testing cuts question count 40-60%** (IRT) — pick the next question by maximum information gain over what's still uncertain.
7. **SA-specific: gated/security tier and load-shedding resilience** are now primary drivers in mid-upper income segments — globally underweighted.
8. **Onboarding completion crashes after 8-10 visible steps** (proptech / fintech benchmarks).

---

## The 12 latent dimensions we want to fill

| Dim                     | Type        | Source                            |
|-------------------------|-------------|-----------------------------------|
| `lifeStage`             | categorical | Q1                                |
| `horizon`               | categorical | Q2                                |
| `isBuying`              | bool        | Q2                                |
| `netIncome`             | number      | Q3a                               |
| `budget`                | number      | Q3b                               |
| `topPriorities`         | set of 2    | Q4 (forced-choice)                |
| `socialDensityPref`     | scale       | Q5 vibe pair 1 (proxies extraversion) |
| `aestheticEra`          | categorical | Q5 vibe pair 2 (proxies openness) |
| `securityTier`          | categorical | Q5 vibe pair 3 (SA-specific)     |
| `provinces` + `suburbs` | sets        | Q6                                |
| `bedroomsMin`           | int         | Q7 (constraint, not preference)   |
| `noiseSensitivity` / `resilience` | optional | Q8 conditional         |

7 visible interactions. 12 dimensions captured. No question wasted on a single dimension — every question contributes to at least 2.

---

## The flow

**Q1. Life Stage** *(single click)*
What best describes you?
- Solo · Couple · Family with kids · Roommates · Empty-nester / retiring

→ Sets `lifeStage`, baseline `socialDensityPref`, conditional `schoolWeight`, default `securityTier`.

**Q2. Rent or Buy + Horizon** *(single click)*
- Renting (short term) · Renting (settling in) · Buying (starter) · Buying (forever)

→ Sets `isBuying`, `horizon`. Long-horizon → up-weight school catchment, resale, locality permanence.

**Q3. Income → Budget** *(two sliders, in order)*
Sliders we already have. Show 30%-of-income line on the budget slider as a guide. If user pushes >40% of net income → soft warning ("most South Africans aim for ≤30% of net income on housing — want to revisit?"). Doesn't block.

**Q4. Top-2 trade-off** *(pick TWO of six chips — MaxDiff style)*
"What matters most to you? Pick TWO."
- Short commute / remote-work flexibility
- Quiet, safe streets
- Walkable to shops, cafés, life
- Top-rated schools *(shown only if family + kids)*
- Lock-and-go security (gated/complex)
- Outdoor space (garden / balcony)

→ Each pick gives **+10 to that dimension's weight**, redistributed from non-picked. This is the core personalization step. People can't reliably rate importance, but they can pick.

**Q5. Three paired vibes** *(three forced-choice pairs)*
"Which feels more like you?"
1. *Streets buzzing till late* vs *Quiet by 9pm* → extraversion proxy → social density
2. *Original character home* vs *Brand-new finishes* → openness proxy → era preference
3. *Standalone with high walls* vs *Gated estate* vs *Complex / apartment* → security tier

→ Implicit Big Five-light + SA-specific security segmentation, no personality test required.

**Q6. Location** *(province multi-select → suburb chips)*
Already built. Possibly auto-suggest suburbs based on Q1+Q5+budget after running, instead of forcing user to know SA geography.

**Q7. Bedrooms minimum** *(single tap: 1 / 2 / 3 / 4+)*
Frame as constraint not preference: "What's the smallest you'd consider?" People want bigger; the research says they adapt to whatever they get. Don't ask "ideal." Ask "minimum acceptable."

**(Optional Q8) Chronic avoidances** *(only if Q4 didn't cover quiet)*
"Anything you'd want to avoid?"
- Highway noise · Long load-shedding · Steep hills · High body corp fees · Skip

---

## Adaptive logic

```ts
function nextQuestion(profile: PartialProfile): Question | null {
  // Hard order — these unlock everything
  if (!profile.lifeStage) return Q.LIFE_STAGE;
  if (profile.isBuying === undefined) return Q.RENT_OR_BUY;
  if (!profile.netIncome) return Q.INCOME;
  if (!profile.budget) return Q.BUDGET;

  // From here, pick by info gain over uncertain dimensions
  const uncertain = profile.unknownDimensions();
  const candidates = remainingQuestions(profile);
  return argmax(candidates, q =>
    intersect(q.contributesTo, uncertain).length * q.discriminationPower
  );
}

function shouldStop(profile: PartialProfile): boolean {
  const REQUIRED = ['lifeStage', 'isBuying', 'budget', 'topPriorities', 'suburbs'];
  return REQUIRED.every(d => profile[d] !== undefined)
      || profile.questionsAsked >= 7
      || profile.userClickedFindHomes;
}
```

If the user clicks "find me homes now" at any point after Q4, run with whatever's collected and downgrade unknowns to neutral weights.

---

## Personalized scoring (replaces fixed weights in `scoring.ts`)

### Step 1 — archetype base weights (sum to 100)

```ts
const BASE = {
  solo:          { afford:25, commute:25, social:15, security:5,  outdoor:5,  schools:0,  resilience:10, fit:10, noise:5 },
  couple:        { afford:20, commute:20, social:10, security:10, outdoor:15, schools:0,  resilience:10, fit:10, noise:5 },
  young_family:  { afford:20, commute:15, social:5,  security:15, outdoor:15, schools:5,  resilience:10, fit:10, noise:5 },
  school_family: { afford:18, commute:15, social:5,  security:12, outdoor:10, schools:20, resilience:10, fit:5,  noise:5 },
  empty_nester:  { afford:20, commute:5,  social:10, security:15, outdoor:15, schools:0,  resilience:15, fit:15, noise:5 },
  roommates:     { afford:30, commute:25, social:20, security:5,  outdoor:5,  schools:0,  resilience:5,  fit:5,  noise:5 },
};
```

### Step 2 — apply Q4 trade-off boosts

For each picked priority: +10 to its weight. Redistribute -20 proportionally from non-picked dimensions (excluding `afford` which we don't lower).

### Step 3 — apply Q5 vibe modifiers

These shift sub-score *calculations*, not weights:
- `socialDensityPref` shifts which suburb characteristics score "good"
- `aestheticEra` shifts how the property's age/style scores
- `securityTier` filters/penalizes properties not matching the chosen tier

### Step 4 — score each property

```ts
score = Σ (weight[dim] * subScore[dim]) for all 9 dimensions
```

Subscores stay 0-1 per dimension (e.g. `commute` = 1 if <15min, 0.7 if <30, 0.4 if <45, 0.1 otherwise). Final score 0-100.

### Step 5 — cap and explain

Cap at 100, generate explanation by listing the top 2-3 dimensions where this property scored highest. Never list dimensions where it scored low — let the user make the trade-off themselves.

---

## What gets DROPPED from the current flow

1. The free-text *"lifestyle preferences (schools, pet-friendly, transport)"* question — vague, low signal, high cognitive load. Replaced by Q4 (trade-offs) + Q5 (vibe).
2. The implicit "ideal bedrooms" framing — replaced with explicit *minimum acceptable*.
3. Generic "preferred suburb" without context — the suburb picker now runs *after* Q4/Q5 so we can suggest suburbs that match the inferred profile.

---

## Implementation roadmap (mapped to current code)

1. **`route.ts`** — three new client-side tools:
   - `askLifeStage` (5-chip widget)
   - `askTopTwoTradeoffs` (pick-2-of-6 widget, conditionally include schools)
   - `askVibeProxies` (three paired-text or paired-image cards)

2. **`scoring.ts`** — replace fixed-weight `calculateSuitabilityScore` with the archetype + trade-off-boost system above. Add `socialDensityPref`, `securityTier`, `aestheticEra`, `topPriorities` to `UserProfile`.

3. **System prompt** — replace "collection order 1-6" with the new flow. Add the explicit instruction: *"If the user clicks 'find me homes now' or asks to skip ahead at any point, immediately call searchProperties with whatever profile data has been gathered."*

4. **Suburb picker enhancement** — when user reaches Q6, sort suburbs by inferred profile match instead of alphabetical.

5. **Soft-warn UI on budget slider** — colour the >30%-of-income zone in `--warn` (terracotta) and show a small note. Don't block.

---

## Sources

- Frederick, S. & Loewenstein, G. (1999). *Hedonic Adaptation*. https://www.cmu.edu/dietrich/sds/docs/loewenstein/HedonicAdaptation.pdf
- Stutzer, A. & Frey, B. S. (2008). *Stress That Doesn't Pay: The Commuting Paradox*. https://ideas.repec.org/p/zur/iewwpx/151.html
- Gilbert, D. T. & Wilson, T. D. (2005). *Affective Forecasting*. Sage Journals.
- Rentfrow, P. J., Gosling, S. D. & Potter, J. (2008). *A Theory of the Emergence, Persistence, and Expression of Geographic Variation in Psychological Characteristics*. https://journals.sagepub.com/doi/10.1111/j.1745-6924.2008.00084.x
- Amerigo, M. & Aragones, J. I. (1997). *A Theoretical and Methodological Approach to the Study of Residential Satisfaction*.
- Beer, A., Faulkner, D., Paris, C. & Clower, T. (eds.). *Housing Transitions Through the Life Course*.
- *Computer Adaptive Testing & IRT* — Cambridge psychometrics resources.
- *MaxDiff vs Likert* — survey-design literature, e.g. Survalyzer & PMC reviews.
- SA-specific: gated estate trends, load-shedding impact on residential preference.
