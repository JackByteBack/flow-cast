# FlowCast + BarrierLens — Development Rules

> Guidelines, conventions, and constraints for the project.

---

## 1. Code Style & Conventions

### Python (Backend)

- **Python 3.11+** required.
- Use **type hints** on all function signatures.
- Follow **PEP 8** style guide. Line length max: **120 characters**.
- Use **async/await** for all FastAPI route handlers.
- Use **Pydantic** models for all request/response schemas.
- Use **SQLAlchemy** ORM for database interactions — no raw SQL in route handlers.
- Environment variables via **`.env`** file — never hardcode secrets.
- All API responses follow a consistent envelope:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "optional message",
    "errors": []
  }
  ```

### React (Frontend)

- Use **functional components** and **hooks** only — no class components.
- Component file naming: **PascalCase** (e.g., `RoutePanel.jsx`).
- Utility/hook file naming: **camelCase** (e.g., `useMapData.js`).
- Keep components **small and focused** — one responsibility per component.
- CSS via **Tailwind CSS utility classes** — avoid custom CSS unless absolutely necessary.
- All user-facing text should be extracted to constants (i18n-ready).

### General

- **No `console.log` / `print` in production code** — use structured logging.
- Every file must have a **brief docstring/comment** at the top explaining its purpose.
- **DRY principle** — reuse services, utilities, and components.
- **No hardcoded URLs** — all API endpoints via environment/config.

---

## 2. Git & Version Control

- **Branch naming:** `feature/<name>`, `bugfix/<name>`, `hotfix/<name>`
- **Commit messages:** Use conventional commits:
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation
  - `refactor:` code refactor
  - `test:` adding/updating tests
  - `chore:` maintenance
- **No direct pushes to `main`** — always use pull requests.
- PRs require **at least one review** before merging.
- Keep commits **atomic** — one logical change per commit.

---

## 3. API Design Rules

- All endpoints prefixed with `/api/v1/`.
- Use **RESTful resource naming** (nouns, not verbs).
- Use proper **HTTP status codes**: 200, 201, 400, 401, 403, 404, 422, 500.
- **Pagination** for all list endpoints: `?page=1&limit=20`.
- **Rate limiting** on public endpoints.
- All file uploads must validate: **file type, file size** (max 10MB images), and **malware scan** (future).
- API versioning in URL path (`/v1/`, `/v2/`).

---

## 4. Database Rules

- All tables must have: `id` (UUID), `created_at`, `updated_at`.
- Use **migrations** (Alembic) for all schema changes — no manual DDL.
- **Indexes** on all foreign keys and frequently queried columns.
- **PostGIS geometry columns** for all location data — no lat/lng as separate float columns.
- Soft delete preferred over hard delete for user-generated content.
- All queries must use **parameterized statements** — no string interpolation.

---

## 5. AI/ML Rules

- Models must be **versioned** — store model version alongside predictions.
- All predictions must include a **confidence score**.
- BarrierLens detections are stored as **observations**, not as guaranteed facts.
  - UI must clearly label: *"AI-detected observation — human verification recommended"*
- Model inference must be **non-blocking** — use background tasks or async processing.
- Training data and model files live in `/ml/` — not in the backend app directory.
- Never expose raw model internals (weights, internal scores) via API.

---

## 6. Security Rules

- **HTTPS only** in production.
- **JWT tokens** with expiry (access: 15min, refresh: 7 days).
- **Password hashing** with bcrypt (min 12 rounds).
- **Input validation** on every endpoint — reject unexpected fields.
- **CORS** configured to allow only known frontend origins.
- **File upload validation** — whitelist image MIME types only (JPEG, PNG, WebP).
- No sensitive data (passwords, tokens, PII) in logs.
- Environment secrets via `.env` — `.env` must be in `.gitignore`.

---

## 7. Accessibility Rules (Product)

- BarrierLens detections are **not guarantees** — always present as "observed" or "reported."
- Users must be able to **flag incorrect detections**.
- Accessible route recommendations must include **disclaimers** about real-world conditions.
- Frontend must meet **WCAG 2.1 AA** standards:
  - Proper color contrast ratios
  - Keyboard navigation support
  - Screen reader compatibility
  - Alt text on all images
  - Focus indicators on interactive elements

---

## 8. Testing Rules

- **Backend:** Unit tests for all service functions, integration tests for API endpoints.
- **Frontend:** Component tests with React Testing Library.
- **ML:** Evaluation metrics (accuracy, precision, recall) logged for each model version.
- Test coverage target: **≥ 80%** for backend services.
- All tests must pass before merging to `main`.

---

## 9. Documentation Rules

- All new API endpoints must have **OpenAPI/Swagger docs** (auto-generated by FastAPI).
- The `brain/` folder is the **single source of truth** for project documentation.
- Update `brain/memory.md` after every major decision or change.
- README must stay current with setup instructions.

---

## 10. Performance Rules

- API response time target: **< 500ms** for standard endpoints.
- Traffic prediction endpoint: **< 2 seconds** including model inference.
- Image analysis (BarrierLens): **< 5 seconds** per image.
- Database queries must use **EXPLAIN ANALYZE** during development — no N+1 queries.
- Frontend bundle size: monitor and keep under **500KB** gzipped for initial load.
- Use **lazy loading** for map tiles, images, and non-critical components.
