# MASTER-PORT — Project Memory

> Living handoff/reference for the current repository. Read this before changing the portfolio UI, interactions, or visual system. It records what is implemented in source now; it is not a product roadmap.

## 1. Project at a glance

- **Product:** single-page personal portfolio for Anand Kene (also called Jacky in the site description).
- **Positioning:** “Creative Developer”; full-stack web applications and AI agents, presented as cinematic digital experiences.
- **Visual concept:** dark, editorial, Japanese-inspired portfolio with samurai/temple/autumn artwork, English/Japanese labels, large typography, glass surfaces, film grain, scroll choreography, and small red/amber highlights.
- **Runtime:** React 19 + TypeScript + Vite. Tailwind CSS v4 is integrated through the Vite plugin; much of the visual system uses Tailwind utility classes plus custom CSS.
- **Navigation model:** one long scrolling page; no router, backend, CMS, or contact form is present.
- **Current README caveat:** [README.md](./README.md) is still the generic Vite starter guide. This file is the project-specific implementation reference.

## 2. Run and build

From the repository root:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

- `dev`: Vite development server.
- `build`: `tsc -b` followed by a Vite production build.
- `lint`: ESLint over the repository.
- `preview`: serves the production build locally.
- No test script or test suite is configured in `package.json`.
- Vite is configured with the React and Tailwind CSS plugins in [vite.config.ts](./vite.config.ts).
- TypeScript app sources are under `src`; app compiler settings are in [tsconfig.app.json](./tsconfig.app.json).

## 3. App composition and page order

The page entry is [src/main.tsx](./src/main.tsx). It mounts React Strict Mode and the global, non-section UI in this order:

1. `SmoothScroll`
2. `ScrollProgress`
3. `Navigation`
4. `CustomCursor`
5. `App`

[src/App.tsx](./src/App.tsx) renders the main page in this order:

1. **Preloader** (temporary overlay)
2. **Hero** — section id `hero`, chapter `00`
3. **Story** — id `story`, chapter `01`
4. **World** — id `world`, a long autumn interlude
5. **Projects / Selected Work** — id `work`, chapter `02`
6. **About / Journey** — id `about`, chapter `03`
7. **Skills** — id `skills`, chapter `04`
8. **Contact** — id `contact`, chapter `05`

There is no route change between these sections. Navigation and section links scroll to element IDs.

### Loading sequence

- `App` initially renders `Preloader`. The Hero is already mounted behind it.
- The preloader reports `ready` when its progress animation finishes and the hero image has loaded (or the 4-second safety timer expires). Hero intro animation starts at this point.
- `loaded` becomes true only after the preloader’s two panels finish opening. Then the preloader unmounts and the `World` chunk is lazy-loaded.
- While that chunk is loading, a fixed-height `WorldSpace` placeholder (`260svh`, id `world`) preserves the layout. Suspense uses the same placeholder as its fallback.
- `document.fonts.ready` triggers `ScrollTrigger.refresh()` because web fonts can change section geometry.
- The preloader percentage is an animated presentation, not a byte-accurate total asset-loading indicator.

## 4. UI/UX, section by section

### Preloader

Implemented in [src/components/common/Preloader.tsx](./src/components/common/Preloader.tsx).

- Full-screen dark loading state (`role="status"`, label “Loading”); top/bottom panels slide away to reveal the portfolio.
- Header labels: `01 / LOADING` and `TOKYO / JST`.
- Center: zero-padded 000–100 counter, thin red progress bar, animated `ANAND KENE` letterforms.
- Footer log cycles through initializing, loading scene, connecting WebGL, and rendering messages according to the displayed percentage.
- Locks document scrolling and stops Lenis during loading; restores both during completion/cleanup.
- Waits for the hero background image but exits after a 4-second safety timeout if it does not load.
- Honors reduced motion by shortening the intro/exit animation.

### Hero / introduction

Implemented in [src/components/sections/Hero.tsx](./src/components/sections/Hero.tsx), using the custom [GlassHeadlineHero](./src/components/ui/glass-headline-hero.tsx) renderer.

- Full viewport (at least `600px` tall); giant `ANAND KENE` headline over the hero artwork.
- Headline is a real semantic `<h1>`. WebGL2, when available, renders the refractive/beveled glass effect over the exact browser text mask. The image is refracted behind the letters; mouse position moves the virtual light and the page scroll zooms the image.
- Hero image is a grayscale samurai facing a dragon; a transparent samurai cutout is layered above it.
- Foreground labels: red `LIVE` marker, `CHAPTER 00 — PROLOGUE` on desktop, live Tokyo/JST clock, vertical Japanese text and `SCROLL` cue, role/tagline, location and focus.
- Overlay fades as the reader scrolls away; the glass image zooms and a dark veil transitions toward the next scene.
- Hero copy entrance and the red scroll cue animate after the preloader begins to open.
- If WebGL2 is unavailable or shader setup fails, CSS still displays the image and normal white headline; the canvas/glass treatment is progressive enhancement.

### Story

Implemented in [src/components/sections/Story.tsx](./src/components/sections/Story.tsx) and shared [Scene](./src/components/scenes/Scene.tsx).

- Section label `01 — THE STORY` / `物語`; light paper-toned treatment over a red samurai illustration.
- Large four-line manifesto: “I DON'T JUST / BUILD WEBSITES. / I BUILD / EXPERIENCES.”
- At the bottom/right, a light glass-paper card identifies Anand and location and reveals the profile summary word by word as the reader scrolls.
- Heading lines wipe in with an ink-like clip path; reduced-motion mode disables these GSAP effects.

### World / autumn interlude

Implemented in [src/components/sections/World.tsx](./src/components/sections/World.tsx); 3D leaves are drawn with Three.js / React Three Fiber.

- A `260svh` section with a sticky full-viewport autumn landscape, dark color grade, vignette and two large sequential statements:
  - “Code is only the first layer.”
  - “The rest is experience.”
- Scroll progress changes background zoom, reveals each statement in turn and increases wind when scrolling quickly.
- Mouse movement steers the camera and can push the leaves; on-screen labels explain “MOVE THE MOUSE — GUSTS FOLLOW” and “SCROLL — THE WIND RISES”.
- The scene builds maple-like red/orange/amber leaf textures at runtime and draws leaves as instanced planes. Normal devices use up to 150 sharp leaves; low-power/small-screen devices use up to 70, plus fewer blurred foreground leaves.
- The canvas is rendered only near the viewport. WebGL support, reduced-motion preference, hardware concurrency, memory hint, viewport width, and visibility affect whether/how much 3D runs.
- The Three.js canvas is wrapped in `ErrorBoundary`; on a scene failure, text/background remain and the 3D layer falls back to empty.
- Reduced-motion preference or unavailable WebGL removes the 3D leaf layer. The static background and section copy remain.

### Selected Work / projects

Implemented in [src/components/sections/Projects.tsx](./src/components/sections/Projects.tsx); content comes from [src/data/projects.ts](./src/data/projects.ts).

- Section label `02 — SELECTED WORK` / `作品`, over a moonlit Japanese temple landscape.
- Editorial heading: “THINGS I / HAVE BUILT.”
- Three large glass rows; each row is an external GitHub link with project number, title, category, description, optional status/highlights, technologies, and a hover arrow/title treatment.
- Current entries:
  1. **AURA** — AI Agent / Full-Stack; in active development. Local-LLM personal AI life/development agent using Ollama; listed features are streaming AI chat and generated chat titles, with Developer and Research agents in progress. Stack: React, TypeScript, Vite, Tailwind, FastAPI, Python, SQLite/SQLModel, Ollama.
  2. **Faculty Management System** — Web Application; faculty-information management software project; React and Vite.
  3. **AK-BROWSER** — Browser / Experimental; personal browser with premium sci-fi design; no technologies listed.
- **Important current data limitation:** all `githubUrl` fields point to Anand’s GitHub profile, not to individual repository URLs. The data file explicitly says to replace them with exact repo URLs later.
- Project thumbnails are data fields but are not rendered by the current project-list component.

### About / Journey

Implemented in [src/components/sections/About.tsx](./src/components/sections/About.tsx).

- Long section with a sticky illustrated background, warm sunset overlay that transitions into night, vignette, mouse-following warm desktop glow, and animated fireflies.
- Header `03 — ABOUT / JOURNEY` / `旅`; headline “CURIOSITY FIRST. / THEN CODE. / NOW AGENTS.”
- Four illustrated timeline cards are laid out on alternating sides of a responsive SVG lantern path:
  1. **Education:** BCA, NEP pattern; Smt. Maherbanu College of Science and Commerce; Gadge Baba Amravati University; 2nd year; expected 2028; CGPA 8.50+.
  2. **Rising India:** Rising India Hackathon 1.0, hosted at Nagpur Institute of Technology, Nagpur.
  3. **YCCE Nagpur:** Hackathon at Yeshwantrao Chavan College of Engineering (YCCE), Nagpur.
  4. **AURA:** “Now building”; description/status/first five technology chips are sourced from the AURA project record.
- The responsive SVG path is calculated from actual lantern positions. A glowing orb follows the path according to the reader’s viewport position; lanterns light up and the corresponding card receives an active glow. The path and active state are rebuilt on resize/ScrollTrigger refresh.
- Bottom cards repeat the profile summary and list English, Hindi, and Marathi.
- Firefly count is 40 normally or 18 on low-power devices; animation pauses when off-screen. Reduced motion uses a static grade and marks all path lights active.

### Skills / Toolkit

Implemented in [src/components/sections/Skills.tsx](./src/components/sections/Skills.tsx), with its CSS 3D shelf in [src/index.css](./src/index.css) and data in [src/data/skills.ts](./src/data/skills.ts).

- Section label `04 — SKILLS` / `技`; heading “THE / TOOLKIT.” over the forest shrine background, dark night grade, vignette, and fireflies.
- Four groups:
  1. **FRONTEND:** React, TypeScript, JavaScript, Tailwind CSS, Vite, Zustand, HTML, CSS.
  2. **BACKEND / DATA:** Python, FastAPI, SQL / DBMS, SQLite.
  3. **AI / LLMs:** Ollama / Local LLMs, AI Agents, Prompt Engineering, AI-assisted Development.
  4. **CORE CS:** C, C++, Java, Data Structures & Algorithms, OOP, Software Engineering, Git / GitHub.
- Desktop with motion enabled: skills are represented by four CSS 3D clothbound volumes on a shelf. Scroll chooses the active/open volume; volume/book controls and red progress ticks navigate to a volume; Enter/Space activate a book; dragging the open volume rotates it. A side panel lists the active group’s skills.
- The open group is the sole active state; scroll is the source of truth except during the short click-navigation lock.
- Mobile (`<768px`) and reduced-motion layouts hide the interactive shelf and instead show four readable glass cards. No skill is hidden behind the 3D interaction.
- Background fireflies use 22 particles normally or 10 on low-power devices.

### Contact / end

Implemented in [src/components/sections/Contact.tsx](./src/components/sections/Contact.tsx).

- Section label `05 — CONTACT` / `連絡`; dawn/amber grade over the autumn contact landscape.
- Heading: “SO... / WHAT SHOULD / WE BUILD / NEXT?”
- Primary “LET’S TALK” pearl-style button opens the email composer.
- Three contact cards show email, GitHub handle and LinkedIn handle, each with a matching pearl button. Email uses `mailto:`; GitHub/LinkedIn open a new tab with `noopener,noreferrer`.
- Footer thanks the reader, displays `THE END`, brand/developer/copyright year (computed at runtime), and Japanese `東京`.
- No form submission/backend is implemented.

## 5. Global UI and interaction systems

### Navigation

[src/components/navigation/Navigation.tsx](./src/components/navigation/Navigation.tsx) reads labels from [src/data/navigation.ts](./src/data/navigation.ts) and profile details from [src/data/profile.ts](./src/data/profile.ts).

- Fixed translucent, blurred header; hidden above the page until scroll exceeds half a viewport.
- Desktop links: WORK, ABOUT, SKILLS, CONTACT. Current section is inferred from section positions relative to the viewport midpoint; active link gets a red underline.
- Brand on the left scrolls to `hero`; mobile button opens a full-screen menu with large numbered links and name/location.
- Mobile menu locks document scrolling and stops Lenis, closes on Escape or link selection, then scrolls after its closing transition.
- The nav tracks `hero`, `story`, `world`, `work`, `about`, `skills`, and `contact`, but only exposes work/about/skills/contact in the labeled link list; story/world are deliberately not separate nav links.

### Smooth scrolling and progress

- [SmoothScroll](./src/components/common/SmoothScroll.tsx) creates Lenis (`lerp: 0.1`, smooth wheel) only when reduced motion is not requested. Lenis is driven by the GSAP ticker, and its scroll events update ScrollTrigger.
- The shared Lenis instance is stored in [src/lib/lenis.ts](./src/lib/lenis.ts); `scrollToId` in [src/lib/scroll.ts](./src/lib/scroll.ts) uses Lenis when available and native scrolling otherwise.
- [ScrollProgress](./src/components/common/ScrollProgress.tsx) draws a thin red progress line across the top and, on desktop, a vertical `000 / 100` percentage label at the left.

### Custom cursor

[src/components/common/CustomCursor.tsx](./src/components/common/CustomCursor.tsx):

- Only activates for `(hover: hover) and (pointer: fine)` devices; touch devices retain the system cursor.
- Hides the native cursor only while custom cursor is active.
- Cursor scales into a small dot, a link ring, or a red labeled cursor for `data-cursor="view|open|explore|drag"` elements.
- Current project links use `data-cursor="open"`. Movement is eased with GSAP and cursor disappears when leaving the document.

### Tokyo clock

[src/components/common/TokyoClock.tsx](./src/components/common/TokyoClock.tsx) formats real time in `Asia/Tokyo` as 24-hour `HH:MM:SS`, refreshing every second; it is independent of the visitor’s local timezone.

### Shared section scene and headline

- [Scene](./src/components/scenes/Scene.tsx) supplies the regular section shell: full viewport minimum height, max-width 1600px, responsive gutters, background image, dim layer, top/bottom fades, optional vignette and sunset/night/dawn color grades, section header, and data-driven text/reveal animations.
- Scene backgrounds subtly parallax and zoom with scroll. Elements marked `data-reveal` and word groups marked `data-words` animate into view once.
- Story opts into a paper tone (dark text, no vignette); most other sections use the dark treatment.
- [Headline](./src/components/animation/Headline.tsx) renders a semantic heading with accessible combined text and per-word spans animated by Scene.
- [Fireflies](./src/components/scenes/Fireflies.tsx) draws warm drifting lights on one canvas using a pre-rendered glow sprite; IntersectionObserver pauses offscreen animation, ResizeObserver updates canvas scale, and reduced motion draws a static frame.
- [PearlButton](./src/components/ui/pearl-button.tsx) is a reusable glossy, pill-shaped button with focus-visible cyan outline, hover/active states and compact variant. It injects its component CSS through a `<style>` element.
- [ErrorBoundary](./src/components/common/ErrorBoundary.tsx) logs a failed scene and renders its supplied fallback (or nothing); currently it wraps only the World canvas subtree.

## 6. Visual design system

Defined mainly in [src/index.css](./src/index.css), Tailwind utilities and the hero’s local CSS.

### Colors and type

- Base background `#070707`; surfaces `#0d0d0d` / `#121212`; primary text `#f2f2f2`.
- Accent red `#ff3b30`; ember `#ff7a2e`; cyan `#7de7ff`; muted text `#8a8a8a`; paper `#e8e2d0`.
- Display font: **Space Grotesk**; monospace labels: **JetBrains Mono**; Japanese text: **Noto Sans JP**. Fonts are requested from Google Fonts in [index.html](./index.html).
- Labels are uppercase, monospace, 12px-equivalent with 0.16em tracking. Japanese labels use the separate Noto Sans JP face; selected copy is vertical.
- Headlines are oversized uppercase editorial typography using responsive `clamp()` sizes, tight line height and negative tracking.

### Surface, texture and motion

- Glass cards use translucent layered gradients, thin white borders, light backdrop blur and deep shadows. The Story card has a separate warm paper/glass treatment.
- Selected Work rows brighten their red border on hover.
- A subtle fixed SVG turbulence layer gives the whole page film grain; it is pointer-transparent.
- Focus-visible controls use a cyan outline; text selection uses red with dark text.
- The shared cinematic easing is `cubic-bezier(0.76, 0, 0.24, 1)`.
- CSS and JS both respect `prefers-reduced-motion`; the CSS layer reduces animation/transition duration, while components conditionally skip or simplify scroll and WebGL effects.
- At viewport widths below 768px, nav, cards, grid layouts and Skills experience change to mobile layouts. Several sections use dynamic viewport units (`svh`) to avoid mobile browser chrome issues.

### Background artwork and asset pipeline

- Background registry: [src/data/backgrounds.ts](./src/data/backgrounds.ts). `autumn` intentionally aliases the contact background.
- Optimized files used by the UI are in `public/images/bg/`:
  - `hero.webp` — grayscale samurai/dragon artwork.
  - `story.webp` — red samurai artwork.
  - `projects.webp` — moonlit temple and red foliage.
  - `about.webp` — sunset mountains and pagoda.
  - `skills.webp` — blue-green forest shrine/torii.
  - `contact.webp` — bright autumn landscape with orange trees and stream; also the World interlude background.
  - `samurai-cutout.png` — transparent foreground samurai layered in Hero.
- Original JPEGs live in `public/images/raw/`. [scripts/process-images.mjs](./scripts/process-images.mjs) uses Sharp, rotates by 270 degrees by default (argument can override), writes WebP at quality 82, and maps `download7→hero`, `download6→story`, `download2→projects`, `download5→about`, `download3→skills`, `download4→contact`. `download.jpg` and `download1.jpg` are not in this script’s output map.
- The browser loads public assets by root-relative URLs such as `/images/bg/hero.webp`. Keep those paths and the background registry aligned if assets are renamed.
- `public/favicon.svg` and `public/icons.svg` exist. The HTML currently defines an inline data-URI red-dot favicon rather than linking `public/favicon.svg`.

## 7. Data/content source of truth

- [src/data/profile.ts](./src/data/profile.ts): name/brand, role/tagline/focus/location, email/social URLs, summary and languages. Update this rather than duplicating profile copy in components.
- [src/data/navigation.ts](./src/data/navigation.ts): desktop/mobile nav labels and IDs.
- [src/data/projects.ts](./src/data/projects.ts): typed project records (`Project` interface), link, text, stack, status, highlights and thumbnail.
- [src/data/experience.ts](./src/data/experience.ts): education and hackathon details.
- [src/data/skills.ts](./src/data/skills.ts): typed skill-group records.
- [src/data/backgrounds.ts](./src/data/backgrounds.ts): background URL registry.
- Profile information currently published by the portfolio: Anand Kene; Akola, Maharashtra, India; BCA student expected to graduate in 2028; CGPA 8.50+; English/Hindi/Marathi; email and GitHub/LinkedIn links as recorded in `profile.ts`.
- [index.html](./index.html) sets page title, theme color, SEO description, Open Graph title/description/type, Twitter card and font preconnects. Update metadata if the portfolio identity or public copy changes.

## 8. Source map

```text
src/
  App.tsx                         Page order, preloader state, lazy World import
  main.tsx                        React root and global UI mounting
  index.css                       Tokens, global reset, glass cards, lanterns, 3D Skills shelf
  components/
    animation/Headline.tsx         Accessible animated editorial headline
    common/
      CustomCursor.tsx            Pointer-only custom cursor
      ErrorBoundary.tsx            React error boundary for visual subtree
      Preloader.tsx                Loading/reveal overlay
      ScrollProgress.tsx           Global scroll progress UI
      SmoothScroll.tsx             Lenis ↔ GSAP ticker bridge
      TokyoClock.tsx               Asia/Tokyo digital clock
    navigation/Navigation.tsx      Fixed responsive nav and mobile menu
    scenes/
      Fireflies.tsx                Canvas firefly layer
      Scene.tsx                    Shared photographic section shell
    sections/
      About.tsx                    Education/hackathon/AURA path journey
      Contact.tsx                  Email and external contact actions
      Hero.tsx                     Landing section and transition
      Projects.tsx                 Project list
      Skills.tsx                   Interactive bookshelf / static fallback
      Story.tsx                    Manifesto and profile summary
      World.tsx                    Lazy Three.js autumn interlude
    ui/
      glass-headline-hero.tsx      Custom WebGL2 refractive headline
      pearl-button.tsx             Glossy CTA button
  data/                            Central portfolio content and asset URLs
  hooks/useReducedMotion.ts        Reduced-motion media-query hook/helper
  lib/
    device.ts                      WebGL and low-power checks
    gsap.ts                        GSAP + ScrollTrigger registration
    lenis.ts                       Shared Lenis instance
    scroll.ts                      Scroll-to-section helper
public/
  images/bg/                       Optimized section/background assets
  images/raw/                     Source JPEG images
scripts/process-images.mjs         Sharp rotation/WebP generation script
```

## 9. Accessibility, performance, and behavioral constraints

- Use semantic headings, sections, lists, links and buttons. Preserve labels/IDs relied on by Navigation, ScrollTrigger, CSS, or the preloader.
- Decorative backgrounds/canvases are `aria-hidden` or have empty alt text. Hero heading, Story summary and generated headlines retain accessible combined text while decorative word spans are hidden from assistive technology.
- Keep keyboard operation for mobile navigation and the Skills volume controls; the Skills books support Enter/Space and show a focus-visible outline.
- Respect reduced motion in new work. Existing intentional fallbacks include native scrolling, static readable Skills cards and no World 3D leaves.
- Avoid introducing continuous work across the whole page. Existing WebGL/Canvas work is viewport-aware; world content is lazy-loaded; images are generally lazy-loaded outside Hero.
- `isLowPower()` treats viewports narrower than 768px, hardware concurrency at or below 4, or `deviceMemory` at or below 4 as low-power.
- Desktop custom cursor must never replace touch behavior.
- There is no contact form, persistence, API integration, authentication, analytics setup, or environment-variable configuration visible in the current app.
- External project/contact links should continue to use safe new-tab attributes where applicable.

## 10. Notes for future edits

1. Keep profile facts, project descriptions, experience, skills, navigation labels and backgrounds in the existing `src/data/` modules.
2. When adding a section, add it to `App.tsx`, give it a stable ID and scene/header identity, and update Navigation’s `SECTION_IDS` only if active-section tracking should include it. Add a visible nav link only if it belongs in `navItems`.
3. If section order, image dimensions, fonts or content heights change, refresh ScrollTrigger after layout/fonts settle; the hero already refreshes after `document.fonts.ready`.
4. If changing the World chunk or placeholder height, keep both `WorldSpace` and `World` geometry/ID behavior aligned to avoid scroll jumps.
5. When replacing project URLs, use exact repository links rather than the current GitHub profile fallback.
6. When replacing images, update `backgrounds.ts`, the UI’s direct image references, and the Sharp script mapping as appropriate. Do not assume every raw JPEG is currently consumed.
7. Keep reduced-motion and mobile fallbacks functionally complete, not merely visually hidden; the Skills card layout is the existing pattern.
8. The implementation uses GSAP/ScrollTrigger and Lenis together. Use the existing `lib/gsap.ts`, `lib/lenis.ts`, and `lib/scroll.ts` helpers rather than registering or creating competing global instances.
9. `dist/` is generated output; make source changes under `src/`, `public/`, or `scripts/`, not by editing built assets.
