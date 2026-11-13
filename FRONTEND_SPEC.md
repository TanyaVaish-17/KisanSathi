# Kisan Sarthi: Frontend Spec (Design System + Pages)

One document combining:
- the **design system** taken from the Keyvo export (fonts, colors, spacing, components, motion),
- the **page list** built from the routes currently mounted in the API,
- the **Lottie animation** for the login and register pages,
- the **BrandHero animation** (framer-motion) for the landing page hero,
- the **Token card** (a ticket-style card) that shows a farmer their token.

**Roles:** `farmer`, `operator`, `admin`. **Auth:** JWT sent as `Authorization: Bearer <token>`.

> **Sources and confidence.** Design tokens marked "Keyvo" were read from the exported Keyvo page. The export had no animation timing, so motion values here are **proposals**. Anything under "Proposal" is my suggestion, not Keyvo's. API details come from the routes document you shared. Hero animation timings come from the component code you supplied. Pages that need token/queue endpoints are marked **Blocked**.

---

## 1. Design system

### 1.1 Fonts

| Role | Font | Source |
|------|------|--------|
| Primary | **Host Grotesk** (400, 500, 700) | Keyvo, Google Fonts |
| Labels / badges | **Azeret Mono** (600) | Keyvo, Google Fonts |
| Hindi fallback | **Noto Sans Devanagari** (400, 500, 700) | Proposal. Host Grotesk has no Devanagari glyphs |

Font stack: `"Host Grotesk", "Noto Sans Devanagari", system-ui, sans-serif`.

### 1.2 Type scale (Keyvo desktop values)

| Style | Size | Weight | Line height | Color |
|-------|------|--------|-------------|-------|
| Display (hero) | 80px | 700 | 110% | `#032304` |
| H1 (section headline) | 56px | 700 | 120% | `#032304` |
| H4 (feature title) | 24px | 700 | 120% | `#032304` |
| Step title | 20px | 700 | 150% | `#032304` |
| Lead paragraph | 20px | 400 | 150% | `#4a4e49` |
| H5 (card title) | 18px | 700 | 120% | `#032304` |
| Body | 16px | 400 | 150% | `#4a4e49` |
| Body small | 14px | 400 | 150% | `#4a4e49` |
| Button text | 14-16px | 500 | 100% | see buttons |
| Metric value | 16px | 700 | 120% | `#131413` |
| Metric label | 12px | 500 | 120% | `#6e746d` |
| **Eyebrow label** | 14px, uppercase, Azeret Mono, tracking 0.2em | 600 | 20px | `#032304` |
| Badge label | 10px, uppercase, Azeret Mono, tracking 0.04em | 600 | 12px | `#032304` |
| Big stat | 74px, tabular numbers | 700 | 1em | `#c5fbc6` on dark |

**Mobile sizes (Proposal, since the export did not include them):** Display 40px, H1 32px, H4 20px, body 16px, eyebrow 12px. Hindi text needs about 10% more line height (body 160%).

### 1.3 Colors

| Token | Hex | Role |
|-------|-----|------|
| `forest-950` | `#032304` | Headings, primary button, footer background |
| `ink` | `#131413` | Metric text, outline button text |
| `slate-text` | `#4a4e49` | Body text, nav links |
| `slate-muted` | `#6e746d` | Labels, small text |
| `line-strong` | `#b8c2b6` | Navbar and card borders |
| `line-soft` | `#d4dad3` | Outline button and input borders |
| `divider` | `#e3e7e2` | Thin dividers |
| `surface` | `#f8f9f8` | Alternating section background |
| `surface-2` | `#f7f8f6` | Inner card background |
| `white` | `#ffffff` | Page and cards |
| `mint-200` | `#c5fbc6` | Footer text, chips |
| `mint-100` | `#cbfbcc` | Image card tint |
| `lime-300` | `#8bf78d` | Primary button text, link hover on dark |
| `lime-brand` | `#17ee1a` | Brand accent (final CTA panel, highlight chip) |
| `green-500` | `#12be15` | Good status dot |
| `green-600` | `#0e8f10` | Dots and icons |
| `green-800` | `#095f0a` | Dark stat card |
| `orange-500` | `#fe7e3b` | Warning dot |
| `pink-100` | `#fdd4d9` | Soft error tint |
| `danger` | `#c0392b` | Error text (Proposal; Keyvo has no strong red) |

Rules:
- Do not use `#17ee1a` as text on white; use it as a **background** with `#032304` text.
- Keyvo's 12px caption color (`#2b372a` at 62% alpha) is only about 3.8:1 contrast by my estimate. Use `#6e746d` for small text.
- Never show status by color alone; always add a label or icon.

### 1.4 Layout, spacing, radius

| Item | Value |
|------|-------|
| Breakpoints | Mobile up to 809px; tablet 810-1439px; desktop 1440-1679px; large 1680px and up |
| Max content width | 1680px (text blocks 640-960px) |
| Section padding | 120px vertical, 80px sides (desktop); 64px sides (tablet); about 64px top, 24px sides, 48px bottom (mobile) |
| Navbar | 32px vertical, 80px horizontal padding, white, 1px bottom border `#b8c2b6` |
| Gaps in use | 4, 6, 8, 12, 16, 20, 24, 32, 48, 64, 80px |
| Radius | Buttons **4px**; chips 2px; cards 8px and 12px; large panels 16px; pills and dots fully round |
| Shadows | **None**, with one exception: the Token card's solid offset shadow (section 6.4). Depth otherwise comes from borders and background tints |
| Section backgrounds | Alternate white and `#f8f9f8` |

### 1.5 Components

**Buttons (Keyvo)**

| Variant | Height | Padding | Background | Border | Text |
|---------|--------|---------|------------|--------|------|
| Primary large | 52px | 16px 24px | `#032304` | none | `#8bf78d`, 16px, 500 |
| Primary medium | 44px | 14px 20px | `#032304` | none | `#8bf78d`, 14px, 500 |
| Outline large | 52px | 16px 24px | `#fff` | 1px `#d4dad3` | `#131413`, 500 |
| Outline medium | 44px | 14px 20px | `#fff` | 1px `#d4dad3` | `#131413`, 14px, 500 |

All buttons have a 4px radius and no shadow.

**Other components (Keyvo)**
- **Eyebrow label** above every section headline.
- **Chip:** 2px radius, padding about 4px 6px, background `#c5fbc6` (or `#17ee1a` for emphasis).
- **Status pill:** white, fully rounded, padding 4px 8px, 7px colored dot plus 12px label.
- **Cards:** white with 12px radius and 24px padding; tinted inner card `#f7f8f6` with 8px radius; metric tile (white, 12px radius, 16px padding); dark stat tile `#095f0a`.
- **Footer:** `#032304` background, `#c5fbc6` text, hover `#8bf78d`, social icons, oversized wordmark.

**Form inputs (Proposal, since the export has no form fields)**

| Part | Spec |
|------|------|
| Height | 48px (52px on mobile for easier tapping) |
| Border | 1px `#d4dad3`, radius 4px, white background |
| Label | 14px, weight 500, `#032304`, above the field |
| Focus | 2px outline `#032304` with 2px offset |
| Error | Border `#c0392b`, message 14px `#c0392b`, optional `#fdd4d9` banner for form-level errors |
| Placeholder | `#6e746d` |
| Helper text | 12-14px `#6e746d` |

**Status colors for the queue UI (Proposal)**

| State | Visual | Label |
|-------|--------|-------|
| Active counter, completed | `#12be15` dot, `#c5fbc6` chip | "Active" |
| Paused, delayed | `#fe7e3b` dot | "Paused" |
| Inactive | `#6e746d` dot | "Inactive" |
| Error, cancelled | `#c0392b` text on `#fdd4d9` | Icon and message |
| Now serving, your turn | `#17ee1a` background, `#032304` text | Token code |

### 1.6 Motion

Keyvo's export showed motion *behavior* but no timings. Keyvo behaviors: scroll "appear" animations, a count-up stat, a snap carousel with an edge fade, looping muted videos, and hover that only swaps text color.

| Effect | Spec (Proposal) |
|--------|-----------------|
| Scroll reveal | Fade plus 24px upward slide, 500ms, ease-out, once, 80ms stagger |
| Count-up stats | 1200ms ease-out, `tabular-nums`, start when visible |
| Links | Color swap on hover, 150ms (Keyvo style: no underline or movement) |
| Buttons | Color swap only, no shadows |
| Carousel | `scroll-snap-type: x mandatory`; edge fade mask `linear-gradient(to right, #000 0%, #000 10%, #000 90%, transparent 100%)` |
| Videos | Muted, loop, autoplay, `playsinline`, with poster image |
| Queue number change | Cross-fade, 250ms |
| Skeleton loading | Shimmer, 1.4s |
| Token card hover | Card lifts 0.4em and the offset shadow grows, 0.4s; only on devices that hover; details in section 6 |
| Landing hero (BrandHero) | Staggered headline, sweeping highlight bar, floating cursors; exact timings in section 5.1 (from the supplied component) |

Wrap everything in `prefers-reduced-motion: reduce`: show final values immediately, no slides, no autoplay video, and pause Lottie.

### 1.7 Tailwind config

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        forest: { 950: '#032304', 800: '#095f0a', 600: '#0e8f10', 500: '#12be15' },
        lime: { brand: '#17ee1a', 300: '#8bf78d' },
        mint: { 200: '#c5fbc6', 100: '#cbfbcc' },
        ink: '#131413',
        slate: { text: '#4a4e49', muted: '#6e746d' },
        line: { strong: '#b8c2b6', soft: '#d4dad3', divider: '#e3e7e2' },
        surface: { DEFAULT: '#f8f9f8', 2: '#f7f8f6' },
        warn: '#fe7e3b',
        danger: '#c0392b',
        dangerSoft: '#fdd4d9',
      },
      fontFamily: {
        sans: ['"Host Grotesk"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        mono: ['"Azeret Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: { btn: '4px', card: '12px', panel: '16px' },
      maxWidth: { page: '1680px' },
    },
  },
};
```

### 1.8 Do and do not

- **Do** keep it flat: borders and tints, no shadows (the Token card is the one exception).
- **Do** put a mono uppercase eyebrow label above every section headline.
- **Do** end headlines with a period, as Keyvo does.
- **Do** keep button corners at 4px and cards at 12px.
- **Do not** use color alone for status.
- **Do not** use hover-only interactions; most farmers will be on phones.

---

## 2. App shell and layouts

| Layout | Used by | Contents |
|--------|---------|----------|
| **Public layout** | Landing, centers, center detail | Navbar (white, 1px bottom border), content, footer (`#032304`) |
| **Auth layout** | Login, register | Split screen with Lottie panel (see section 3) |
| **Farmer layout** | `/farmer`, `/profile` | Navbar with user menu, content |
| **Operator layout** | `/operator` | Navbar with user menu, content |
| **Admin layout** | `/admin/*` | Left sidebar (Dashboard, Centers, Services, Counters, Operators), top bar with user menu |

**Navbar:** logo, Centers, How it works, language toggle (EN / हिन्दी), then Outline "Login" and Primary "Register". When logged in, show the user's name and a menu (dashboard, profile, logout).

**Footer:** `#032304` background, `#c5fbc6` links with `#8bf78d` hover, copyright, brand wordmark.

---

## 3. Login and Register pages with the Lottie animation

### 3.1 The animation

| Item | Value |
|------|-------|
| Title | Afro man farmer online agriculture service application wheat fields growth |
| Creator | Yohan on LottieFiles |
| Page | https://lottiefiles.com/free-animation/afro-man-farmer-online-agriculture-service-application-wheat-fields-growth-XTM0BbZfhM |
| License shown on page | "Free to use under the Lottie Simple License" (confirm the terms on the page; crediting the creator is good practice) |
| Formats offered | dotLottie (63 KB, recommended), Optimized Lottie JSON (272.6 KB), Lottie JSON (319.1 KB), plus GIF / MP4 / WebM / SVG exports |
| Subject | A farmer monitoring wheat fields through an online agriculture app (charts, dashboard, GPS-style elements) |

I read the page text only. I have **not** downloaded the file or viewed the artwork, so check its colors against the design system before finalizing the panel background.

### 3.2 Getting the file

1. Open the page above and download **Optimized dotLottie** (smallest, 63 KB).
2. Save it as `public/animations/farmer-app.lottie`.
3. **Self-host** it instead of linking to LottieFiles, so the page works offline, loads faster, and does not depend on their CDN.
4. Also export the **PNG/GIF first frame** as `public/animations/farmer-app-poster.png` for the fallback.

### 3.3 Layout

```
Desktop (1024px and up)                       Mobile (under 640px)
┌───────────────────────┬───────────────────┐  ┌───────────────────┐
│  Animation panel      │  Form panel       │  │  Logo             │
│  (45% width)          │  (55% width)      │  │  Form             │
│                       │                   │  │  (animation       │
│  [Lottie, centered]   │  Eyebrow label    │  │   hidden or small)│
│  Headline + one line  │  Heading          │  └───────────────────┘
│  Language toggle      │  Form fields      │
│                       │  Primary button   │
│                       │  Switch link      │
└───────────────────────┴───────────────────┘
```

| Part | Spec |
|------|------|
| Animation panel | Background `#f8f9f8` (or `#c5fbc6` tint; pick whichever suits the artwork). Lottie centered, max 560px wide, with a short headline below in `#032304` and one supporting line in `#4a4e49` |
| Form panel | White. Max form width 440px, vertically centered |
| Tablet (640-1023px) | Animation shrinks to a 240px banner above the form |
| Mobile (under 640px) | Hide the animation (or show a 120px version) so the form stays above the fold |
| Logo | Top-left of the page, links to `/` |
| Language toggle | Top-right (EN / हिन्दी) |

**Login panel copy (Proposal):**
- Eyebrow: `WELCOME BACK`
- Heading: `Log in to Kisan Sarthi.`
- Panel headline: `Skip the line. Keep your day.`

**Register panel copy (Proposal):**
- Eyebrow: `NEW FARMER`
- Heading: `Create your account.`
- Panel headline: `Book your turn from the field.`

### 3.4 Form behavior

**Login:** `identifier` (email or phone), `password` with show/hide toggle, Primary "Log in" button (full width), link to Register. API: `POST /api/auth/login`. Redirect by role: farmer to `/farmer`, operator to `/operator`, admin to `/admin` (or back to the page they came from).

**Register:** `name` (min 2), `email`, `phone`, `password` (min 6), `preferredLanguage` (en / hi), `village`, `district`. At least one of email or phone is required. Phone must be 10 digits starting with 6-9. API: `POST /api/auth/register`, always creates a farmer. Redirect to `/farmer`.

**Errors:** show the server `message`. `409` means duplicate email or phone; `401` means invalid credentials; `400` means validation. Use the `#fdd4d9` banner above the form for form-level errors and red text under the field for field errors. Move focus to the first error.

### 3.5 Implementation (React)

Use the official dotLottie player. The samples below are written as JSX; with the TypeScript setup in section 5.3, rename them to `.tsx` and type the props.

```bash
npm install @lottiefiles/dotlottie-react
```

```jsx
// components/AuthAnimation.jsx
import { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function AuthAnimation() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  if (reduced) {
    return (
      <img
        src="/animations/farmer-app-poster.png"
        alt="A farmer checking crop and queue information on a phone"
        className="mx-auto w-full max-w-[560px]"
      />
    );
  }

  return (
    <DotLottieReact
      src="/animations/farmer-app.lottie"
      loop
      autoplay
      className="mx-auto w-full max-w-[560px]"
      aria-label="A farmer checking crop and queue information on a phone"
      role="img"
    />
  );
}
```

```jsx
// layouts/AuthLayout.jsx
import AuthAnimation from '../components/AuthAnimation';

export default function AuthLayout({ eyebrow, title, panelTitle, panelText, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[45fr_55fr]">
      <aside className="hidden flex-col items-center justify-center gap-6 bg-surface p-12 sm:flex">
        <AuthAnimation />
        <div className="max-w-md text-center">
          <h2 className="text-[32px] font-bold leading-[120%] text-forest-950">{panelTitle}</h2>
          <p className="mt-2 text-base leading-[150%] text-slate-text">{panelText}</p>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-[440px]">
          <p className="font-mono text-sm font-semibold uppercase tracking-[.2em] text-forest-950">{eyebrow}</p>
          <h1 className="mt-3 text-[40px] font-bold leading-[120%] text-forest-950">{title}</h1>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
```

### 3.6 Performance and accessibility

- Load the animation lazily (React `lazy` / dynamic import on the auth routes) so it does not slow the rest of the app.
- Keep the 63 KB dotLottie as the only animation file on these pages.
- On mobile, do not render the component at all when hidden; use a media query hook so it is not downloaded.
- Respect `prefers-reduced-motion` (shown above) and offer the poster image.
- Give the animation an `aria-label`; it is decorative, so the page must make sense without it.
- Add a short text alternative in the panel headline so the message is not only in the animation.

---

## 4. Pages

### 4.1 Page map

| # | Page | Route | Access | Status |
|---|------|-------|--------|--------|
| 1 | Landing | `/` | Public | Buildable now |
| 2 | Centers list | `/centers` | Public | Buildable now |
| 3 | Center detail | `/centers/:id` | Public | Buildable now |
| 4 | Register (with Lottie) | `/register` | Guests only | Buildable now |
| 5 | Login (with Lottie) | `/login` | Guests only | Buildable now |
| 6 | Profile | `/profile` | Logged in | Buildable now (read-only) |
| 7 | Farmer home | `/farmer` | Farmer | Buildable now (limited) |
| 8 | Operator home | `/operator` | Operator | Buildable now |
| 9 | Admin dashboard | `/admin` | Admin | Buildable now |
| 10 | Admin: Centers | `/admin/centers` | Admin | Buildable now |
| 11 | Admin: Services | `/admin/services` | Admin | Buildable now |
| 12 | Admin: Counters | `/admin/counters` | Admin | Buildable now |
| 13 | Admin: Operators | `/admin/operators` | Admin | Buildable now |
| 14 | Not found | `*` | Public | Buildable now |
| 15 | Forbidden | `/403` | Any | Buildable now |
| 16 | Book a token | `/book` | Farmer | **Blocked** (needs token API) |
| 17 | My tokens / live status | `/tokens`, `/tokens/:id` | Farmer | **Blocked** |
| 18 | Live queue board | `/centers/:id/queue` | Public | **Blocked** |
| 19 | Operator queue console | `/operator/queue` | Operator | **Blocked** |
| 20 | Walk-in desk | `/operator/walk-in` | Operator | **Blocked** |

### 4.2 Landing page: `/`

Follows Keyvo's repeating pattern: **eyebrow label, H1, short text, cards or media, CTA.**

| Section | Background | Content |
|---------|------------|---------|
| Navbar | White | See section 2 |
| Hero | White | The **BrandHero animation** (section 5) centered, with Primary "Find a center" and Outline "Register" buttons below it |
| Problem | `#f8f9f8` | Eyebrow `THE PROBLEM`, H1, three image cards: long waits, wasted trips, no visibility |
| Solution | White | Eyebrow `ONE PLATFORM`, H1, four features in a grid (live position, expected time, arrival advice, walk-in support) with a sample **Token card** (section 6) beside them |
| How it works | `#f8f9f8` | Eyebrow `HOW IT WORKS`, H1, three steps (Find a center, Book a token, Arrive when it is your turn), a snap carousel on mobile |
| Featured centers | White | First few results from `GET /api/centers` as cards |
| Trust | `#f8f9f8` | Verified centers, operator-managed counters, data privacy, Hindi and English |
| Final CTA | White page with `#17ee1a` panel (16px radius) | Eyebrow `GET STARTED`, headline "Ready to skip the line?", Primary and Outline buttons, optional looping muted video |
| Footer | `#032304` | See section 2 |

**Sample Token card (Solution section):** use the Token card from section 6 with demo data (status waiting, position 3, 2 people ahead, about 30 minutes), and let its numbers count up when it scrolls into view.

**API:** `GET /api/centers` for featured cards; optional `GET /api/health`.

**States:** skeleton while loading; hide the featured strip if the call fails.

### 4.3 Centers list: `/centers`

- Search box (name), district filter, result count, grid of center cards (3 columns on desktop, 2 tablet, 1 mobile).
- **Card:** white, 12px radius, 1px `#b8c2b6` border, 24px padding. Shows name (H5), type chip (`mandi` / `procurement_center`), address, district, open hours, working days.
- **API:** `GET /api/centers?district=&q=` (active centers only). Debounce search about 300ms and keep filters in the URL.
- **States:** loading skeletons, "No centers found", error with retry.

### 4.4 Center detail: `/centers/:id`

- **Header:** name, type chip, address, state/district, open and close time, working days (0-6 to day names, Sunday is `0`), map link from `latitude` / `longitude`.
- **Services:** name (use `nameHi` in Hindi mode), description, estimated duration.
- **Counters:** name, service, status pill (`active` or `paused`; paused shows "delays possible").
- **CTA:** Primary "Book a token". Logged-out users go to `/login`; farmers go to `/book`. Until booking exists, show it disabled with "Coming soon".
- **API:** `GET /api/centers/:id` and `GET /api/counters?center=:id`.
- **Errors:** `400` and `404` show a not-found view.

### 4.5 Register and Login

See section 3. They use the auth layout with the Lottie panel.

### 4.6 Profile: `/profile`

`GET /api/auth/me`. Shows name, email, phone, role, preferred language, village, district. **Read-only** because there is no update endpoint yet.

### 4.7 Farmer home: `/farmer`

- **Now:** welcome with the farmer's name, shortcut to find centers, profile summary card, and a "My tokens" card reading "Booking is coming soon".
- **Later:** the farmer's active token shown as a **Token card** (section 6) with live position and expected time, plus booking history.

### 4.8 Operator home: `/operator`

- **API:** `GET /api/counters/mine`, `PATCH /api/counters/:id/status`.
- Shows the assigned counter (name, center, service, duration, status pill).
- If `counter` is `null`: "No counter assigned yet. Contact the admin."
- **Pause / Resume** button (operators may only set `active` or `paused`, and only if the counter is not `inactive`). If inactive, hide the button and show "This counter is inactive. Please contact the admin".
- Placeholder for "Current token" and "Call next" until token endpoints exist.

### 4.9 Admin pages (shared look)

Sidebar with `#032304` background and `#c5fbc6` links (hover `#8bf78d`), content on `#f8f9f8`, tables in white cards with 1px `#b8c2b6` borders. Delete actions always use a confirm dialog.

**Dashboard `/admin`:** summary cards (centers, services, counters, operators), counters by status (active / paused / inactive), unassigned operators. API: the four admin list endpoints.

**Centers `/admin/centers`:** table (name, type, district, hours, status, actions). Form fields: `name`, `address`, `district` (required); `type` (`mandi` / `procurement_center`); `state` (default Uttar Pradesh); `latitude`, `longitude`; `openTime`, `closeTime` (`HH:mm`, defaults 09:00 and 17:00); `workingDays` (0-6, default Mon-Sat); `status`. API: `GET /api/centers/admin/all`, `POST`, `PUT /:id`, `DELETE /:id`. Delete returns `400` if services or counters remain.

**Services `/admin/services`:** filter by center. Form: `center` (required on create, not editable later), `name` (required), `nameHi`, `description`, `estimatedDuration` (integer 1-240, required on create), `isActive`. API: `GET /api/services/admin/all?center=`, `POST`, `PUT /:id`, `DELETE /:id`. Delete returns `400` if counters use the service.

**Counters `/admin/counters`:** filter by center. Create: `center`, `name`, `service` (only services of the chosen center), optional `operator`. Edit: `name`, `service`, `operator` (service cannot change while a token is being served). Status control: `active` / `paused` / `inactive`. Surface errors: `409` "Operator is already assigned to ...", `400` "Service not found for this center", `400` "Selected user is not an active operator". API: `GET /api/counters/admin/all?center=`, `GET /api/counters/operators`, `POST`, `PUT /:id`, `PATCH /:id/status`, `DELETE /:id`.

**Operators `/admin/operators`:** read-only list with assignment. Table from `GET /api/counters/operators` (name, email, phone, assigned counter or "Unassigned"). "Assign" calls `PUT /api/counters/:id` with `{ operator }`. Hide "Unassign" until the backend supports it, because an empty operator value is currently ignored. There is no endpoint to create operators.

### 4.10 Not found and Forbidden

- **404:** friendly message, links to Home and Centers.
- **403:** shown when a logged-in user opens a page their role cannot access.

### 4.11 Blocked pages (need new endpoints)

| Page | Needs |
|------|-------|
| Book a token (`/book`) | Available slots or counters and a create-token endpoint. Flow: center, service, slot, confirm. |
| My tokens (`/tokens`, `/tokens/:id`) | Farmer's tokens shown as **Token cards** (section 6), with live position, expected time, arrival advice, cancel. Live updates via polling or Socket.IO. |
| Live queue board (`/centers/:id/queue`) | Now serving and waiting counts per counter. |
| Operator queue console (`/operator/queue`) | Current token, Call next, Start, Complete, Skip, No-show, waiting list. |
| Walk-in desk (`/operator/walk-in`) | Create a token with `walkInName` and `walkInPhone` (10 digits starting 6-9). |

---

## 5. Landing hero animation (BrandHero)

Adapted from the `figma-brand-hero.tsx` component you supplied (React + Tailwind + `framer-motion`). The original is a "Figma-style" brand poster with an animated headline. This section keeps its animation and rebuilds it with Kisan Sarthi's copy and the design system.

### 5.1 What the animation does (read from the supplied code)

| Step | Element | Motion |
|------|---------|--------|
| 1 | Top pill | Drops in from 20px above, fade in, 0.8s |
| 2 | Headline lines (4 lines) | Each slides up 25px and fades in, 0.7s, staggered at 0.15s, 0.25s, 0.45s, 0.55s |
| 3 | Highlighted line | A colored bar sweeps left to right (`scaleX` 0 to 1), 1.0s, delay 0.35s |
| 4 | Four corner handles on the bar | Pop in (`scale` 0 to 1), 0.4s each, starting at 0.7s, 0.08s apart (Figma selection-box look) |
| 5 | Two "multiplayer cursors" with name tags | Fade in at 0.6s and 0.7s, then **float forever** (6s and 7s loops, gentle x/y drift) |
| 6 | Bottom badge | Rises in at 0.65s; **clicking it replays everything** by changing the root `key` |

All easing is `cubic-bezier(0.16, 1, 0.3, 1)`. These timings are exact because they come from the component code, so they also fill the motion gap noted in section 1.6.

### 5.2 Changes needed to match the design system

| Original | Change | Reason |
|----------|--------|--------|
| Shadows (`shadow-xl`, `shadow-xs`, `shadow-md`, `drop-shadow`) | Remove; use 1px borders | Keyvo style is flat, no shadows |
| Lime `#b8ff3c` / `#c8ff29` | Highlight bar and badge use `lime-brand` `#17ee1a` with `forest-950` text | Matches the brand accent |
| Page tint `#f8f9f5`, grid lines `#e5e7eb` | `surface` `#f8f9f8`, grid lines `#e3e7e2` (`divider`) | Uses existing tokens |
| Indigo and emerald cursors | Cursor 1 `forest-800` `#095f0a` with white text; cursor 2 `warn` `#fe7e3b` with `forest-950` text | Stays in palette; white text on orange is only about 2.8:1 contrast, so the tag uses dark text |
| `font-black` (900) | `font-bold` (700) | The design system loads Host Grotesk 400, 500, 700 only. If you want a heavier poster look, check which extra weights Host Grotesk offers and load one |
| Radius `rounded-3xl` | `rounded-panel` (16px) | Panel radius token |
| `dark:` variants | Removed | The design system is light-only for now |
| Pill text | Azeret Mono, uppercase, wide tracking | Matches the eyebrow label style |
| Badge is a `div` with `onClick` | A real `<button>` with an `aria-label` | Keyboard and screen-reader access |
| Badge hover scale | Color swap only | Keyvo buttons do not move |
| `⟳` glyph | lucide `RotateCw` icon | The glyph may not exist in Host Grotesk |
| Hard-coded English copy about "branding studio" | All text passed as props; defaults are Kisan Sarthi copy | Reusable and translatable |
| Always animating, infinite cursor loops, `animate-pulse` | Respect `prefers-reduced-motion` (`useReducedMotion`, `motion-safe:`) | Accessibility |
| Tight `leading-[0.9]` and `tracking-tighter` | Keep for English; for **Hindi** use looser leading (about 1.35) and normal tracking | Devanagari marks above and below the line get clipped at tight leading, and uppercase and tracking do not apply |

### 5.3 Project setup (TypeScript, Tailwind, shadcn)

The component is TypeScript (`.tsx`) and expects the shadcn folder layout, so the frontend should be set up like this. The earlier `.jsx` samples in this document become `.tsx`.

**If starting from scratch (Vite):**

```bash
npm create vite@latest kisansarthi-web -- --template react-ts
cd kisansarthi-web
npm install
npm install tailwindcss @tailwindcss/vite
npm install -D @types/node
```

1. In `src/index.css` add `@import "tailwindcss";`.
2. In `vite.config.ts` add the `@tailwindcss/vite` plugin and the alias `"@": path.resolve(__dirname, "./src")`.
3. In `tsconfig.json` and `tsconfig.app.json` add `"baseUrl": "."` and `"paths": { "@/*": ["./src/*"] }`.
4. Run `npx shadcn@latest init` and accept the defaults.
5. Install the animation and icon packages:

```bash
npm install framer-motion lucide-react
```

Shadcn's steps change between versions, so check the shadcn Vite installation guide if a step fails.

**Why `src/components/ui/` matters:** shadcn's `components.json` points its `ui` alias at this folder, so components added with `npx shadcn add ...` land there, and imports like `@/components/ui/brand-hero` only work when the `@` alias and this folder exist. Keeping hand-copied components like BrandHero in the same folder keeps everything in one predictable place.

**Tailwind version note:** new shadcn projects use Tailwind v4, where tokens go in CSS instead of `tailwind.config.js`. The config in section 1.7 is the v3 form. In v4, put the same values in `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --color-forest-950: #032304;
  --color-forest-800: #095f0a;
  --color-forest-500: #12be15;
  --color-lime-brand: #17ee1a;
  --color-mint-200: #c5fbc6;
  --color-surface: #f8f9f8;
  --color-line-strong: #b8c2b6;
  --color-line-soft: #d4dad3;
  --color-warn: #fe7e3b;
  /* ...repeat the remaining tokens from section 1.3... */
  --font-sans: "Host Grotesk", "Noto Sans Devanagari", system-ui, sans-serif;
  --font-mono: "Azeret Mono", ui-monospace, monospace;
  --radius-panel: 16px;
}
```

### 5.4 Component: `src/components/ui/brand-hero.tsx`

```tsx
"use client";

import { useState } from "react";
import { motion, useReducedMotion, type TargetAndTransition } from "framer-motion";
import { MousePointer2, RotateCw } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

type CursorTag = { name: string; action: string };

export type BrandHeroProps = {
  pill?: string;
  top?: [string, string];
  highlight?: string;
  bottom?: [string, string];
  badge?: string;
  cursors?: [CursorTag, CursorTag];
  hindi?: boolean;
};

export default function BrandHero({
  pill = "Virtual queue for mandis",
  top = ["BOOK YOUR", "TURN FROM"],
  highlight = "THE FIELD,",
  bottom = ["NOT THE", "QUEUE."],
  badge = "FIND. BOOK. ARRIVE.",
  cursors = [
    { name: "Ramesh", action: "Calling next" },
    { name: "Asha", action: "Token booked" },
  ],
  hindi = false,
}: BrandHeroProps) {
  // Changing this key remounts the card, which replays every animation
  const [replayKey, setReplayKey] = useState(0);
  const reduce = useReducedMotion();

  // Entrance animation; returns nothing when the visitor prefers reduced motion
  const enter = (from: TargetAndTransition, delay = 0, duration = 0.7) =>
    reduce
      ? {}
      : {
          initial: from,
          animate: { x: 0, y: 0, opacity: 1, scale: 1, scaleX: 1 },
          transition: { duration, delay, ease: EASE },
        };

  const line = "block";
  const headingType = hindi
    ? "leading-[1.35] tracking-normal"
    : "leading-[0.9] tracking-tighter";

  return (
    <div
      key={replayKey}
      className="relative mx-auto flex w-full max-w-4xl flex-col items-center justify-center overflow-hidden rounded-panel border border-line-strong bg-surface px-6 py-12 sm:px-12 bg-[linear-gradient(to_right,#e3e7e2_1px,transparent_1px),linear-gradient(to_bottom,#e3e7e2_1px,transparent_1px)] bg-[size:24px_24px]"
    >
      {/* Soft background glow */}
      <div className="pointer-events-none absolute h-56 w-56 rounded-full bg-lime-brand/20 blur-3xl" />

      {/* Top pill */}
      <motion.div
        {...enter({ y: -20, opacity: 0 }, 0, 0.8)}
        className="z-10 mb-4 flex items-center gap-2 rounded-full border border-line-soft bg-white px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[.2em] text-forest-950"
      >
        <span className="h-2 w-2 rounded-full bg-forest-500 motion-safe:animate-pulse" />
        {pill}
      </motion.div>

      {/* Headline stack */}
      <h1
        className={`z-10 flex select-none flex-col items-center text-center text-3xl font-bold text-forest-950 sm:text-5xl md:text-6xl ${headingType}`}
      >
        <motion.span className={line} {...enter({ y: 25, opacity: 0 }, 0.15)}>
          {top[0]}
        </motion.span>
        <motion.span className={line} {...enter({ y: 25, opacity: 0 }, 0.25)}>
          {top[1]}
        </motion.span>

        {/* Highlighted row with selection-box handles */}
        <span className="relative my-1.5 block px-3 py-1">
          <motion.span
            aria-hidden
            {...enter({ scaleX: 0 }, 0.35, 1.0)}
            className="absolute inset-0 origin-left border border-forest-950 bg-lime-brand"
          />
          {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map(
            (pos, i) => (
              <motion.span
                key={pos}
                aria-hidden
                {...enter({ scale: 0 }, 0.7 + i * 0.08, 0.4)}
                className={`absolute ${pos} z-20 h-2 w-2 border border-forest-950 bg-white`}
              />
            )
          )}
          <span className="relative z-10">{highlight}</span>
        </span>

        <motion.span className={line} {...enter({ y: 25, opacity: 0 }, 0.45)}>
          {bottom[0]}
        </motion.span>
        <motion.span className={line} {...enter({ y: 25, opacity: 0 }, 0.55)}>
          {bottom[1]}
        </motion.span>
      </h1>

      {/* Floating cursor 1 (top right): operator */}
      <motion.div
        aria-hidden
        initial={reduce ? false : { opacity: 0, scale: 0.8, x: 20 }}
        animate={
          reduce
            ? undefined
            : { opacity: 1, scale: 1, x: [0, 8, -4, 0], y: [0, -6, 3, 0] }
        }
        transition={{
          opacity: { duration: 0.8, delay: 0.6, ease: EASE },
          x: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="pointer-events-none absolute right-4 top-10 z-30 flex scale-90 items-center sm:right-8 sm:top-12 sm:scale-100"
      >
        <MousePointer2 className="h-4 w-4 -rotate-12 fill-current text-forest-800" />
        <div className="ml-1 flex items-center gap-1 whitespace-nowrap rounded-md rounded-tl-none bg-forest-800 px-2.5 py-0.5 text-[10px] font-bold text-white">
          <span>{cursors[0].name}</span>
          <span className="text-[8px] font-normal opacity-80">{cursors[0].action}</span>
        </div>
      </motion.div>

      {/* Floating cursor 2 (bottom left): farmer */}
      <motion.div
        aria-hidden
        initial={reduce ? false : { opacity: 0, scale: 0.8, x: -20 }}
        animate={
          reduce
            ? undefined
            : { opacity: 1, scale: 1, x: [0, -8, 6, 0], y: [0, 8, -4, 0] }
        }
        transition={{
          opacity: { duration: 0.8, delay: 0.7, ease: EASE },
          x: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
          y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
        }}
        className="pointer-events-none absolute bottom-10 left-4 z-30 flex scale-90 items-center sm:bottom-14 sm:left-8 sm:scale-100"
      >
        <MousePointer2 className="h-4 w-4 -rotate-12 fill-current text-warn" />
        <div className="ml-1 flex items-center gap-1 whitespace-nowrap rounded-md rounded-tl-none bg-warn px-2.5 py-0.5 text-[10px] font-bold text-forest-950">
          <span>{cursors[1].name}</span>
          <span className="text-[8px] font-normal opacity-80">{cursors[1].action}</span>
        </div>
      </motion.div>

      {/* Replay badge */}
      <motion.div {...enter({ y: 20, opacity: 0 }, 0.65)} className="z-10 mt-6">
        <button
          type="button"
          onClick={() => setReplayKey((k) => k + 1)}
          aria-label="Replay animation"
          className="flex items-center gap-2 rounded-full bg-lime-brand px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[.2em] text-forest-950 transition-colors hover:bg-mint-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-950"
        >
          {badge}
          <RotateCw className="h-3 w-3" aria-hidden />
        </button>
      </motion.div>
    </div>
  );
}
```

### 5.5 Copy

| Language | `pill` | `top` | `highlight` | `bottom` | `badge` |
|----------|--------|-------|-------------|----------|---------|
| English (default) | Virtual queue for mandis | BOOK YOUR / TURN FROM | THE FIELD, | NOT THE / QUEUE. | FIND. BOOK. ARRIVE. |
| Hindi (draft, have a native speaker review) | मंडी की वर्चुअल कतार | अपनी बारी / खेत से ही | बुक करें | कतार में / खड़े हुए बिना। | खोजें। बुक करें। पहुँचें। |

For Hindi pass `hindi` so the looser line height is used. The English headline reads "Book your turn from the field, not the queue." The two cursor tags are decorative and mirror the product: an operator "calling next" and a farmer whose "token booked".

### 5.6 Usage on the landing page

```tsx
// pages/Landing.tsx (hero section)
import BrandHero from "@/components/ui/brand-hero";

export default function HeroSection({ hindi }: { hindi: boolean }) {
  return (
    <section className="bg-white px-6 py-16 sm:px-20 sm:py-[120px]">
      <BrandHero hindi={hindi} />
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/centers" className="flex h-[52px] items-center rounded-btn bg-forest-950 px-6 text-base font-medium text-lime-300">
          Find a center
        </a>
        <a href="/register" className="flex h-[52px] items-center rounded-btn border border-line-soft bg-white px-6 text-base font-medium text-ink">
          Register
        </a>
      </div>
    </section>
  );
}
```

Pass `hindi` from whatever language state you choose (a context, a store, or `preferredLanguage` from the logged-in user).

### 5.7 Integration checklist (answers to the usual questions)

| Question | Answer |
|----------|--------|
| What props does it take? | Text only (`pill`, `top`, `highlight`, `bottom`, `badge`, `cursors`, `hindi`); defaults are the English Kisan Sarthi copy |
| State management? | One local `useState` (`replayKey`). No context providers or global state |
| Assets? | None. Cursors use lucide icons; no stock images needed |
| Responsive behavior? | Headline goes from `text-3xl` on phones to `text-6xl` on desktop; max width `4xl`; cursor tags shrink to 90% on small screens |
| Where should it go? | The landing page hero only. It replays on every visit, so avoid it on logged-in pages |
| Extra dependencies? | `framer-motion` and `lucide-react` |

### 5.8 Accessibility and performance

- The headline is one `<h1>`, so screen readers read it as a single sentence; the decorative bar, handles, and cursors are `aria-hidden`.
- With `prefers-reduced-motion`, nothing animates: no entrance, no floating cursors, no pulsing dot. The replay button still works and simply remounts a static card.
- The replay badge is a real button with a visible focus outline.
- `framer-motion` adds to the bundle. It is only used on the landing page, so load that page lazily (`React.lazy`) if bundle size matters.
- White text on `#095f0a` and dark text on `#fe7e3b` and `#17ee1a` are the pairings used; do not swap them.

---

## 6. Token card (how a farmer sees their token)

Built from the "Card" by seoulchik on Uiverse.io that you supplied: a thick-bordered, ticket-style card with a hard offset shadow. It is recolored to the Kisan Sarthi theme and turned into a token ticket. Keep the attribution comment in the CSS file and check Uiverse's license terms for your use.

### 6.1 Where it is used

| Page | Use |
|------|-----|
| `/farmer` (farmer home) | The farmer's active token, shown large at the top |
| `/tokens` | One card per token (today's and past), in a grid |
| `/tokens/:id` | A single card scaled up (see 6.6) |
| Landing page, Solution section | A **sample** card with demo data in place of a mockup |

**Data needed:** the card is purely presentational, so you can build it now with mock data. Real data needs the token endpoints that are not mounted yet (blocked). The fields come from the queue logic: `tokenCode`, `status`, `position`, `aheadCount`, `estimatedWaitMinutes`, `nowServing`, `delayed`, plus the center, service, and counter names.

### 6.2 Mapping the original card to a token

| Original part | Becomes |
|---------------|---------|
| Title bar ("Creative Studio") | Center name |
| "Premium" tag | Status tag ("Waiting", "Your turn", "Done", and so on) |
| Description paragraph | Service and counter line ("Crop Registration · Counter 2") |
| Four feature icons | Four stats: **Position**, **Ahead**, **Est. wait**, **Now serving** |
| Price ("$899 per project") | **Token code** in the same big style, with "your token" as the small line |
| "Get Started" button | **Cancel** (when waiting) or **Details**; shown only if a handler is passed |
| "Approved" stamp | Faint status stamp (WAITING, SERVING, DONE, CANCELLED, SKIPPED, MISSED) |
| Dashed line with scissors | Ticket tear line above the actions (kept) |
| Star and corner triangle | Kept; the triangle color shows the status |
| Dot grid, dashed square, diamond | Kept as decoration, recolored to forest green |
| New | An **arrival strip** with the arrival advice ("You can reach the center in about 25 minutes.") |

### 6.3 Recolor

| Original | New | Notes |
|----------|-----|-------|
| `--primary` `#ff3e00` (title bar) | `#032304` forest-950 | Title text stays white |
| `--text` `#050505` (borders, text) | `#032304` forest-950 | Borders, text, and shadow all forest |
| `--shadow-color` `#000` | `#032304` forest-950 | Solid offset shadow |
| `--secondary` `#4d61ff` (icons, diamond) | `#095f0a` forest-800 | Hover `#0e8f10` |
| `--accent` `#00e0b0` (triangle, price underline) | **By status**, see below | Default mint `#c5fbc6` |
| Button blue with white text | `#032304` background, `#8bf78d` text (Keyvo primary button) | Hover background `#095f0a` |
| `--pattern-color` `#cfcfcf` | `#d4dad3` (`line-soft`) | Dot overlay |
| Black SVG fills and strokes | Forest via `currentColor` | |
| Stripe overlay on the title bar (black at 10%) | Mint at 8% | Black stripes would vanish on a dark bar |

**Status colors (accent triangle, price underline, tag background)**

| State | Accent / tag | Stamp |
|-------|--------------|-------|
| Waiting | `#c5fbc6` mint, white tag | WAITING |
| Your turn (serving) | `#17ee1a` lime-brand, lime tag | SERVING |
| Waiting but counter paused (`delayed`) | `#fe7e3b` orange | DELAYED |
| Completed | `#12be15` green | DONE |
| Cancelled, skipped, no-show | `#fdd4d9` pink | CANCELLED, SKIPPED, MISSED |

Tag and stamp text is always forest `#032304`, which has strong contrast on every one of these backgrounds. Status is also written in words, never color alone.

### 6.4 Design-system exception

The design system is flat with no shadows (sections 1.4 and 1.8). The Token card keeps the original's **solid offset shadow** and thick border on purpose, as the app's signature "ticket" look. It is not a soft blur shadow, and it stays limited to this one component so the rest of the app remains flat. If you would rather keep everything flat, delete the `box-shadow` lines and the hover translate in the CSS.

### 6.5 Changes from the original beyond color

| Change | Reason |
|--------|--------|
| `.card` renamed to `.token-card`, children prefixed `token-card__` | The original names are generic and could collide with other styles |
| Hover effects wrapped in `@media (hover: hover) and (pointer: fine)` | Avoids stuck hover states on phones, where most farmers will use it |
| `prefers-reduced-motion` turns off all transitions and transforms | Accessibility |
| Width `min(20em, 100%)` | Never overflows a 320px screen |
| Title text truncates with an ellipsis; extra right padding on the title | Long center names, and keeps the status tag clear of the star |
| Font set to Host Grotesk with a Devanagari fallback | Design system |
| `:lang(hi)` removes uppercase and letter spacing | Letter spacing breaks Devanagari conjuncts |
| Everything is sized in `em` | Set `font-size` on the card to scale the whole ticket |
| Inset box-shadow removed | Not needed |
| Icons are lucide-react, not the original SVGs | The originals were studio-service icons |
| Stat updates announced with `aria-live="polite"` | Screen readers hear position changes |

### 6.6 Component: `src/components/ui/token-card.tsx`

```tsx
import { ListOrdered, Users, Clock, Megaphone } from "lucide-react";
import "./token-card.css";

export type TokenStatus =
  | "waiting" | "serving" | "completed" | "cancelled" | "skipped" | "no_show";

const DEFAULT_LABELS = {
  token: "Token",
  yourToken: "your token",
  position: "Position",
  ahead: "Ahead",
  wait: "Est. wait",
  nowServing: "Now serving",
  now: "Now",
  min: "min",
  people: "people",
  cancel: "Cancel",
  details: "Details",
  status: {
    waiting: "Waiting",
    serving: "Your turn",
    delayed: "Delayed",
    completed: "Done",
    cancelled: "Cancelled",
    skipped: "Skipped",
    no_show: "Missed",
  },
  stamp: {
    waiting: "Waiting",
    serving: "Serving",
    delayed: "Delayed",
    completed: "Done",
    cancelled: "Cancelled",
    skipped: "Skipped",
    no_show: "Missed",
  },
};

export type TokenCardLabels = typeof DEFAULT_LABELS;

export type TokenCardProps = {
  tokenCode: string;
  status: TokenStatus;
  delayed?: boolean;               // counter is paused or inactive
  centerName: string;
  serviceName: string;             // use nameHi when the language is Hindi
  counterName: string;
  position: number | null;         // 0 when serving, null when not queued
  aheadCount: number;
  estimatedWaitMinutes: number;
  nowServing: string | null;       // token code now being served
  arrivalMessage?: string;         // e.g. from suggestArrival()
  lang?: "en" | "hi";
  labels?: Partial<TokenCardLabels>;
  onCancel?: () => void;
  onDetails?: () => void;
};

const DOTS = [
  [10, 10], [30, 10], [50, 10], [70, 10],
  [20, 20], [40, 20], [60, 20],
  [10, 30], [30, 30], [50, 30], [70, 30],
];

export default function TokenCard({
  tokenCode,
  status,
  delayed = false,
  centerName,
  serviceName,
  counterName,
  position,
  aheadCount,
  estimatedWaitMinutes,
  nowServing,
  arrivalMessage,
  lang = "en",
  labels,
  onCancel,
  onDetails,
}: TokenCardProps) {
  const l: TokenCardLabels = { ...DEFAULT_LABELS, ...labels };
  const active = status === "waiting" || status === "serving";
  const visual = delayed && status === "waiting" ? "delayed" : status;

  const positionText = !active ? "-" : status === "serving" ? l.now : `#${position ?? "-"}`;
  const aheadText = active ? `${aheadCount} ${l.people}` : "-";
  const waitText = !active ? "-" : status === "serving" ? l.now : `~${estimatedWaitMinutes} ${l.min}`;

  const stats = [
    { Icon: ListOrdered, label: l.position, value: positionText },
    { Icon: Users, label: l.ahead, value: aheadText },
    { Icon: Clock, label: l.wait, value: waitText },
    { Icon: Megaphone, label: l.nowServing, value: nowServing ?? "-" },
  ];

  return (
    <article
      className="token-card"
      data-status={visual}
      lang={lang}
      aria-label={`${l.token} ${tokenCode}, ${l.status[visual]}`}
    >
      <div className="token-card__grid" aria-hidden="true" />
      <div className="token-card__dots" aria-hidden="true" />

      <svg className="token-card__bold-pattern" viewBox="0 0 100 100" aria-hidden="true">
        <path
          strokeDasharray="15 10"
          strokeWidth="10"
          stroke="currentColor"
          fill="none"
          d="M0,0 L100,0 L100,100 L0,100 Z"
        />
      </svg>

      <header className="token-card__title">
        <span className="token-card__title-text">{centerName}</span>
        <span className="token-card__tag">{l.status[visual]}</span>
      </header>

      <div className="token-card__body">
        <p className="token-card__desc">
          {serviceName} · {counterName}
        </p>

        <div className="token-card__stats" aria-live="polite">
          {stats.map(({ Icon, label, value }) => (
            <div className="token-card__stat" key={label}>
              <div className="token-card__stat-icon" aria-hidden="true">
                <Icon size={14} strokeWidth={2.5} />
              </div>
              <span className="token-card__stat-text">
                <span className="token-card__stat-label">{label}</span>
                <strong className="token-card__stat-value">{value}</strong>
              </span>
            </div>
          ))}
        </div>

        {arrivalMessage && active && <p className="token-card__arrival">{arrivalMessage}</p>}

        <div className="token-card__actions">
          <div className="token-card__code">
            <span className="token-card__code-prefix">#</span>
            {tokenCode}
            <span className="token-card__code-label">{l.yourToken}</span>
          </div>

          {status === "waiting" && onCancel ? (
            <button type="button" className="token-card__button" onClick={onCancel}>
              {l.cancel}
            </button>
          ) : onDetails ? (
            <button type="button" className="token-card__button" onClick={onDetails}>
              {l.details}
            </button>
          ) : null}
        </div>
      </div>

      <svg className="token-card__dots-pattern" viewBox="0 0 80 40" aria-hidden="true">
        {DOTS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} fill="currentColor" r="3" cx={cx} cy={cy} />
        ))}
      </svg>

      <div className="token-card__accent-shape" aria-hidden="true" />
      <div className="token-card__corner" aria-hidden="true" />
      <div className="token-card__stamp" aria-hidden="true">
        <span className="token-card__stamp-text">{l.stamp[visual]}</span>
      </div>
    </article>
  );
}
```

### 6.7 Styles: `src/components/ui/token-card.css`

```css
/* Adapted from "Card" by seoulchik (Uiverse.io), recolored for Kisan Sarthi. */

.token-card {
  /* Theme colors (see section 1.3) */
  --primary: #032304;            /* forest-950 */
  --secondary: #095f0a;          /* forest-800 */
  --secondary-hover: #0e8f10;    /* green-600 */
  --accent: #c5fbc6;             /* mint-200, overridden per status */
  --tag-bg: #ffffff;
  --text: #032304;
  --muted: #4a4e49;              /* slate-text */
  --bg: #ffffff;
  --shadow-color: #032304;
  --pattern-color: #d4dad3;      /* line-soft */
  --button-bg: #032304;
  --button-bg-hover: #095f0a;
  --button-text: #8bf78d;        /* lime-300 */

  position: relative;
  width: min(20em, 100%);
  font-size: 16px;               /* set a larger value to scale the whole card */
  font-family: "Host Grotesk", "Noto Sans Devanagari", system-ui, sans-serif;
  color: var(--text);
  background: var(--bg);
  border: 0.35em solid var(--text);
  border-radius: 0.6em;
  box-shadow: 0.7em 0.7em 0 var(--shadow-color);
  overflow: hidden;
  transition:
    transform 0.4s cubic-bezier(0.23, 1, 0.32, 1),
    box-shadow 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

/* Status colors */
.token-card[data-status="waiting"]   { --accent: #c5fbc6; }
.token-card[data-status="serving"]   { --accent: #17ee1a; --tag-bg: #17ee1a; }
.token-card[data-status="delayed"]   { --accent: #fe7e3b; --tag-bg: #fe7e3b; }
.token-card[data-status="completed"] { --accent: #12be15; --tag-bg: #c5fbc6; }
.token-card[data-status="cancelled"],
.token-card[data-status="skipped"],
.token-card[data-status="no_show"]   { --accent: #fdd4d9; --tag-bg: #fdd4d9; }

.token-card:active {
  transform: translate(0.1em, 0.1em);
  box-shadow: 0.5em 0.5em 0 var(--shadow-color);
}

/* Corner triangle and star */
.token-card::before {
  content: "";
  position: absolute;
  top: -1em;
  right: -1em;
  width: 4em;
  height: 4em;
  background: var(--accent);
  transform: rotate(45deg);
  z-index: 1;
}

.token-card::after {
  content: "★";
  position: absolute;
  top: 0.4em;
  right: 0.4em;
  color: var(--text);
  font-size: 1.2em;
  font-weight: 700;
  z-index: 2;
}

/* Background patterns */
.token-card__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(3, 35, 4, 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(3, 35, 4, 0.06) 1px, transparent 1px);
  background-size: 0.5em 0.5em;
  opacity: 0.5;
  pointer-events: none;
  transition: opacity 0.4s ease;
  z-index: 1;
}

.token-card__dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--pattern-color) 1px, transparent 1px);
  background-size: 1em 1em;
  background-position: -0.5em -0.5em;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
  z-index: 1;
}

.token-card__bold-pattern {
  position: absolute;
  top: 0;
  right: 0;
  width: 6em;
  height: 6em;
  color: var(--text);
  opacity: 0.15;
  pointer-events: none;
  z-index: 1;
}

/* Title bar */
.token-card__title {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6em;
  padding: 1.4em 2.4em 1.4em 1.4em;   /* extra right padding keeps the tag clear of the star */
  background: var(--primary);
  color: var(--bg);
  font-size: 1.2em;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-bottom: 0.35em solid var(--text);
  overflow: hidden;
  z-index: 2;
}

.token-card__title::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(197, 251, 198, 0.08),
    rgba(197, 251, 198, 0.08) 0.5em,
    transparent 0.5em,
    transparent 1em
  );
  pointer-events: none;
}

.token-card__title-text {
  position: relative;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.token-card__tag {
  position: relative;
  flex: none;
  background: var(--tag-bg);
  color: var(--tag-text, #032304);
  font-size: 0.6em;
  font-weight: 700;
  padding: 0.4em 0.8em;
  border: 0.15em solid var(--text);
  border-radius: 0.3em;
  box-shadow: 0.2em 0.2em 0 var(--shadow-color);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transform: rotate(3deg);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Body */
.token-card__body {
  position: relative;
  padding: 1.5em;
  z-index: 2;
}

.token-card__desc {
  margin: 0 0 1.2em;
  font-size: 0.95em;
  font-weight: 500;
  line-height: 1.4;
}

.token-card__stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1em;
  margin-bottom: 1.2em;
}

.token-card__stat {
  display: flex;
  align-items: center;
  gap: 0.6em;
  min-width: 0;
  transition: transform 0.2s ease;
}

.token-card__stat-icon {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.9em;
  height: 1.9em;
  background: var(--secondary);
  color: var(--bg);
  border: 0.12em solid var(--text);
  border-radius: 0.3em;
  box-shadow: 0.2em 0.2em 0 rgba(3, 35, 4, 0.2);
  transition: background 0.2s ease, transform 0.2s ease;
}

.token-card__stat-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.token-card__stat-label {
  font-family: "Azeret Mono", ui-monospace, monospace;
  font-size: 0.6em;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.token-card__stat-value {
  font-size: 0.95em;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Arrival advice */
.token-card__arrival {
  margin: 0 0 1.2em;
  padding: 0.6em 0.8em;
  background: #c5fbc6;               /* mint-200 */
  border: 0.12em solid var(--text);
  border-radius: 0.3em;
  font-size: 0.85em;
  font-weight: 600;
  line-height: 1.4;
}

/* Actions: ticket tear line, token code, button */
.token-card__actions {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8em;
  margin-top: 1.5em;
  padding-top: 1.2em;
  border-top: 0.15em dashed rgba(3, 35, 4, 0.2);
}

.token-card__actions::before {
  content: "✂";
  position: absolute;
  top: -0.8em;
  left: 50%;
  transform: translateX(-50%) rotate(90deg);
  background: var(--bg);
  padding: 0 0.5em;
  color: rgba(3, 35, 4, 0.4);
}

.token-card__code {
  position: relative;
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 1.8em;
  font-weight: 700;
  line-height: 1.1;
  background: var(--bg);
}

.token-card__code::before {
  content: "";
  position: absolute;
  bottom: 0.15em;
  left: 0;
  width: 100%;
  height: 0.2em;
  background: var(--accent);
  z-index: -1;
}

.token-card__code-prefix {
  font-size: 0.6em;
  font-weight: 700;
  vertical-align: top;
  margin-right: 0.1em;
}

.token-card__code-label {
  display: block;
  margin-top: 0.2em;
  font-size: 0.4em;
  font-weight: 600;
  color: var(--muted);
}

.token-card__button {
  position: relative;
  flex: none;
  min-height: 2.75em;                /* comfortable touch target */
  padding: 0.7em 1.2em;
  background: var(--button-bg);
  color: var(--button-text);
  font: inherit;
  font-size: 0.9em;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: 0.2em solid var(--text);
  border-radius: 0.4em;
  box-shadow: 0.3em 0.3em 0 var(--shadow-color);
  cursor: pointer;
  overflow: hidden;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.token-card__button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  transition: left 0.6s ease;
}

.token-card__button:active {
  transform: translate(0.1em, 0.1em);
  box-shadow: 0.15em 0.15em 0 var(--shadow-color);
}

.token-card__button:focus-visible {
  outline: 0.15em solid var(--text);
  outline-offset: 0.2em;
}

/* Decoration */
.token-card__dots-pattern {
  position: absolute;
  bottom: 2em;
  left: -2em;
  width: 8em;
  height: 4em;
  color: var(--text);
  opacity: 0.3;
  transform: rotate(-10deg);
  pointer-events: none;
  z-index: 1;
}

.token-card__accent-shape {
  position: absolute;
  bottom: -1.2em;
  right: 2em;
  width: 2.5em;
  height: 2.5em;
  background: var(--secondary);
  border: 0.15em solid var(--text);
  border-radius: 0.3em;
  transform: rotate(45deg);
  transition: transform 0.3s ease;
  z-index: 0;
}

.token-card__corner {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 1.5em;
  height: 1.5em;
  background: var(--bg);
  border-top: 0.25em solid var(--text);
  border-right: 0.25em solid var(--text);
  border-radius: 0 0.5em 0 0;
  z-index: 1;
}

.token-card__stamp {
  position: absolute;
  bottom: 1.5em;
  left: 1.5em;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4em;
  height: 4em;
  border: 0.15em solid rgba(3, 35, 4, 0.3);
  border-radius: 50%;
  transform: rotate(-15deg);
  opacity: 0.2;
  z-index: 1;
}

.token-card__stamp-text {
  font-size: 0.5em;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
}

/* Hover effects only on devices that really hover */
@media (hover: hover) and (pointer: fine) {
  .token-card:hover {
    transform: translate(-0.4em, -0.4em) scale(1.02);
    box-shadow: 1em 1em 0 var(--shadow-color);
  }
  .token-card:hover .token-card__grid,
  .token-card:hover .token-card__dots { opacity: 1; }
  .token-card:hover .token-card__tag {
    transform: rotate(-2deg) scale(1.1);
    box-shadow: 0.25em 0.25em 0 var(--shadow-color);
  }
  .token-card:hover .token-card__accent-shape { transform: rotate(55deg) scale(1.1); }
  .token-card__stat:hover { transform: translateX(0.3em); }
  .token-card__stat:hover .token-card__stat-icon {
    background: var(--secondary-hover);
    transform: rotate(-5deg);
  }
  .token-card__button:hover {
    background: var(--button-bg-hover);
    transform: translate(-0.1em, -0.1em);
    box-shadow: 0.4em 0.4em 0 var(--shadow-color);
  }
  .token-card__button:hover::before { left: 100%; }
}

/* Hindi: no uppercase, no letter spacing (breaks Devanagari conjuncts) */
.token-card:lang(hi),
.token-card:lang(hi) * {
  letter-spacing: normal !important;
  text-transform: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .token-card,
  .token-card * {
    transition: none !important;
    animation: none !important;
  }
  .token-card:hover,
  .token-card:active { transform: none; }
}
```

### 6.8 Usage

```tsx
import TokenCard from "@/components/ui/token-card";

// Demo / landing page sample
<div className="p-6 sm:p-10">      {/* leave room for the card's offset shadow */}
  <TokenCard
    tokenCode="A-042"
    status="waiting"
    centerName="Dasna Krishi Mandi"
    serviceName="Crop Registration"
    counterName="Counter 1"
    position={3}
    aheadCount={2}
    estimatedWaitMinutes={30}
    nowServing="A-040"
    arrivalMessage="You can reach the center in about 15 minutes."
    onCancel={() => {}}
  />
</div>

// Cards in the /tokens list
<div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
  {tokens.map((t) => <TokenCard key={t.id} {...t} />)}
</div>

// Larger single card on /tokens/:id
<div style={{ fontSize: 20 }}> {/* the card is em-based, so it scales */}
  <TokenCard {...token} />
</div>
```

`arrivalMessage` can come from the server's arrival advice, or be built on the client with the same rule: if the wait is 15 minutes or less, say to come now; otherwise "You can reach the center in about (wait minus 15) minutes."

### 6.9 Draft Hindi labels (have a native speaker review)

Pass these through `labels` when the language is Hindi, and set `lang="hi"`.

| Key | Hindi |
|-----|-------|
| token | टोकन |
| yourToken | आपका टोकन |
| position | क्रम |
| ahead | आगे |
| wait | अनुमानित समय |
| nowServing | अभी चल रहा है |
| now | अभी |
| min | मिनट |
| people | लोग |
| cancel | रद्द करें |
| details | विवरण |
| status: waiting / serving / delayed / completed / cancelled / skipped / no_show | प्रतीक्षा में / आपकी बारी / देरी / पूरा हुआ / रद्द / छोड़ा गया / अनुपस्थित |

Use the service's `nameHi` for `serviceName` in Hindi mode.

### 6.10 States to design

| State | Behavior |
|-------|----------|
| Waiting | Mint triangle, live position and wait |
| Your turn | Lime triangle and tag, wait shows "Now" |
| Delayed | Orange triangle and tag when the counter is paused |
| Done, cancelled, skipped, missed | Stats show "-", no arrival strip, no Cancel button |
| Loading | A skeleton in the same size (shimmer, 1.4s) |
| Position change | Optional 250ms cross-fade on the stat value |

### 6.11 Accessibility

- Status is written in the tag, never color alone; all tag and stamp text is forest on light or lime backgrounds with strong contrast.
- Decorative pieces (patterns, stamp, star, shapes) are `aria-hidden`.
- Stats are in a polite live region, so a screen reader announces position changes without interrupting.
- Buttons are real `<button>` elements with a visible focus outline and a touch target of at least 44px.
- Hover movement is limited to devices that hover, and all motion stops under reduced-motion settings.

---

## 7. Route guards

| Rule | Behavior |
|------|----------|
| No token on a protected page | Redirect to `/login`, remember the target |
| API returns `401` | Clear the token, redirect to `/login` |
| Role not allowed (or API `403`) | Show `/403` |
| Logged-in user opens `/login` or `/register` | Redirect to their role's home |

On app start, if a token exists, call `GET /api/auth/me` to restore the session.

---

## 8. Shared components and conventions

- **Components:** Navbar, Footer, CenterCard, ServiceCard, CounterStatusPill, DataTable (loading, empty, error states), FormModal or Drawer, ConfirmDialog, Toast (shows the server `message`), ProtectedRoute (with a `roles` prop), WorkingDays, TimeRange, Eyebrow, Chip, TokenCard (`ui/token-card.tsx`), AuthAnimation, BrandHero (`ui/brand-hero.tsx`).
- **API client:** one wrapper that adds the bearer token, parses `{ success, message }`, and handles `401` globally. Base URL from an env variable (local: `http://localhost:5000/api`).
- **Language:** English and Hindi. Services have `nameHi`; users have `preferredLanguage`. Persist the guest choice locally.
- **IDs:** MongoDB ObjectIds are 24-character strings. Documents use `_id`; auth and operator responses use `id`.
- **Counter shapes differ:** the public list returns `center` as an ID and `service` populated; admin and `mine` return populated objects. Normalize in the client.
- **Mobile first:** touch targets of at least 44px, simple forms, light pages.

---

## 9. Suggested file structure

```
src/
  api/            client.ts, auth.ts, centers.ts, services.ts, counters.ts
  components/
    ui/           brand-hero.tsx, token-card.tsx, token-card.css, plus shadcn components
    ...           Navbar, Footer, Eyebrow, Chip, CenterCard, CounterStatusPill, AuthAnimation
  layouts/        PublicLayout, AuthLayout, FarmerLayout, OperatorLayout, AdminLayout
  pages/          Landing, Centers, CenterDetail, Login, Register, Profile, farmer/, operator/, admin/
  routes/         ProtectedRoute, router
  index.css       Tailwind import and design tokens
components.json   shadcn config (aliases point to src/components/ui)
public/
  animations/     farmer-app.lottie, farmer-app-poster.png
```

---

## 10. Build order

1. TypeScript, Tailwind, shadcn and `framer-motion` setup (section 5.3), fonts, app shell, API client, auth context, route guards
2. Auth layout, Login and Register with the Lottie animation
3. Landing page with the BrandHero animation and a sample Token card, Centers list, Center detail
4. Admin: Centers, Services, Counters, Operators, Dashboard
5. Operator home (view counter, pause / resume)
6. Farmer home (Token card with mock data until the API exists) and Profile
7. Token booking, live status, operator console (after the backend adds those endpoints)
