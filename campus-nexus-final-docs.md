# CampusNexus — AI Smart Campus for Energy & Water Efficiency

**Problem Statement Theme:** AI Smart Campus — reduce power consumption and water wastage

---

## 1. Problem Statement Understanding & Originality

### The problem, stated precisely

Campuses waste energy and water for the same underlying reasons everywhere: no visibility
into real-time consumption, no automated response to obvious waste (empty rooms with lights
on, pipes leaking for days unnoticed), and no accountability loop connecting usage to cost.
Most institutions monitor *after the fact* — a monthly utility bill, not a live system that
acts.

### What's already been tried (and where it stops short)

Existing "smart campus" tooling generally falls into two silos:
- **Energy management systems** — occupancy-based lighting/HVAC control, load forecasting
- **Water management systems** — leak detection, smart metering, irrigation control

Both are solved independently in commercial building-management systems (BMS). The gap is
that **energy and water are not independent** — pumping, heating, and treating water is
itself an electricity cost, and thermal power generation itself consumes water. Almost no
campus-scale system schedules water operations *against* the campus's actual electricity
demand curve.

### Our originality claim

CampusNexus is not "an energy dashboard plus a water dashboard." Its core mechanism —
**Nexus Scheduling** — treats energy and water as one optimization problem:

> Water pumps, heaters, and non-urgent water operations are scheduled against the campus's
> *own measured* low-demand electricity windows (not a generic "off-peak" assumption), so
> water operations ride on power that would otherwise be idle capacity.

This is a genuinely different framing from "two dashboards side by side," and it's the one
claim in this document that isn't just a smarter version of something that already exists.

Everything else in the system (occupancy shutoff, leak detection) is well-understood,
intentionally — the originality is concentrated in the nexus layer, not spread thin across
five buzzword features.

---

## 2. Engineering Relevance

| Discipline | Where it applies here |
|---|---|
| **Electrical/Power Engineering** | Load profiling to find real low-demand windows; relay/actuator control for lighting and AC shutoff; basic demand-side load shifting |
| **Civil/Environmental Engineering** | Flow-rate baselining per building riser; understanding pipe network topology to place flow sensors at meaningful junctions |
| **Computer Science / Data Engineering** | Sensor data ingestion (MQTT), time-series storage, an anomaly-detection and scheduling service, a web dashboard |
| **Mechanical Engineering** | Understanding pump/heater duty cycles and buffer tank capacity — nexus scheduling only works where physical buffer capacity exists |
| **Systems/Controls Engineering** | Edge-vs-cloud processing tradeoffs, local buffering under unreliable connectivity, human-in-the-loop vs full automation |

This isn't a single-discipline AI project bolted onto a campus — it requires understanding
real building systems (electrical load, water infrastructure) well enough to know *where*
automation is safe and where it needs a human to stay in the loop.

---

## 3. AI/DS Usability — What's Actually AI Here (and what isn't)

Being honest about this matters more than sounding sophisticated:

| Component | Technique | Why this technique, not something heavier |
|---|---|---|
| Occupancy shutoff | Threshold rule on sensor/WiFi-proxy data | No model needed — a "room empty > N minutes" rule is more reliable and auditable than a black-box classifier for a binary decision |
| Leak/anomaly detection | Rolling baseline (mean/variance) per hour-of-day, day-of-week, flagged via z-score or IQR deviation | Statistically sound, explainable to a facilities team, doesn't need a large labeled dataset — unlike a deep model, which we don't have leak-labeled data to train anyway |
| Nexus scheduling | Constraint-based scheduling (rule engine or lightweight solver, e.g. OR-Tools) over the campus's own measured demand curve | This is fundamentally an optimization/scheduling problem, not a prediction problem — reaching for deep learning here would be technique-shopping, not engineering judgment |
| (Future/scale-up) Demand forecasting | Simple time-series model (e.g. seasonal-naive or lightweight regression) once enough historical data exists | Only justified once there's real data to forecast from — not needed for the pilot |

**Why this matters for AI/DS usability scoring:** the strongest AI/DS answer isn't "we used
the fanciest model available" — it's choosing the right-sized technique for the data you'd
actually have, and being able to explain every decision the system makes. A facilities team
that can't understand why the system shut off a room's power won't trust it enough to keep
it running.

---

## 4. Feasibility

### Technical feasibility

- **Sensors:** PIR motion sensors and flow meters are commodity, low-cost hardware (a few
  dollars per unit for PIR; flow meters vary by pipe size but are standard industrial parts)
- **Edge processing:** A single Raspberry Pi (or equivalent) per building is sufficient for
  local buffering and MQTT forwarding — no GPU or heavy compute needed anywhere in this
  pipeline
- **Software stack:** Every component (MQTT, a time-series database, a rules/anomaly-scoring
  service, a web dashboard) is open-source and well-documented — no novel infrastructure
  needs to be invented

### Data feasibility

- Occupancy shutoff works from day one (a rule, not a trained model)
- Leak detection needs roughly **1–2 weeks of baseline data per sensor point** before it's
  reliable — this should be stated upfront, not hidden, because claiming day-one accuracy
  would be false
- Nexus scheduling needs a stable demand-curve baseline for the specific campus before it
  can safely shift water operations — this is a phase-2 capability, not a day-one one

### Constraints worth naming (this is a feasibility strength, not a weakness, when stated clearly)

- WiFi-based occupancy proxying is noisier than dedicated PIR sensors (a phone left in a bag
  reads as "occupied") — a known and manageable limitation, not a fatal flaw
- Nexus scheduling only helps where a building has buffer capacity (a tank, a heater with
  some thermal mass) — it doesn't apply everywhere on campus, and the documentation should
  say so rather than imply universal applicability

### Economic feasibility

No specific ROI figure is claimed here, because a credible number requires actual campus
utility rates and consumption data, which we don't have. What can be said honestly: the
hardware cost per monitored point is low (commodity sensors + one shared edge device per
building), and the software stack has no licensing cost — the main cost is installation and
the facilities team's time integrating the system into existing operations.

---

## 5. Real-Time / Practical Possibility

| Function | Response time | Why |
|---|---|---|
| Occupancy → auto shutoff | Seconds | Simple threshold rule, no inference latency |
| Leak flagging | Minutes | Needs a short rolling window to avoid false positives from normal usage spikes |
| Nexus scheduling | Recalculated daily/hourly | This is a planning decision, not a control-loop decision — pretending it's "real-time" the same way shutoff is would be inaccurate |
| Dashboard updates | Near real-time (seconds) | Standard web-socket/polling update, no bottleneck |

### Realistic rollout, not a fantasy 24-month roadmap

1. **Pilot (1 building, ~1 month):** install sensors, collect baseline data, visibility only
   — no automation yet, so the team can validate sensor accuracy before trusting the system
   to act
2. **Automate with human-in-the-loop (month 2):** occupancy shutoff and leak alerts go live,
   but leak alerts notify facilities rather than auto-shutting a valve, until confidence is
   established
3. **Nexus scheduling (month 3+):** once the demand-curve baseline is stable, add the
   scheduling layer for buildings with buffer capacity
4. **Scale building-by-building**, reusing the same pipeline — no re-architecture needed
   between buildings

---

## 6. Industrial Impact

### Where this generalizes beyond one campus

- **Institutional buildings generally** (hospitals, office campuses, government complexes)
  face the same energy/water silo problem — the nexus-scheduling idea isn't campus-specific
- **Municipal utilities**: the same leak-detection approach (rolling baseline + anomaly
  scoring) is the same core technique used at larger scale in non-revenue-water reduction
  programs — the pilot here is a smaller, provable version of that idea
- **Facilities management as a discipline**: the audit-trail/explainability requirement
  (every automated action logged with a stated reason) is a real adoption blocker for any
  facility-automation product, not just this one — solving it here is a transferable lesson,
  not just a nice-to-have for the demo

### What NOT to overclaim

This document deliberately avoids quoting third-party savings percentages or named
institutional case studies, because those numbers can't be verified from this context and
citing unverifiable stats to judges is a credibility risk, not a strength. Any impact numbers
used in the live pitch should be calculated live from a stated, defensible assumption (e.g.
"a 20-room block leaving lights on 4 hours/day unnecessarily × typical fixture wattage =
X kWh/month wasted") — a transparent estimate a judge can follow beats an impressive-sounding
number with no visible math behind it.

### Broader alignment

The approach maps cleanly to standard sustainability goals around clean water access,
affordable/clean energy, and sustainable infrastructure — worth a one-line mention in a pitch,
not a slide of its own.

---

## Summary — the one-sentence version of everything above

Most smart-campus systems solve energy and water separately with dashboards and black-box
models; CampusNexus's actual contribution is treating them as one system by scheduling water
operations against the campus's own measured electricity demand — built on explainable,
right-sized techniques (rules and statistical baselines, not unnecessary deep learning) that
a facilities team could actually trust and maintain.
