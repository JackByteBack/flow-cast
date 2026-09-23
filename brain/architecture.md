# FlowCast + BarrierLens — System Architecture

---

## High-Level Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────┐    ┌──────────────────────────────┐     │
│  │  Commuter Web App   │    │  City Dashboard (Admin)      │     │
│  │  (React + Tailwind) │    │  (React + Tailwind)          │     │
│  └────────┬────────────┘    └──────────┬───────────────────┘     │
└───────────┼─────────────────────────────┼────────────────────────┘
            │           REST API          │
            ▼                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                       API GATEWAY / BACKEND                      │
│                     Python + FastAPI                              │
│  ┌──────────┐ ┌──────────────┐ ┌──────────┐ ┌────────────────┐  │
│  │  Auth &   │ │   Route      │ │  Upload  │ │   Dashboard    │  │
│  │  User     │ │   Engine     │ │  Service │ │   Aggregation  │  │
│  │  Module   │ │              │ │          │ │   Service      │  │
│  └──────────┘ └──────────────┘ └──────────┘ └────────────────┘  │
└───────────────────────┬──────────────────────────────────────────┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
┌────────────────┐ ┌──────────┐ ┌────────────────┐
│   AI/ML Layer  │ │ Database │ │  Maps & Routing │
│                │ │          │ │                  │
│ • XGBoost /    │ │ Postgres │ │ • OpenStreetMap  │
│   Random Forest│ │ + PostGIS│ │ • OSRM           │
│ • YOLO +       │ │          │ │                  │
│   OpenCV       │ │          │ │                  │
│ • Scikit-learn │ │          │ │                  │
└────────────────┘ └──────────┘ └────────────────┘
```

---

## Technology Stack

### Frontend
| Component            | Technology                     | Purpose                                          |
| -------------------- | ------------------------------ | ------------------------------------------------ |
| UI Framework         | **React 18 / Vite**            | Component-based commuter & admin interfaces      |
| Styling              | **Tailwind CSS**               | Rapid, utility-first responsive design           |
| Map Rendering        | **Leaflet / Mapbox GL**        | Interactive map display with route overlays      |
| Smooth Scrolling     | **Lenis (`@studio-freight/lenis`)** | Inertial scroll for dashboard & report views |
| Animations & Motion  | **GSAP 3 + Flip + MotionPath** | Route morphing, transit pulses, scroll reveals   |
| WebGL & Shaders      | **Three.js + Vanta.js**        | Ambient traffic graph mesh & AI radar scanning   |
| Animated Components  | **React Bits UI**              | Spotlight cards, DecryptedText, CountUp metrics  |
| State Mgmt           | **Zustand / React Context**    | Client-side state for routes, filters, theme     |

### Backend
| Component        | Technology        | Purpose                                       |
| ---------------- | ----------------- | --------------------------------------------- |
| API Framework    | **FastAPI**       | High-performance async REST API               |
| Language         | **Python 3.11+**  | Backend logic, ML integration                 |
| Auth             | **JWT / OAuth2**  | User authentication & role-based access       |
| File Upload      | **FastAPI + S3/local** | BarrierLens image ingestion              |

### AI / ML
| Component              | Technology                    | Purpose                                    |
| ---------------------- | ----------------------------- | ------------------------------------------ |
| Traffic Prediction     | **XGBoost / Random Forest**   | 30-60 min ahead congestion forecasting     |
| Accessibility Detection| **YOLOv8 + OpenCV**           | Detect ramps, stairs, elevators, obstacles |
| Data Processing        | **Pandas + Scikit-learn**     | Feature engineering, model evaluation      |
| Future Enhancement     | **LSTM / Temporal Models**    | Advanced time-series forecasting           |

### Database
| Component      | Technology            | Purpose                                     |
| -------------- | --------------------- | ------------------------------------------- |
| Primary DB     | **PostgreSQL**        | Relational data storage                     |
| Geospatial     | **PostGIS**           | Location-based queries, spatial indexing    |
| Tables         | See Data Model below  | Traffic, routes, accessibility, users       |

### Maps & Routing
| Component        | Technology          | Purpose                                    |
| ---------------- | ------------------- | ------------------------------------------ |
| Map Data         | **OpenStreetMap**    | Base map tiles and road network            |
| Routing Engine   | **OSRM**            | Fast route computation with alternatives   |

### Deployment
| Component       | Technology            | Purpose                                    |
| --------------- | --------------------- | ------------------------------------------ |
| Containerization| **Docker**            | Consistent dev/prod environments           |
| Cloud           | **AWS / GCP / Azure** | Hosting, storage, compute                  |
| CI/CD           | **GitHub Actions**    | Automated testing and deployment           |

---

## Module Architecture

### Module 1: Traffic Prediction Engine

```
Historical Traffic Data ──► Feature Engineering ──► XGBoost Model ──► Prediction API
        │                                                                │
        ├── Time of day, day of week                                    │
        ├── Weather conditions                                          │
        ├── Historical patterns                                         │
        └── Special events                         30-60 min forecasts ◄┘
```

**Inputs:** Timestamp, road segment ID, historical speed/volume data, weather  
**Outputs:** Predicted congestion level, estimated delay, confidence score

### Module 2: BarrierLens (Accessibility Detection)

```
Image Upload ──► Preprocessing ──► YOLO Detection ──► Post-processing ──► DB Storage
                                        │
                                        ├── Ramps
                                        ├── Stairs
                                        ├── Elevators
                                        ├── Handrails
                                        ├── Obstacles
                                        └── Narrow pathways
```

**Inputs:** Geotagged photo, location metadata, contributor ID  
**Outputs:** Detected features, bounding boxes, confidence scores, accessibility score per location

### Module 3: Multi-Objective Route Engine

```
User Request (origin, destination, priority) 
        │
        ▼
    Generate 2-3 Candidate Routes (via OSRM)
        │
        ▼
    Score Each Route on 4 Dimensions:
        ├── Travel Time (from prediction engine)
        ├── Predicted Delay / Reliability
        ├── Estimated CO₂ Emissions
        └── Accessibility Score (from BarrierLens data)
        │
        ▼
    Return Ranked Routes: Fast | Green | Reliable | Accessible
```

### Module 4: City Dashboard

```
Aggregated Data (traffic predictions + accessibility DB)
        │
        ▼
    Congestion Hotspot Heatmap
    Accessibility Gap Map
    Trend Charts & Statistics
    Alert / Notification System
```

---

## Data Model (Core Tables)

```sql
-- Users & Auth
users (id, email, password_hash, role, created_at)

-- Traffic Data
traffic_segments (id, geom, road_name, speed_limit)
traffic_observations (id, segment_id, timestamp, speed, volume, source)
traffic_predictions (id, segment_id, predicted_at, target_time, predicted_speed, confidence)

-- Accessibility (BarrierLens)
accessibility_locations (id, geom, address, overall_score, last_updated)
accessibility_photos (id, location_id, contributor_id, image_url, uploaded_at)
accessibility_detections (id, photo_id, feature_type, confidence, bbox, verified)

-- Routes
route_requests (id, user_id, origin, destination, priority, created_at)
route_results (id, request_id, route_geom, travel_time, delay, emissions, accessibility_score, rank)
```

---

## API Structure

```
/api/v1/
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   └── GET    /me
├── /routes
│   ├── POST   /calculate          # origin, destination, priority → ranked routes
│   └── GET    /history            # user's past route requests
├── /traffic
│   ├── GET    /predictions        # current predictions for area
│   └── GET    /hotspots           # congestion hotspots
├── /barrierlens
│   ├── POST   /upload             # upload photo + location
│   ├── GET    /locations          # accessibility data for area
│   └── GET    /locations/:id      # details for specific location
└── /dashboard
    ├── GET    /congestion-summary  # aggregated congestion data
    ├── GET    /accessibility-gaps  # areas missing accessibility data
    └── GET    /stats              # overall platform statistics
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│              Docker Compose                  │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Frontend │  │ Backend  │  │ PostgreSQL│  │
│  │ (nginx)  │  │ (uvicorn)│  │ + PostGIS │  │
│  │ :3000    │  │ :8000    │  │ :5432     │  │
│  └──────────┘  └──────────┘  └───────────┘  │
│                                              │
│  ┌───────────┐  ┌───────────────────────┐   │
│  │   OSRM    │  │  ML Model Server     │   │
│  │  :5000    │  │  (or embedded)       │   │
│  └───────────┘  └───────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## Directory Structure (Proposed)

```
flowcast/
├── frontend/                    # React + Tailwind
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   ├── RoutePanel/
│   │   │   ├── BarrierLens/
│   │   │   └── Dashboard/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/           # API client
│   │   ├── store/              # State management
│   │   └── utils/
│   ├── package.json
│   └── tailwind.config.js
├── backend/                     # Python + FastAPI
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   ├── auth/
│   │   │   ├── traffic/
│   │   │   ├── barrierlens/
│   │   │   └── dashboard/
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Business logic
│   │   ├── ml/                 # ML model loading & inference
│   │   │   ├── traffic_predictor.py
│   │   │   └── barrier_detector.py
│   │   ├── core/               # Config, security, deps
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── ml/                          # ML training & experiments
│   ├── notebooks/
│   ├── data/
│   ├── models/
│   └── scripts/
├── brain/                       # Project documentation
│   ├── prd.md
│   ├── architecture.md
│   ├── rules.md
│   ├── design.md
│   ├── tasks.md
│   └── memory.md
├── docker-compose.yml
├── .env.example
└── README.md
```
