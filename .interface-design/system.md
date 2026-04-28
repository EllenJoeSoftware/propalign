# PropAlign — Design System

A South African real-estate concierge. Helps people find a home through a calm,
trustworthy chat. Treats property data like data.

---

## Direction

**Sophistication & Trust** with a warm-paper foundation.

The interface should feel like a quiet conversation with a knowledgeable estate
agent flipping through a leather-bound listings book — not a SaaS dashboard,
not a fintech app, not a marketing site. Confident, restrained, precise.

**Personality:** Quiet · Precise · Warm
**Foundation:** Warm off-white paper, deep slate ink
**Depth:** Borders-only — hairlines, no shadows
**Density:** Comfortable — generous breathing room around currency

## Domain Anchors

Pulling from the SA property world, not the SaaS world:

- Sandstone facades, lime-washed coastal walls → warm off-white surfaces
- Highveld midday sky → deep clear navy as the sole accent
- Acacia leaves → muted olive-green for "good fit" signals
- Terracotta tiles → warm rust for emphasis
- Property classifieds → monospace for data, serif-feeling weight on names

## Tokens

### Color Primitives

```
/* Surfaces */
--paper:        #FAF7F2   /* canvas — warm off-white */
--paper-2:      #FFFFFF   /* card / elevated */
--paper-3:      #F4F0EA   /* inset / control bg */

/* Foreground (4 levels) */
--ink:          #0E1623   /* primary text */
--ink-2:        #3F4A5C   /* secondary */
--ink-3:        #6B7280   /* tertiary metadata */
--ink-4:        #9CA3AF   /* muted / placeholder */

/* Lines (3 levels) */
--line-soft:    rgba(14, 22, 35, 0.05)
--line:         rgba(14, 22, 35, 0.10)
--line-strong:  rgba(14, 22, 35, 0.18)   /* hover, focus */

/* The single accent */
--accent:       #1E3A5F   /* highveld-navy — used sparingly */
--accent-tint:  rgba(30, 58, 95, 0.07)

/* Semantic (only when state needs to shout) */
--good:         #4F7C3A   /* acacia */
--warn:         #B7793C   /* terracotta */
--danger:       #9C2E2E
```

**Rule:** Every color in code traces back to one of these. No ad-hoc hexes.
Color carries meaning — gray builds structure, accent communicates intent.

### Spacing

4px base. Scale: **4, 8, 12, 16, 24, 32, 48, 64**.

| Token   | Value | Use                                       |
|---------|-------|-------------------------------------------|
| `s-1`   | 4     | icon-text gap, micro                      |
| `s-2`   | 8     | tight component padding                   |
| `s-3`   | 12    | comfortable component padding             |
| `s-4`   | 16    | default card padding                      |
| `s-6`   | 24    | between groups inside a card              |
| `s-8`   | 32    | between distinct sections                 |
| `s-12`  | 48    | between major regions                     |

Padding stays symmetrical. `padding: 16px` not `padding: 12px 14px 18px 16px`.

### Border Radius

| Token | Value | Use                  |
|-------|-------|----------------------|
| `r-1` | 4px   | input chips          |
| `r-2` | 6px   | buttons, inputs      |
| `r-3` | 8px   | small cards          |
| `r-4` | 10px  | cards                |
| `r-5` | 14px  | sliders / containers |
| `pill`| 9999  | pills only           |

No mixing sharp and round randomly. Inputs and buttons share `r-2`.

### Typography (3-family system)

Three deliberate roles. Mixing them is the signature.

- **Geist Sans** — UI chrome, body, labels. The structural voice.
- **Fraunces** (variable serif) — Listing copy: property titles, hero
  headlines, editorial kickers. Treat listings like editorial pieces.
- **Geist Mono** with `tabular-nums` — Prices, scores, IDs. Data treated
  as data, not as text.

| Role               | Family   | Size | Weight | Tracking |
|--------------------|----------|------|--------|----------|
| Hero headline      | Fraunces | 28   | 500    | -0.02em  |
| Listing title      | Fraunces | 18   | 500    | -0.01em  |
| Section label      | Sans     | 11   | 500    | 0.08em   |
| Body               | Sans     | 14   | 400    | 0        |
| Metadata           | Sans     | 12   | 400    | 0        |
| Caption            | Sans     | 11   | 400    | 0        |
| Data (price/score) | Mono     | varies | 500  | -0.01em  |

Hierarchy through **family + weight + size + tracking**, never size alone.

**The pairing rule:** within any single component, you may mix at most two
of the three families. The hero card uses Fraunces + Mono. UI chrome uses
Sans + Mono. Listing rows use Fraunces + Sans + Mono (the only place all
three meet, and only because each does a distinct job).

### Depth Strategy: Borders-only

ONE strategy. No shadows except focus rings. No glassmorphism. No gradients.

Elevation comes from:
1. Background lightness shift (paper → paper-2 → paper-3)
2. Hairline border at low opacity

Focus rings are the one allowed "glow" — `box-shadow: 0 0 0 3px rgba(30,58,95,0.18)`.

---

## Component Patterns

### Surfaces

- **Page** — `--paper` background, no max-width fluff, no decorative gradient.
- **Card** — `--paper-2` background, `1px solid --line`, `r-4`, `padding: 16`.
- **Inset (input bg)** — `--paper-3`, `1px solid --line-soft`, `r-2`.
- **Sidebar/header** — same `--paper` as canvas, separated by `1px solid --line`.

### Buttons

- **Primary** — solid `--accent` background, white text, `r-2`, `36px` height,
  `padding: 0 14px`, label weight 500. Hover: `--accent` at 92% lightness.
  No shadow, no gradient.
- **Secondary** — `--paper-2` background, `1px solid --line`, `--ink` text.
  Hover: `--line-strong` border.
- **Ghost** — transparent, `--ink-2` text. Hover: `--paper-3` background.

Active state: scale `0.98`, no shadow change. Focus: 3px accent ring at 18%.

### Chips / Pills

`r-pill`, `padding: 4px 10px`, label-style typography.
Inactive: `--paper-2` + `--line` border + `--ink-2` text.
Active: `--accent` background + white text. Single check icon at start.

No gradient. No shadow.

### Match Score Badge

Mono tabular numerals. The **only** numeric element to deserve emphasis-by-color:
- 80–100 → `--good` text, `--good` at 12% bg
- 60–79  → `--ink` text, `--paper-3` bg
- <60    → `--ink-3` text, `--paper-3` bg

A small horizontal hairline progress mark (1px tall, accent-tinted) under the
percentage reinforces "calculated value."

### Property Card

- Image: `r-4 r-4 0 0` (top corners only), `h-40`, fade-to-paper bottom edge.
- Body: `padding: 16`, three rows: title+price · location/type · beds/baths.
- Title: title style. Price: mono, primary ink. Metadata: caption, ink-3.
- Hover: `--line-strong` border, no transform, no shadow.

### Slider Card (income/budget)

- Card surface, `padding: 16`, internal stack `gap: 16`.
- Big value at top: display style, ink primary, mono.
- Track: 4px tall, `--paper-3` background, `--accent` fill.
- Thumb: 14px circle, `--paper-2` background, 1.5px solid `--accent`. Focus
  ring as described above. No shadow on the thumb at rest.
- Confirm: primary button, full width.

### Chat bubbles

- Assistant: `--paper-2` bg, `1px solid --line`, `r-4` (no asymmetric tail
  except on the leading corner: `border-bottom-left-radius: r-1`), `padding: 12 16`.
- User: `--accent` bg, white text, mirror radius. Solid color, no gradient.
- Avatar (assistant only): 24px circle, `--accent` bg, single mono initial "P".

### Input bar

- `--paper-2` shell, `1px solid --line`, `r-3`. Focus inside-shell: `--line-strong`.
- Send button: 32px square, `--accent`, white icon, `r-2`. Disabled: `--ink-4`.

---

## DO NOT

- Mix depth strategies — no shadows + borders combo
- Use the brand gradient anywhere — there is no brand gradient
- Use more than one accent color (navy is the only accent)
- Use color for decoration — every color must communicate
- Use harsh borders (1px solid hex) — always low-opacity rgba
- Use different hues for different surfaces — same hue, only lightness shifts
- Use native `<select>` or `<input type="date">`
- Animate with bounce/spring — only smooth ease-out

---

## Workflow

When building or editing UI in this project:
1. Read this file first.
2. Reach only for the tokens defined here.
3. State the depth strategy + spacing scale + accent choice in the commit
   message or PR description.
4. Run the **squint test** before shipping — can you still perceive hierarchy
   with blurred eyes? Does anything jump out?
5. Run the **swap test** — would swapping the navy accent for a generic blue
   change the feel? If not, accent isn't doing enough work.
