# CampusNexus — UI Mockup Spec (Static Demo, No Backend)

Purpose: a visual-only mockup to show judges what the finished product looks like.
No live data, no functioning logic — every number below is pre-loaded/hardcoded for the demo.

---

## Visual language

- **Palette:** Deep slate background (#0F172A), electric teal accent (#2DD4BF) for energy, sky blue (#38BDF8) for water, amber (#F59E0B) for alerts. Avoid green/red traffic-light clichés — use teal/blue/amber so energy and water are visually distinct at a glance.
- **Typography:** One clean sans-serif (Inter or similar). Large numerals for KPIs, small caps labels.
- **Feel:** Clean ops dashboard, not a consumer app. Think Grafana/mission-control, not a mobile game.

---

## Screen 1 — Overview Dashboard (the one judges see first)

**Layout:** 3-column grid.

- **Left column — Campus map (static SVG/illustration):** simplified top-down campus outline, 6–8 buildings as blocks. Buildings color-coded by current status: teal glow = active/normal, grey = powered down (empty + auto-shutoff), amber pulse = alert (leak/anomaly).
- **Center — Two big KPI cards stacked:**
  - "Energy Saved Today" — large number (e.g. **142 kWh**), small trend line under it
  - "Water Loss Prevented" — large number (e.g. **1,240 L**), small trend line under it
- **Right column — "Nexus Insight" card (the differentiator, make it visually distinct with a border glow):**
  - One sentence, e.g.: *"Block C's water pump was rescheduled to 1–4 AM (off-peak), saving an estimated ₹380/day by pairing water demand with idle electricity capacity."*
  - This card is what should stick in a judge's memory — it's the one thing no competitor dashboard will show.

**Bottom strip:** horizontal ticker of the last 5 automated actions (e.g. "Lights OFF — Room 204 (empty 12 min)", "Leak flagged — Tank 2, flow +34% above baseline").

---

## Screen 2 — Building Drill-down

Click a building block from the map → this view.

- **Top:** building name, occupancy %, current power draw (kW), current water flow (L/min)
- **Middle:** room-by-room list (table or card grid), each row: room name, occupancy icon (person/empty), light/AC status (on/off), last action timestamp
- **Side panel:** simple line chart, "power draw — last 24h" with one annotated dip labeled "auto shutoff triggered"

---

## Screen 3 — Water & Leak View

- **Top:** tank/pipe network diagram (simplified schematic, not literal plumbing) — 4–5 nodes (tanks/junctions) connected by lines
- Each node shows a small flow-rate number; the node with an active anomaly pulses amber with a tooltip: *"Flow 34% above 7-day baseline for this hour — possible leak"*
- **Below:** a short "explainability" line so it doesn't feel like a black box: *"Flagged because current flow (18.4 L/min) exceeds the expected range (11–14 L/min) for this time and day."*

---

## Screen 4 — Alerts / Action Log

- Simple reverse-chronological list, each entry: icon (energy/water), one-line description, timestamp, and a status pill (Auto-resolved / Needs review)
- This screen exists mainly to show judges "the system takes action, not just shows charts"

---

## What NOT to include (keep it winnable in the time you have for the mockup)

- No login/auth screens, no settings pages, no mobile responsive variant — one clean desktop view is enough
- No animated video demo needed for this file — that's the separate video prompt below
- Don't mock up all 8 buildings in detail — 1 fully fleshed-out building + a simplified map for the rest is enough
