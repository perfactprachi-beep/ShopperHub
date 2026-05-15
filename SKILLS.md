# SKILLS MAP — Shoppers Stop Clone
> Technologies, tools, and concepts required. Use this to identify knowledge gaps before starting.

---

## 🖥️ Frontend — React / Vite

| Skill | Level Needed | Learn At |
|-------|-------------|----------|
| React 18 (hooks, context, portals) | Intermediate | react.dev |
| React Router v6 (nested routes, loaders) | Intermediate | reactrouter.com |
| Zustand (state slices, persist middleware) | Beginner | zustand docs |
| TailwindCSS (utility classes, config, JIT) | Intermediate | tailwindcss.com |
| Axios (interceptors, cancel tokens) | Intermediate | axios-http.com |
| Vite (config, env vars, build optimization) | Beginner | vitejs.dev |
| React.lazy + Suspense (code splitting) | Beginner | react.dev |
| Recharts (admin charts) | Beginner | recharts.org |
| Razorpay JS SDK (client-side) | Beginner | razorpay docs |

### Key Patterns to Know
- Controlled components for forms
- Optimistic UI updates (cart, wishlist)
- Infinite scroll / pagination with URL params
- Image lazy loading + skeleton placeholders
- Custom hooks: `useDebounce`, `useLocalStorage`, `useFetch`

---

## 🗄️ Backend — Node.js / Express

| Skill | Level Needed | Learn At |
|-------|-------------|----------|
| Express 5 (routing, middleware, error handlers) | Intermediate | expressjs.com |
| node-postgres `pg` (pool, parameterized queries) | Intermediate | node-postgres.com |
| JWT (sign, verify, rotate refresh tokens) | Intermediate | jwt.io |
| bcrypt (hash, compare) | Beginner | npm/bcrypt |
| Joi (schema validation) | Beginner | joi.dev |
| Multer (file upload, disk storage) | Beginner | npm/multer |
| Cookie-parser (httpOnly cookies) | Beginner | npm |
| express-rate-limit | Beginner | npm |
| Helmet.js (security headers) | Beginner | helmetjs.github.io |
| Razorpay Node SDK | Beginner | razorpay docs |

### Key Patterns to Know
- Layered architecture: routes → controllers → services → queries
- Centralized error handling middleware
- Environment-based config (never hard-code secrets)
- Request validation before hitting the DB
- Transaction management with `pg` (`BEGIN / COMMIT / ROLLBACK`)

---

## 🐘 Database — PostgreSQL

| Skill | Level Needed | Learn At |
|-------|-------------|----------|
| DDL: CREATE TABLE, constraints, FK, ENUM | Intermediate | postgresql.org |
| DML: SELECT with JOINs, INSERT, UPDATE, DELETE | Intermediate | postgresql.org |
| Indexes (B-tree, GIN for tsvector) | Beginner | postgresql.org |
| Full-text search (`tsvector`, `to_tsquery`) | Beginner | postgresql.org/docs/fts |
| Transactions | Beginner | postgresql.org |
| SERIAL / BIGSERIAL primary keys | Beginner | |
| JSONB columns (size charts, metadata) | Beginner | |
| `pg_dump` / `pg_restore` for backups | Beginner | |

### Schema Concepts Used
- Self-referencing FK (categories parent_id)
- ENUM types (order status, gender, payment status)
- Composite unique constraints (one review per user per product)
- Soft deletes via `status` column (not hard DELETE)

---

## 🔐 Auth & Security

| Concept | Notes |
|---------|-------|
| JWT Access Token (15 min) | Stored in memory / Authorization header |
| JWT Refresh Token (7 days) | httpOnly cookie only |
| Token rotation | Issue new refresh token on every refresh |
| Password hashing | bcrypt with saltRounds = 12 |
| CORS | Restrict to `CLIENT_URL` in production |
| Rate limiting | Max 10 requests/min on auth routes |
| Input sanitization | Joi validates all incoming body/query |
| SQL injection prevention | Parameterized queries only (`$1, $2`) |
| XSS prevention | Helmet CSP headers |

---

## 💳 Payments — Razorpay

| Step | Description |
|------|-------------|
| 1. Create Order | Server calls Razorpay API → returns `razorpay_order_id` |
| 2. Open Checkout | Client opens Razorpay modal with `order_id` |
| 3. Payment Done | Client receives `razorpay_payment_id` + `razorpay_signature` |
| 4. Verify | Server verifies HMAC signature with `KEY_SECRET` |
| 5. Confirm | Server marks order `paid`, deducts stock, awards points |

**Test cards:** `4111 1111 1111 1111` CVV `123` any future date

---

## 🛠️ Dev Tools

| Tool | Purpose |
|------|---------|
| VS Code | Editor |
| Postman / Thunder Client | API testing |
| pgAdmin 4 / TablePlus | DB GUI |
| React DevTools | Component inspection |
| Zustand DevTools | State debugging |
| ngrok | Expose local server for Razorpay webhooks |
| ESLint + Prettier | Code quality |
| Git + GitHub | Version control |

---

## 📦 NPM Packages Cheatsheet

### Client (`client/package.json`)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "zustand": "^4.5.0",
    "axios": "^1.7.0",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### Server (`server/package.json`)
```json
{
  "dependencies": {
    "express": "^5.0.0",
    "pg": "^8.11.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "joi": "^17.13.0",
    "multer": "^1.4.5",
    "cors": "^2.8.5",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.4.0",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.3.0",
    "razorpay": "^2.9.0"
  }
}
```

---

## 🧠 Claude Prompting Tips (for this project)

- Always paste the session header: `Project: Shoppers Stop Clone | Stack: React+Vite / Express / PostgreSQL`
- One task per session — don't ask for the entire app at once
- Reference the Master Prompt section by number: "Using conventions from Section 2..."
- Ask Claude to write tests alongside the code: "...and write a Jest test for the service layer"
- If Claude goes off-convention, remind it: "Use named exports, async/await only, and return `{ success, data, message }`"
