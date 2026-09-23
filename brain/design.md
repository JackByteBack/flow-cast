# FlowCast + BarrierLens — Design System & UI/UX Specification

---

## 1. Design Philosophy

FlowCast serves two fundamentally different user groups — **commuters** (quick, mobile-first, action-oriented) and **city planners** (data-heavy, desktop-first, analytical). The design must feel:

- **Clean and map-centric** — the map is always the hero element
- **Accessible** — WCAG 2.1 AA compliant, high contrast, keyboard navigable
- **Trust-building** — AI detections are presented transparently with confidence indicators
- **Modern and premium** — glassmorphism overlays on the map, smooth micro-animations, polished typography

---

## 2. Color Palette

### Primary Colors

| Token               | Hex       | Usage                                      |
| -------------------- | --------- | ------------------------------------------ |
| `--color-primary`    | `#2563EB` | Primary actions, links, active states      |
| `--color-primary-dark` | `#1D4ED8` | Hover states, emphasis                   |
| `--color-primary-light` | `#DBEAFE` | Backgrounds, badges                     |

### Route Priority Colors

| Route Type     | Color     | Hex       | Rationale                                 |
| -------------- | --------- | --------- | ----------------------------------------- |
| **Fast**       | Blue      | `#2563EB` | Speed, efficiency                         |
| **Green**      | Emerald   | `#10B981` | Sustainability, eco-friendly              |
| **Reliable**   | Amber     | `#F59E0B` | Caution, reliability, consistency         |
| **Accessible** | Purple    | `#8B5CF6` | Inclusivity, accessibility                |

### Semantic Colors

| Token                | Hex       | Usage                                     |
| -------------------- | --------- | ----------------------------------------- |
| `--color-success`    | `#22C55E` | Success states, verified detections       |
| `--color-warning`    | `#EAB308` | Warnings, medium congestion               |
| `--color-danger`     | `#EF4444` | Errors, heavy congestion, barriers        |
| `--color-info`       | `#3B82F6` | Informational tooltips                    |

### Neutral Scale

| Token             | Hex       | Usage                          |
| ----------------- | --------- | ------------------------------ |
| `--gray-50`       | `#F9FAFB` | Page backgrounds               |
| `--gray-100`      | `#F3F4F6` | Card backgrounds               |
| `--gray-200`      | `#E5E7EB` | Borders, dividers              |
| `--gray-500`      | `#6B7280` | Secondary text                 |
| `--gray-700`      | `#374151` | Primary text                   |
| `--gray-900`      | `#111827` | Headings, dark mode bg         |

---

## 3. Typography

| Element       | Font             | Size   | Weight | Line Height |
| ------------- | ---------------- | ------ | ------ | ----------- |
| H1            | Inter            | 28px   | 700    | 1.2         |
| H2            | Inter            | 22px   | 600    | 1.3         |
| H3            | Inter            | 18px   | 600    | 1.4         |
| Body          | Inter            | 14px   | 400    | 1.6         |
| Body Small    | Inter            | 12px   | 400    | 1.5         |
| Button        | Inter            | 14px   | 500    | 1.0         |
| Map Label     | Inter            | 11px   | 500    | 1.2         |
| Metric Value  | JetBrains Mono   | 24px   | 700    | 1.1         |

**Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
```

---

## 4. Spacing & Layout

- **Base unit:** 4px
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
- **Border radius:** `4px` (buttons), `8px` (cards), `12px` (modals), `9999px` (pills)
- **Card shadows:** `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- **Elevated shadow:** `0 10px 25px rgba(0,0,0,0.15)`

### Breakpoints

| Breakpoint | Width    | Target                       |
| ---------- | -------- | ---------------------------- |
| `sm`       | 640px    | Mobile landscape             |
| `md`       | 768px    | Tablet                       |
| `lg`       | 1024px   | Small desktop                |
| `xl`       | 1280px   | Standard desktop             |
| `2xl`      | 1536px   | Large desktop / dashboard    |

---

## 5. Component Specifications

### 5.1 Map View (Hero Component)

- Occupies **100% viewport** on commuter app
- Route overlays with **color-coded polylines** (Fast=blue, Green=emerald, Reliable=amber, Accessible=purple)
- Interactive markers for BarrierLens locations
- Glassmorphism bottom/side panel for route details:
  ```css
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  ```

### 5.2 Route Comparison Card

```
┌─────────────────────────────────────────────┐
│  ⚡ Fast Route                    23 min    │
│  ──────────────────────────────────────────  │
│  🕐 Travel Time: 23 min                     │
│  📊 Predicted Delay: +3 min                 │
│  🌿 Est. CO₂: 1.2 kg                        │
│  ♿ Accessibility: 7/10                      │
│                                [Select Route]│
└─────────────────────────────────────────────┘
```

- Show **2-3 route cards** side by side (desktop) or stacked (mobile)
- Highlight the recommended route with a subtle **glow border**
- Color-code each card's accent based on route type

### 5.3 BarrierLens Upload Panel

```
┌─────────────────────────────────────────────┐
│  📸 Upload Accessibility Photo               │
│                                              │
│  ┌─────────────────────────────────────┐     │
│  │                                     │     │
│  │        Drag & drop or click         │     │
│  │        to upload a photo            │     │
│  │                                     │     │
│  └─────────────────────────────────────┘     │
│                                              │
│  📍 Location: [Auto-detect / Manual entry]   │
│                                              │
│                           [Upload & Analyze] │
└─────────────────────────────────────────────┘
```

### 5.4 Detection Results Display

```
┌─────────────────────────────────────────────┐
│  🔍 Accessibility Observations               │
│                                              │
│  ┌──────────┐                                │
│  │ [Photo   │  ✅ Ramp detected (92%)        │
│  │  with    │  ⚠️ Narrow pathway (78%)       │
│  │  bbox    │  ✅ Handrail present (88%)     │
│  │  overlay]│  ❌ No elevator detected        │
│  └──────────┘                                │
│                                              │
│  ⚠️ AI-detected observation —                │
│     human verification recommended           │
│                                              │
│  [✓ Verify]  [✗ Flag Incorrect]              │
└─────────────────────────────────────────────┘
```

### 5.5 City Dashboard Layout

```
┌─────────┬───────────────────────────────────┐
│ Sidebar │         Dashboard Content          │
│         │                                    │
│ • Home  │  ┌────────┐ ┌────────┐ ┌────────┐ │
│ • Map   │  │Active  │ │Predict.│ │Access. │ │
│ • Stats │  │Users   │ │Made    │ │Scanned │ │
│ • Alerts│  │  1,234 │ │  5,678 │ │    890 │ │
│ • Config│  └────────┘ └────────┘ └────────┘ │
│         │                                    │
│         │  ┌──────────────────────────────┐  │
│         │  │     Congestion Heatmap       │  │
│         │  │          (Map)               │  │
│         │  └──────────────────────────────┘  │
│         │                                    │
│         │  ┌──────────────┐ ┌─────────────┐  │
│         │  │ Trend Chart  │ │ Gap Areas   │  │
│         │  └──────────────┘ └─────────────┘  │
└─────────┴───────────────────────────────────┘
```

---

## 6. Creative Animation, WebGL & Interaction Stack

To deliver a state-of-the-art, visually captivating experience, the frontend integrates modern creative libraries:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CREATIVE FRONTEND & MOTION STACK                     │
├────────────────────────────────────────────────────────────────────────┤
│  🌊 Lenis               Smooth inertial scrolling for dashboard/views  │
│  ⚡ GSAP 3 + Plugins     Flip, ScrollTrigger, MotionPath for routes     │
│  🌐 Three.js / Vanta    WebGL interactive traffic mesh & radar nodes    │
│  ✨ React Bits UI       Spotlight cards, DecryptedText, CountUp metrics │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 6.1 Lenis (Smooth Scrolling)
- **Library:** `@studio-freight/lenis` / `lenis`
- **Application Areas:**
  - Landing / project pitch showcase pages.
  - City Planner multi-metric analytics feed and report views.
  - Bottom-sheet scrollable route step-by-step guidance.
- **Configuration:**
  ```javascript
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });
  ```

---

### 6.2 GSAP (GreenSock Animation Platform) + Plugins
- **Key Plugins:** `ScrollTrigger`, `Flip`, `MotionPath`, `TextPlugin`
- **Use Cases:**
  1. **Flip Plugin:** Fluid layout morphing when expanding a route card from summary pill to full step-by-step breakdown.
  2. **MotionPath Plugin:** Animated pulse dots traversing the selected polyline to simulate active vehicle/transit movement.
  3. **ScrollTrigger:** Staggered reveal of dashboard analytics cards, congestion charts, and BarrierLens confidence score dials.
  4. **Timeline Sequencing:** Micro-animations for multi-route computation completion (staggered card entry + polyline stroke draw).

| Interaction              | Animation Mechanism                            | Duration |
| ------------------------ | ---------------------------------------------- | -------- |
| Route selection          | GSAP Flip scale + glowing border stroke        | 200ms    |
| Route polyline draw      | SVG stroke-dashoffset animation via GSAP       | 800ms    |
| Transit pulse indicator  | GSAP MotionPath along polyline coordinates     | 3000ms ∞ |
| Panel slide-up (mobile)  | Spring-physics bottom-sheet entry              | 300ms    |
| Detection result appear  | Staggered blur-to-focus fade (GSAP)            | 250ms    |
| Congestion heatmap load  | Opacity + radial expansion transition          | 500ms    |
| Loading states           | Skeleton shimmer + WebGL node breathing        | ∞ loop   |

---

### 6.3 Three.js & Vanta.js (WebGL Ambient Canvas)
- **Library:** `three` + `vanta` (or custom lightweight Three.js shaders)
- **Application Areas:**
  1. **City Planner Dashboard Header & Background:**
     - **Effect:** `VANTA.NET` / `VANTA.DOTS` styled in custom theme colors (`#2563EB` and `#10B981` dots with low opacity `0.15`).
     - **Meaning:** Represents live IoT sensors, connected traffic network nodes, and real-time data ingestion.
  2. **BarrierLens AI Detection Scanner:**
     - Interactive WebGL radar grid overlay across uploaded street photos during YOLOv8 inference scanning.

```javascript
// Ambient Traffic Network Mesh
VANTA.NET({
  el: "#dashboard-mesh",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1.00,
  scaleMobile: 1.00,
  color: 0x2563eb,
  backgroundColor: 0x111827,
  points: 10.00,
  maxDistance: 22.00,
  spacing: 16.00
});
```

---

### 6.4 React Bits UI Components Integration
From the **React Bits** component ecosystem (`reactbits.dev`):

1. **Spotlight Card (`SpotlightCard`):**
   - Applied to the **4 Route Cards** (Fast, Green, Reliable, Accessible).
   - Mouse-tracking radial gradient glow matching the route's accent color.
2. **CountUp & DecryptedText (`CountUp`, `DecryptedText`):**
   - **`CountUp`:** Live counting animation for Travel Time (`23 min`), CO₂ savings (`1.2 kg`), and Total Scans (`1,234`).
   - **`DecryptedText`:** Matrix-style cyber decryption effect when AI finishes detecting accessibility features (e.g. `[ACCESSIBILITY: RAMP DETECTED (92%)]`).
3. **TrueFocus & BlurText (`TrueFocus`, `BlurText`):**
   - Animated focal box framing active filters (Fast / Eco / Accessible).
   - High-impact kinetic typography for header stats and hero messaging.
4. **Elastic Slider / Magnet (`ElasticSlider`, `Magnet`):**
   - Magnetic snap on action buttons (`[Select Route]`, `[Upload & Analyze]`).
   - Elastic slider for fine-tuning user route preferences (Weighting Time vs. Accessibility).

---

---

## 7. Iconography

Use **Lucide React** icons for consistency. Key icons:

| Concept          | Icon                |
| ---------------- | ------------------- |
| Fast route       | `Zap`               |
| Green route      | `Leaf`              |
| Reliable route   | `Shield`            |
| Accessible route | `Accessibility`     |
| Upload photo     | `Camera`            |
| Location         | `MapPin`            |
| Congestion       | `AlertTriangle`     |
| Settings         | `Settings`          |
| User             | `User`              |
| Dashboard        | `LayoutDashboard`   |
| Chart            | `BarChart3`         |

---

## 8. Dark Mode

- Support **system-preference detection** + manual toggle
- Dark mode uses `--gray-900` as background, `--gray-100` as text
- Map tiles switch to **dark theme** (e.g., Mapbox dark style or CartoDB dark matter)
- Glassmorphism panels use:
  ```css
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  ```

---

## 9. Responsive Design Strategy

| Screen Size | Layout                                                          |
| ----------- | --------------------------------------------------------------- |
| Mobile      | Full-screen map + bottom sheet panel, stacked route cards        |
| Tablet      | Map takes 60%, side panel 40%, 2-column route cards              |
| Desktop     | Map takes 70%, side panel 30%, 3-column route cards              |
| Dashboard   | Fixed sidebar + full content area, responsive grid for metrics   |

---

## 10. UX Principles

1. **Map-first**: The map is always visible; controls overlay it.
2. **Progressive disclosure**: Show summary first, details on tap/click.
3. **Transparency**: Always show AI confidence levels and caveats.
4. **Speed**: Instant feedback — use optimistic UI, skeleton loading.
5. **Inclusivity**: Route accessibility info is never hidden — always one tap away.
6. **Trust**: BarrierLens shows "observed" not "guaranteed" — users verify.
