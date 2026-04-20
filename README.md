# AirFare Radar - PM Product Case README


## 1. Product Snapshot

**Product name**: AirFare Radar  
**Product Preview**: https://jikoschnee.github.io/Airfare-Radar/#/dashboard  
**Product goal**: Help users quickly discover and act on low-price flight opportunities with less search friction and higher confidence.  
**Current form**: Web app prototype (Vue 3 + TypeScript) with real-data integration, multi-source fallback, and interactive modules.

### What this project proves
- **Problem framing**: Turned a broad idea ("find cheap flights") into concrete user jobs and module roadmap.
- **Feature prioritization**: Sequenced development into phased milestones (foundation -> core flow -> advanced interaction -> visualization -> deployment).
- **Trade-off decisions**: Balanced data reality (API limits, unstable endpoints, fallback quality) against UX continuity.
- **Execution ownership**: Drove product definition through implementation details and release/deploy constraints.

## 2. User Problem & Opportunity

### Core pain points observed
- Users need to check multiple routes/airports repeatedly to find true deals.
- Traditional flight search requires "professional" airport input (IATA), creating onboarding friction.
- Price opportunities are time-sensitive, but users cannot continuously monitor changes.
- Most tools optimize for deterministic booking, not exploratory "deal-first" decision-making.

### Product opportunity
- Build a **deal-discovery-first** experience:
  - natural-language city/airport fuzzy input
  - multi-airport aggregated search
  - watchlist + price-drop reminders
  - "blind box" exploration for inspiration scenarios

## 3. Target Users & Scenarios

### Primary users
- **Price-sensitive leisure travelers**: destination-flexible, willing to travel for a better fare.
- **Efficiency-focused frequent users**: already know routes but want quicker monitoring and alerts.

### Typical scenarios
- "I can depart from multiple airports in Shanghai; show me all good options."
- "I don't have a fixed destination; surprise me with a cheap route."
- "Notify me when my subscribed route gets cheaper."

## 4. Product Strategy & Milestone Design

I split delivery into five product phases to reduce risk and keep learning loops short:

1. **Foundation**  
   Build layout, data schema, and global state so later iterations can scale.
2. **Core browsing flow**  
   Design "ticket-like" cards and feed for fast visual scanning of value.
3. **Search + filters + subscription logic**  
   Convert passive browsing into actionable discovery and retention behavior.
4. **Interactive modules (Blind Box / Map pathing)**  
   Add exploratory interaction to increase engagement depth.
5. **Visualization + deployment hardening**  
   Price trend detail, routing fixes, and release readiness.

This sequence reflects PM priorities: **first guarantee usable core value**, then layer delight and growth mechanics.

## 5. Key Product Decisions

### Decision A: Natural-language airport selection over professional code input
- **Why**: users type "上海浦东", not "PVG.AIRPORT".
- **What changed**: fuzzy matching + multi-select dropdown with full airport list.
- **Impact**: lower interaction friction; faster first successful search.

### Decision B: Multi-airport aggregation instead of first-airport-only query
- **Why**: first-airport-only under-represents real options and hides deals.
- **What changed**: query all selected origin x destination combinations, then merge/deduplicate.
- **Impact**: stronger result coverage and more realistic "deal radar" behavior.

### Decision C: Data source fallback is a product feature, not just technical fallback
- **Why**: free API quotas and third-party errors are expected in real-world usage.
- **What changed**:
  - multi-provider strategy (Booking / AeroDataBox / Learning / Mock)
  - Booking failure triggers user API input modal
  - local cache to protect limited request quota
- **Impact**: resilient UX under unstable external dependencies.

### Decision D: Mobile-first ticket adaptation
- **Why**: desktop ticket layout compressed poorly on small screens.
- **What changed**: mobile-specific ticket split, hierarchy, and perforation direction.
- **Impact**: preserves "ticket" metaphor while restoring readability and tap usability.

## 6. Feature Architecture (What was shipped)

### Core value flow
- Flight feed with visual discount priority (`<2折` highlight)
- Fuzzy search (city/airport)
- Multi-dimensional filters (price slider / direct flight / airline)
- Detail page with 30-day price trend chart

### Engagement & retention
- Route subscription and simulated price-drop notifications
- Blind box module for destination exploration

### Data & reliability
- Booking.com API integration with data normalization
- AeroDataBox integration for flight movement context
- Learning data endpoint for demo and safe fallback
- LocalStorage cache for repeated route queries

### Delivery quality
- Responsive design adaptation (desktop + mobile)
- GitHub Pages deployment path and route troubleshooting
- SPA routing fixes and static asset loading stability

## 7. Product Metrics Framework (for interview discussion)

This is the metric model I designed for validating future iterations:

- **Acquisition / activation**
  - first successful search rate
  - time-to-first-result
- **Core usage quality**
  - average result count per search
  - multi-airport usage ratio
- **Engagement**
  - subscription click-through rate
  - blind-box usage rate
- **Reliability**
  - API failure fallback success rate
  - cache hit ratio
- **Conversion intent**
  - detail page visit rate
  - OTA button click-through rate

## 8. Challenges & PM-Level Risk Handling

- **Risk: third-party API instability / quota exhaustion**  
  Designed graded fallback and user-provided API recovery path.

- **Risk: feature growth causing UX complexity**  
  Added collapsible filter panel and right-side compact information layout.

- **Risk: deployment "works locally but fails online"**  
  Diagnosed MIME / base path / branch-target issues and stabilized Pages strategy.

## 9. Why this project is strong for PM interviews

This is not only a prototype UI. It demonstrates:
- end-to-end product ownership from framing to delivery
- decision-making under uncertainty and constraints
- balance of user value, technical feasibility, and release quality
- ability to convert ambiguous ideas into structured, shippable increments

## 10. Tech Stack

- Vue 3
- Vite
- TypeScript
- Pinia
- Tailwind CSS
- Axios
- ECharts

## 11. Run Locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

---

If you are a recruiter or interviewer, I can provide:
- product roadmap version
- PRD-style breakdown
- STAR interview narrative for each major decision
