# FlowCast + BarrierLens — Task Tracker

> Implementation tasks organized by phase. Check off items as they are completed.

---

## Phase 1 — MVP Foundation

### 1.1 Project Setup
- [x] Initialize React frontend with Tailwind CSS
- [x] Initialize FastAPI backend project structure
- [x] Set up PostgreSQL + PostGIS database
- [x] Create Docker Compose for local development
- [x] Configure `.env.example` with all required variables
- [x] Set up Git repository with `.gitignore`

### 1.2 Database & Models
- [ ] Design and create database migration scripts (Alembic)
- [ ] Create `users` table and auth model
- [ ] Create `traffic_segments` table with PostGIS geometry
- [ ] Create `traffic_observations` table
- [ ] Create `traffic_predictions` table
- [ ] Create `accessibility_locations` table with PostGIS geometry
- [ ] Create `accessibility_photos` table
- [ ] Create `accessibility_detections` table
- [ ] Create `route_requests` and `route_results` tables
- [ ] Seed database with pilot area data

### 1.3 Backend API Skeleton
- [x] Set up FastAPI app with CORS, middleware, error handling
- [x] Implement JWT authentication (register, login, me)
- [x] Create API router structure (`/auth`, `/routes`, `/traffic`, `/barrierlens`, `/dashboard`)
- [x] Implement standardized response envelope
- [x] Set up OpenAPI/Swagger documentation

### 1.4 Pilot Area Data
- [ ] Select a small pilot area (city/neighborhood)
- [ ] Collect or simulate historical traffic data for pilot area
- [ ] Download OpenStreetMap data for pilot area
- [ ] Identify 10-20 locations for initial accessibility data
- [ ] Prepare sample accessibility photos

---

## Phase 2 — AI Modules

### 2.1 Traffic Prediction Engine
- [ ] Feature engineering: time-of-day, day-of-week, historical patterns
- [ ] Train XGBoost model on historical/simulated traffic data
- [ ] Evaluate model (MAE, RMSE, accuracy metrics)
- [ ] Create prediction API endpoint (`/api/v1/traffic/predictions`)
- [ ] Store predictions with confidence scores in database
- [ ] Create congestion hotspot aggregation endpoint

### 2.2 BarrierLens — Accessibility Detection
- [x] Set up YOLO model for accessibility object detection (stub implemented)
- [x] Configure detection classes: ramp, stairs, elevator, handrail, obstacle, narrow pathway
- [x] Implement image upload endpoint with validation (type, size)
- [x] Implement image preprocessing pipeline
- [x] Run YOLO inference and extract detections with bounding boxes (stub)
- [x] Store detections with confidence scores and location data
- [x] Create location accessibility score calculation
- [ ] Add detection verification/flagging endpoints

---

## Phase 3 — Route Intelligence

### 3.1 Routing Engine
- [ ] Set up OSRM with pilot area data
- [ ] Implement candidate route generation (2-3 alternatives)
- [ ] Implement travel time scoring (base + predicted delay)
- [ ] Implement reliability scoring (based on prediction confidence)
- [ ] Implement CO₂ emissions estimation
- [ ] Implement accessibility scoring (using BarrierLens data)
- [ ] Create multi-objective route ranking algorithm
- [ ] Implement route calculation endpoint (`/api/v1/routes/calculate`)
- [ ] Return ranked routes: Fast, Green, Reliable, Accessible

---

## Phase 4 — User Interfaces

### 4.1 Commuter Web App
- [x] Set up React + Vite project with Tailwind CSS and design system tokens
- [ ] Install & configure **Lenis** (`@studio-freight/lenis`) for smooth inertial scrolling
- [ ] Install **GSAP 3** + `Flip`, `ScrollTrigger`, `MotionPath` plugins
- [ ] Install **Three.js** & **Vanta.js** for ambient traffic network canvas
- [ ] Integrate **React Bits** UI components (`SpotlightCard`, `DecryptedText`, `CountUp`, `TrueFocus`)
- [x] Implement map component (Leaflet / Mapbox GL)
- [ ] Implement origin/destination input with geocoding
- [x] Implement route priority selector (Fast/Green/Reliable/Accessible)
- [x] Display route comparison cards with React Bits Spotlight effect & metrics
- [x] Draw color-coded route polylines with GSAP SVG dash-array stroke animation
- [ ] Implement animated transit pulse traversing route via GSAP MotionPath
- [x] Implement glassmorphism side/bottom panel
- [x] Build BarrierLens photo upload component with WebGL radar scanning effect
- [x] Display accessibility detection results with matrix DecryptedText & confidence bars
- [ ] Add detection verification/flagging UI
- [x] Implement responsive layout (mobile bottom sheet, desktop side panel)
- [ ] Add loading states (skeleton shimmer + pulsating nodes)
- [ ] Implement dark mode toggle
- [ ] Add WCAG 2.1 AA accessibility features

### 4.2 City Dashboard
- [x] Build dashboard layout with sidebar navigation
- [x] Implement metrics cards (active users, predictions made, locations scanned)
- [ ] Build congestion heatmap visualization
- [ ] Build accessibility gap map
- [ ] Build trend charts (congestion over time)
- [ ] Implement alert/notification system for emerging hotspots
- [ ] Add data export functionality

---

## Phase 5 — Polish & Deploy

### 5.1 Testing
- [ ] Write unit tests for backend services
- [ ] Write integration tests for API endpoints
- [ ] Write component tests for frontend
- [ ] Test ML model accuracy and performance
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance testing (API < 500ms, prediction < 2s, image < 5s)

### 5.2 Deployment
- [ ] Finalize Docker Compose configuration
- [ ] Deploy to cloud platform
- [ ] Configure HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Create README with setup instructions

### 5.3 Demo Preparation
- [ ] Prepare demo script with pilot area walkthrough
- [ ] Create sample user journey: commuter searching for accessible route
- [ ] Create sample city planner journey: viewing congestion hotspots
- [ ] Record demo video or prepare live demo

---

## Hackathon MVP Critical Path

> The minimum viable demo flow — focus here first:

```
1. [x] Photo Upload (BarrierLens UI + API)
2. [x] Accessibility Detection (YOLO inference + results display) — stub implemented
3. [ ] Traffic Prediction (model + API) — API done, model training needed
4. [x] Route Comparison (multi-objective scoring + display)
5. [x] Route Recommendation (ranked cards on map)
6. [x] Simple Dashboard (congestion heatmap + accessibility gaps)
```

---

## Backlog (Post-Hackathon / Phase 2+)

- [ ] Live transit data feed integration
- [ ] Crowdsourced accessibility updates
- [ ] Voice assistance (speech-to-text / text-to-speech)
- [ ] Traffic signal optimization module
- [ ] Emergency vehicle routing
- [ ] Multi-city support
- [ ] LSTM / temporal forecasting models
- [ ] Mobile native app (React Native)
- [ ] IoT / traffic sensor integration
- [ ] Real-time notifications and alerts
