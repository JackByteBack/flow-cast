# FlowCast + BarrierLens — Product Requirements Document (PRD)

> **AI-Powered Predictive, Sustainable & Accessible Mobility Platform**

---

## 1. Problem Statement

Current navigation systems primarily optimize for travel time and distance, but they do **not** adequately consider:

- Future congestion
- Public-transport delays
- Estimated emissions
- Accessibility barriers

This creates **two problems**:

1. **Commuters** can lose time and may be directed through routes that are difficult for people with mobility needs.
2. **City authorities** have limited predictive visibility into where congestion and accessibility gaps may emerge.

FlowCast addresses this by combining **predictive traffic intelligence**, **public-transport reliability**, **environmental considerations**, and **accessibility information** in one mobility platform.

---

## 2. Proposed Solution

FlowCast is an **AI/ML-powered mobility platform** that predicts traffic and public-transport conditions approximately **30–60 minutes ahead** and recommends routes based on four user priorities:

| Priority     | Description                                          |
| ------------ | ---------------------------------------------------- |
| **Fast**     | Minimize travel time                                 |
| **Green**    | Minimize estimated CO₂ emissions                     |
| **Reliable** | Maximize public-transport reliability                |
| **Accessible** | Avoid barriers for people with mobility limitations |

### BarrierLens Module

- Users or authorized contributors upload photographs of entrances, footpaths, stations, or other locations.
- **Computer vision** identifies features such as ramps, stairs, elevators, handrails, obstacles, and narrow pathways.
- Observations are linked to locations and considered when generating **accessible route recommendations**.

### City Dashboard

- Predicted congestion hotspots
- Accessibility information gaps

---

## 3. Innovation / Uniqueness

- **Predictive rather than purely reactive**: forecasts traffic and transport delays *before* they occur.
- **Multi-objective routing**: considers travel time, reliability, estimated CO₂ emissions, and accessibility — not only distance.
- **Accessibility intelligence**: BarrierLens converts real-world images into structured accessibility information.
- **Dual-user platform**: serves both individual commuters and city planners.
- **Human-verifiable accessibility**: detections are presented as observations rather than treating an AI image result as a guarantee.
- **Modular design**: traffic prediction, accessibility detection, routing, and dashboards can evolve independently.

---

## 4. Target Users

### Primary Users

- Daily commuters and public-transport users
- Wheelchair users and people with mobility limitations
- Elderly users and people who benefit from accessible routes
- Students and workers travelling through congested areas

### Institutional Users

- Municipal/city transport authorities
- Traffic-management teams
- Public-transport operators
- Urban planners and accessibility teams
- Emergency and public-service organizations (later phases)

---

## 5. Expected Impact

- **Reduce avoidable commuter delays** by providing predictive route recommendations.
- **Encourage lower-emission travel choices** by making estimated environmental impact visible.
- **Improve mobility** for people with accessibility requirements by surfacing verified or user-reported accessibility information.
- **Help authorities identify congestion hotspots** before they become severe.
- **Create a structured database** of accessibility conditions that can improve over time.
- **Provide a foundation** for future congestion-management and mobility-resilience systems.

---

## 6. Feasibility

The MVP is technically feasible because it can be developed using:

- Established **open-source frameworks**
- A **limited geographic area** (small pilot area)
- A small **historical or simulated dataset** for traffic/transit data
- A **controlled set of locations** and user-uploaded images for accessibility
- A **pretrained computer-vision model** adapted for accessibility objects (no training from scratch)

The initial system operates as a **recommendation and simulation platform** — direct control of real traffic infrastructure is not required.

---

## 7. Scalability

The architecture is modular, allowing expansion from a small pilot to multiple cities/regions.

**Scalability paths:**

- Adding more road and public-transport data sources
- Expanding the accessibility database
- Supporting additional cities and geographic regions
- Incorporating live transit and traffic feeds
- Adding emergency-vehicle and essential-service routing
- Integrating city traffic-signal optimization (future module)
- Improving prediction models as more historical data becomes available

---

## 8. Hackathon MVP Priority Flow

```
Photo Upload → Accessibility Detection → Traffic Prediction → Route Comparison → Recommendation → Simple Dashboard
```

> **Advanced features** such as live crowdsourcing, voice assistance, traffic-light control, and large-scale real-time infrastructure integration remain **future/Phase 2** features.

---

## 9. Project Positioning

FlowCast combines **predictive mobility**, **sustainability**, **public-transport reliability**, and **accessibility** into a single decision-support platform. BarrierLens functions as the **accessibility intelligence layer** rather than a separate product.
