# CampusNexus — Real Features & Real-Time Implementation

Grounded version: what would actually be built if this went from PS to a real deployment.
No inflated stats, no unverifiable third-party citations — estimates are marked as estimates.

---

## Core differentiator (keep this as the spine of everything)

Energy and water are usually monitored separately. Water pumping, heating, and treatment
consume electricity; electricity generation (especially thermal) consumes water. Treating
them as one optimization problem — not two dashboards — is the actual idea. Every feature
below should trace back to this.

---

## Feature set (real, buildable, in priority order)

### 1. Occupancy-based auto shutoff (energy)
- **What:** Motion/PIR sensors (or existing WiFi-AP association counts as a cheap proxy) per room
- **Logic:** If a room reports zero occupancy for > N minutes during non-class hours → flag for auto shutoff (lights/AC), notify facilities if manual override is needed
- **Why real:** PIR sensors are ~$2–5/unit; WiFi-proxy occupancy needs zero new hardware, just access to AP logs

### 2. Water flow anomaly / leak detection
- **What:** Flow sensors at key junctions (tank outlets, building risers)
- **Logic:** Rolling baseline per hour-of-day/day-of-week (a leak looks different from a Monday-morning restroom rush). Simple z-score or moving-average-deviation flags flow that's statistically abnormal for that time slot — no need for a Graph Neural Network at pilot scale
- **Why real:** This is the same core idea as commercial AMI leak detection, just scoped down

### 3. Nexus scheduling (the actual novel part)
- **What:** Water pumps/heaters scheduled against the campus's own electricity demand curve (not generic "off-peak" — the campus's actual measured low-demand windows)
- **Logic:** If tank levels allow, shift non-urgent pumping to the campus's lowest-demand hours. This is a scheduling/optimization problem, not deep learning — a constraint solver or even a rules engine is enough for a pilot
- **Why this is the pitch-winning feature:** it's the one thing that requires treating energy + water as one system, which is genuinely rare in existing smart-campus tooling

### 4. Facilities alert + action log
- **What:** Every automated action and every flagged anomaly logged with a timestamp and reason (explainability, not a black box)
- **Why real:** Facilities teams won't trust or adopt a system that acts silently — an audit trail is a real adoption requirement, not a nice-to-have

---

## Real-time architecture

```
Sensors (PIR, flow meters, smart plugs)
        │  (MQTT, lightweight — works on constrained campus WiFi)
        ▼
Edge gateway (Raspberry Pi / existing IoT gateway)
        │  local buffering if connectivity drops
        ▼
Time-series store (InfluxDB or TimescaleDB — cheap, self-hostable)
        │
        ▼
Rules + lightweight ML layer
  - occupancy shutoff: simple threshold rule
  - leak detection: rolling baseline + z-score (scikit-learn, not deep learning)
  - nexus scheduling: constraint-based scheduler (OR-Tools or hand-rolled)
        │
        ▼
Dashboard (web app) + action dispatch (actuator relay or facilities notification)
```

**Latency reality check:**
- Occupancy → shutoff: seconds (simple rule, no model inference needed)
- Leak flagging: minutes (needs a rolling window to avoid false positives)
- Nexus scheduling: recalculated daily/hourly, not real-time — it's a planning problem, not a control-loop problem

---

## Phased rollout (realistic, not a 24-month fantasy roadmap)

1. **Pilot (1 building, ~1 month):** install sensors, get baseline data, no automation yet — just visibility
2. **Automate (month 2):** turn on occupancy shutoff + leak alerts (human-in-the-loop, no auto-actuation yet)
3. **Nexus scheduling (month 3+):** once baseline demand curves are stable, add the pump/heater scheduling layer
4. **Scale:** expand building-by-building, reusing the same pipeline

---

## Honest constraints to mention if asked (shows engineering maturity, not a weakness)

- WiFi-based occupancy proxy is noisy — false positives from devices left in bags. PIR is more accurate but costs more per room.
- Leak detection needs 1–2 weeks of baseline data before it's reliable — can't claim day-one accuracy.
- Nexus scheduling only helps where there's flexibility in *when* water is pumped/heated (tanks with buffer capacity) — not every building has that.
