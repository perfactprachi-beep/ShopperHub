# TODO — Shoppers Stop Clone
> Check off tasks as you complete them. Work phase by phase — don't skip ahead.

---

## ✅ Phase 0 — Project Setup

- [ ] Init monorepo root `package.json` with workspaces (`client`, `server`)
- [ ] Create `.gitignore` (root)
- [ ] Init git repo + first commit
- [ ] Create `client/` with Vite + React 18 template
- [ ] Install client deps: `react-router-dom`, `zustand`, `axios`, `tailwindcss`
- [ ] Configure TailwindCSS + design tokens in `tailwind.config.js`
- [ ] Create `server/` with Express 5 boilerplate
- [ ] Install server deps: `express`, `pg`, `bcrypt`, `jsonwebtoken`, `joi`, `multer`, `cors`, `cookie-parser`, `dotenv`
- [ ] Create `.env` files (client + server) from `.env.example` templates
- [ ] Set up PostgreSQL database `shoppersstop`
- [ ] Run schema migration (all 13 tables)
- [ ] Seed categories, brands, and 1 admin user
- [ ] Verify DB connection via `pool.query('SELECT NOW()')`

---

## 🔐 Phase 1 — Auth

- [ ] `POST /api/auth/register` — hash password, insert user, return tokens
- [ ] `POST /api/auth/login` — verify password, issue access + refresh tokens
- [ ] `POST /api/auth/refresh` — rotate refresh token
- [ ] `POST /api/auth/logout` — clear cookie
- [ ] `authGuard` middleware — verify JWT on protected routes
- [ ] `adminGuard` middleware — verify `role = 'admin'`
- [ ] Client: Login page UI
- [ ] Client: Register page UI
- [ ] Client: Zustand `authStore` (user, tokens, login/logout actions)
- [ ] Client: Axios interceptor — auto-attach token, auto-refresh on 401
- [ ] Client: `ProtectedRoute` HOC
- [ ] Client: `AdminRoute` HOC

---

## 🛍️ Phase 2 — Products & Catalog

- [ ] `GET /api/products` with filters: category, brand, gender, price range, sort, pagination
- [ ] `GET /api/products/:slug` — detail with variants + images
- [ ] `GET /api/products/search?q=` — PostgreSQL full-text search
- [ ] `GET /api/categories` — nested tree
- [ ] `GET /api/brands` — list
- [ ] Client: `ProductCard` component
- [ ] Client: `ProductGrid` (responsive 2–4 col)
- [ ] Client: `FilterSidebar` (price slider, checkboxes, color swatches)
- [ ] Client: `SortBar` dropdown
- [ ] Client: Category listing page `/category/:slug`
- [ ] Client: Brand page `/brand/:slug`
- [ ] Client: Product detail page `/product/:slug`
- [ ] Client: `ImageGallery` with thumbnail strip + hover zoom
- [ ] Client: `VariantPicker` (size + color)
- [ ] Client: Search results page `/search?q=`
- [ ] Client: Skeleton loaders for all product lists

---

## 🏠 Phase 3 — Homepage

- [ ] `GET /api/banners` — active banners by position
- [ ] Client: `BannerCarousel` — auto-play hero slider
- [ ] Client: Featured categories strip
- [ ] Client: `BrandStrip` — horizontal scroll logos
- [ ] Client: Deals/Offers section
- [ ] Client: Navbar (logo, search, cart icon, wishlist, account menu)
- [ ] Client: Footer (links, store info, app badges)
- [ ] Client: Offers page `/offers`

---

## 🛒 Phase 4 — Cart & Wishlist

- [ ] `GET/POST/PUT/DEL /api/cart` endpoints
- [ ] `GET/POST/DEL /api/wishlist` endpoints
- [ ] Client: Zustand `cartStore` (persisted to localStorage)
- [ ] Client: Sync cart with server on login
- [ ] Client: `CartDrawer` slide-in panel
- [ ] Client: Cart page `/cart` with quantity editor + remove
- [ ] Client: Zustand `wishlistStore`
- [ ] Client: Wishlist page `/wishlist`
- [ ] Client: Wishlist toggle on `ProductCard`
- [ ] Client: "Move to Cart" from Wishlist

---

## 💳 Phase 5 — Checkout & Payments

- [ ] `POST /api/coupons/validate` — check code, min order, expiry
- [ ] `POST /api/payments/create-order` — Razorpay order creation
- [ ] `POST /api/payments/verify` — signature verification + order record
- [ ] Razorpay webhook endpoint (or client-side fallback)
- [ ] Client: Checkout page (3 steps: Address → Coupon → Pay)
- [ ] Client: `AddressForm` component
- [ ] Client: Coupon input with live validation feedback
- [ ] Client: Razorpay JS SDK integration
- [ ] Client: Order success / failure pages

---

## 📦 Phase 6 — Orders & Account

- [ ] `GET /api/orders` — list with pagination
- [ ] `GET /api/orders/:id` — detail + items
- [ ] `POST /api/orders/:id/cancel`
- [ ] `GET/PUT /api/account` — profile
- [ ] `GET/POST/PUT/DEL /api/account/addresses`
- [ ] Client: Order history page `/orders`
- [ ] Client: Order detail page `/orders/:id`
- [ ] Client: `OrderStatusStepper` timeline component
- [ ] Client: Account page `/account` (profile + addresses)
- [ ] Client: Add/edit address modal

---

## ⭐ Phase 7 — Reviews & First Citizen

- [ ] `POST /api/reviews` — post-purchase gate check
- [ ] `GET /api/reviews/:productId`
- [ ] Client: `RatingStars` (interactive + display modes)
- [ ] Client: Review form on product detail (shown if purchased)
- [ ] Client: Review list with average rating bar
- [ ] First Citizen — earn points on order create (1 pt per ₹100)
- [ ] First Citizen — show balance on account page
- [ ] First Citizen — redeem at checkout (max 20% of order total)

---

## 🔔 Phase 8 — Notifications

- [ ] `GET /api/notifications` — unread count + list
- [ ] `PUT /api/notifications/read` — mark all read
- [ ] Client: Bell icon in Navbar with unread badge
- [ ] Client: Notification dropdown / drawer
- [ ] Trigger notifications on: order confirmed, shipped, delivered

---

## 🧑‍💼 Phase 9 — Admin Panel

- [ ] Admin dashboard `/admin` — stats (total orders, revenue, users, products)
- [ ] Sales chart (recharts) — daily/weekly revenue
- [ ] Product CRUD `/admin/products` — list, create, edit, delete
- [ ] Image upload (multer) — up to 6 images per product
- [ ] Variant management — add/remove size+color+SKU rows
- [ ] Category CRUD `/admin/categories` — tree view
- [ ] Brand CRUD `/admin/brands`
- [ ] Order management `/admin/orders` — status update dropdown
- [ ] Coupon CRUD `/admin/coupons`
- [ ] Banner CRUD `/admin/banners` — image upload + position
- [ ] User list `/admin/users`

---

## 🚀 Phase 10 — Polish & Deployment

- [ ] PostgreSQL `tsvector` index for full-text search
- [ ] Rate limiting (express-rate-limit) on auth routes
- [ ] Helmet.js for security headers
- [ ] CORS locked to production domain
- [ ] Image optimization (sharp) on upload
- [ ] Lazy loading all route pages (`React.lazy` + Suspense)
- [ ] PWA manifest + service worker (offline support)
- [ ] Meta tags + Open Graph for SEO
- [ ] Error boundary component
- [ ] 404 page
- [ ] Production build test (`vite build` + `node server.js`)
- [ ] Deploy server (Railway / Render / EC2)
- [ ] Deploy client (Vercel / Netlify)
- [ ] Point custom domain + SSL

---

## 🐛 Bug Tracker

| # | Bug | Status | File |
|---|-----|--------|------|
| 1 | | | |

---

*Last updated: —*
