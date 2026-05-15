# QUESTIONS — Shoppers Stop Clone
> Raise these before starting each phase. Get answers before writing code.

---

## Phase 1 — Core Setup

- [ ] **Q1** Do you want a monorepo (single root `package.json` with workspaces) or two separate repos (`/client` and `/server`)?
- [ ] **Q2** Should we use Docker + docker-compose for local PostgreSQL, or connect to an existing DB instance?
- [ ] **Q3** What Node.js version is on your machine? (`node -v`) — required to set `engines` in `package.json`.
- [ ] **Q4** For image uploads, start with local `/uploads` folder or directly integrate AWS S3/Cloudinary from day one?
- [ ] **Q5** Do you want email verification on register (nodemailer OTP), or skip for now and add later?

---

## Phase 2 — Auth & Users

- [ ] **Q6** Should Google OAuth (Sign in with Google) be included in Phase 1, or Phase 4 polish?
- [ ] **Q7** Should the admin account be seeded via a migration script, or created via a separate `/admin/setup` route?
- [ ] **Q8** "First Citizen" points — is the earn rate fixed (e.g. 1 point per ₹100 spent) or configurable per product/category?

---

## Phase 3 — Payments

- [ ] **Q9** Do you have a Razorpay test account? Do you have `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` ready?
- [ ] **Q10** Should Cash on Delivery (COD) be handled as a payment method in the DB, or is it Razorpay-only for now?
- [ ] **Q11** For Razorpay webhook, which public URL should be used during development — ngrok tunnel, or skip webhook and use client-side verification only?

---

## Phase 4 — Products & Catalog

- [ ] **Q12** Will products be imported via CSV/Excel seed data, or entered manually through the Admin panel only?
- [ ] **Q13** Maximum number of images per product? (Affects multer config and UI gallery size)
- [ ] **Q14** Should size charts be per-product (stored in DB as JSON) or global per-category (e.g. one chart for all Tops)?
- [ ] **Q15** Should out-of-stock products be hidden from listing or shown with an "Out of Stock" badge?

---

## Phase 5 — Orders & Checkout

- [ ] **Q16** What is the shipping charge logic? Flat ₹99? Free above ₹999? Per-pincode? Per-brand?
- [ ] **Q17** Should users be able to return individual items from an order, or only cancel the whole order before dispatch?
- [ ] **Q18** Is GST/tax calculation needed on the invoice? Fixed rate or per-category rate?

---

## Phase 6 — Admin

- [ ] **Q19** Should the Admin panel live on the same domain (`/admin`) or a separate subdomain/port?
- [ ] **Q20** Do you need a rich-text editor (e.g. TipTap) for product descriptions, or plain `<textarea>` is fine?
- [ ] **Q21** Should admins be able to create other admins, or is there only one super-admin?

---

## Phase 7 — Deployment

- [ ] **Q22** Target deployment platform? (Vercel + Railway, AWS EC2, VPS, other)
- [ ] **Q23** Will you use a custom domain? SSL via Let's Encrypt or managed?
- [ ] **Q24** Do you need staging vs production environment separation from the start?

---

## Design & UX

- [ ] **Q25** Should we follow shoppersstop.com's layout closely (pixel-faithful clone), or is it inspiration-only with creative freedom?
- [ ] **Q26** Mobile-first or desktop-first implementation priority?
- [ ] **Q27** Do you need RTL (right-to-left) language support at any point?
- [ ] **Q28** Accessibility level target — WCAG AA or best-effort?

---

## Out-of-Scope Confirmation (answer YES/NO)

| Feature | In Scope? |
|---------|-----------|
| Live chat / customer support widget | ❓ |
| Product comparison page | ❓ |
| Gift cards | ❓ |
| Affiliate / referral program | ❓ |
| Multi-language (Hindi, etc.) | ❓ |
| Push notifications (FCM) | ❓ |
| Vendor / seller portal | ❓ |
| AR try-on (beauty/accessories) | ❓ |

---

*Fill answers here and share before each Claude session to avoid rework.*
