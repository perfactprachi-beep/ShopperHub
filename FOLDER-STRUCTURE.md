# FOLDER STRUCTURE — Shoppers Stop Clone
> Every file and folder explained. Create this structure before writing any code.

```
shoppersstop-clone/
│
├── .gitignore
├── .env.example                        # root-level placeholder (points to client + server)
├── package.json                        # monorepo workspaces root
├── README.md
│
├── docs/                               # 📁 project documentation
│   ├── MASTER-PROMPT.md
│   ├── QUESTIONS.md
│   ├── TODO.md
│   ├── SKILLS.md
│   ├── FOLDER-STRUCTURE.md
│   └── DESIGN.md
│
├── client/                             # ─── REACT FRONTEND ───────────────────────
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env                            # VITE_API_BASE, VITE_RAZORPAY_KEY_ID
│   ├── .env.example
│   │
│   └── src/
│       ├── main.jsx                    # ReactDOM.createRoot entry
│       ├── App.jsx                     # Router + layout shell
│       │
│       ├── api/                        # ── Axios layer ──────────────────────────
│       │   ├── axios.js                # base instance + interceptors (token attach, refresh)
│       │   ├── authApi.js              # login, register, logout, refresh
│       │   ├── productsApi.js          # list, detail, search
│       │   ├── cartApi.js
│       │   ├── wishlistApi.js
│       │   ├── ordersApi.js
│       │   ├── accountApi.js
│       │   ├── reviewsApi.js
│       │   ├── couponsApi.js
│       │   ├── paymentsApi.js
│       │   └── adminApi.js             # all /admin/* calls
│       │
│       ├── store/                      # ── Zustand stores ───────────────────────
│       │   ├── authStore.js            # user, accessToken, login(), logout()
│       │   ├── cartStore.js            # items[], addItem(), removeItem(), sync()
│       │   └── wishlistStore.js        # productIds[], toggle()
│       │
│       ├── hooks/                      # ── Custom hooks ─────────────────────────
│       │   ├── useDebounce.js          # debounce search input
│       │   ├── useLocalStorage.js
│       │   ├── useFetch.js             # generic data fetcher with loading/error
│       │   ├── useCart.js              # cart helpers wrapping cartStore
│       │   └── useAuth.js              # auth helpers wrapping authStore
│       │
│       ├── utils/                      # ── Pure helpers ─────────────────────────
│       │   ├── formatPrice.js          # ₹ formatting with INR locale
│       │   ├── slugify.js
│       │   ├── calcDiscount.js         # (basePrice, discountPct) → finalPrice
│       │   └── razorpayHelper.js       # load script, open modal
│       │
│       ├── components/                 # ── Shared / reusable UI ─────────────────
│       │   │
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Footer.jsx
│       │   │   └── AdminLayout.jsx     # sidebar + topbar for admin pages
│       │   │
│       │   ├── product/
│       │   │   ├── ProductCard.jsx
│       │   │   ├── ProductGrid.jsx
│       │   │   ├── FilterSidebar.jsx
│       │   │   ├── SortBar.jsx
│       │   │   ├── ImageGallery.jsx
│       │   │   ├── VariantPicker.jsx
│       │   │   └── RatingStars.jsx
│       │   │
│       │   ├── cart/
│       │   │   ├── CartDrawer.jsx
│       │   │   └── CartItem.jsx
│       │   │
│       │   ├── home/
│       │   │   ├── BannerCarousel.jsx
│       │   │   ├── CategoryCard.jsx
│       │   │   └── BrandStrip.jsx
│       │   │
│       │   ├── order/
│       │   │   ├── OrderStatusStepper.jsx
│       │   │   └── OrderCard.jsx
│       │   │
│       │   ├── address/
│       │   │   └── AddressForm.jsx
│       │   │
│       │   ├── ui/                     # atomic UI primitives
│       │   │   ├── Badge.jsx
│       │   │   ├── Chip.jsx
│       │   │   ├── Toast.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Spinner.jsx
│       │   │   ├── Skeleton.jsx
│       │   │   └── Button.jsx
│       │   │
│       │   └── guards/
│       │       ├── ProtectedRoute.jsx  # redirect to /login if not authed
│       │       └── AdminRoute.jsx      # redirect if not admin
│       │
│       └── pages/                      # ── Route-level pages (lazy loaded) ──────
│           │
│           ├── Home.jsx                # /
│           ├── CategoryPage.jsx        # /category/:slug
│           ├── BrandPage.jsx           # /brand/:slug
│           ├── ProductDetail.jsx       # /product/:slug
│           ├── SearchPage.jsx          # /search?q=
│           ├── OffersPage.jsx          # /offers
│           ├── LoginPage.jsx           # /login
│           ├── RegisterPage.jsx        # /register
│           ├── CartPage.jsx            # /cart
│           ├── CheckoutPage.jsx        # /checkout
│           ├── OrdersPage.jsx          # /orders
│           ├── OrderDetailPage.jsx     # /orders/:id
│           ├── WishlistPage.jsx        # /wishlist
│           ├── AccountPage.jsx         # /account
│           ├── NotFoundPage.jsx        # *
│           │
│           └── admin/
│               ├── AdminDashboard.jsx  # /admin
│               ├── AdminProducts.jsx   # /admin/products
│               ├── AdminCategories.jsx # /admin/categories
│               ├── AdminBrands.jsx     # /admin/brands
│               ├── AdminOrders.jsx     # /admin/orders
│               ├── AdminCoupons.jsx    # /admin/coupons
│               ├── AdminBanners.jsx    # /admin/banners
│               └── AdminUsers.jsx      # /admin/users
│
└── server/                             # ─── NODE/EXPRESS BACKEND ─────────────────
    ├── server.js                       # entry: http.createServer(app)
    ├── package.json
    ├── .env
    ├── .env.example
    │
    ├── uploads/                        # multer destination (git-ignored)
    │   └── .gitkeep
    │
    └── src/
        ├── app.js                      # express(), middleware, routes, errorHandler
        │
        ├── db/
        │   ├── pool.js                 # new Pool({ connectionString })
        │   ├── migrate.js              # run schema SQL on startup (dev only)
        │   ├── seed.js                 # seed categories, brands, admin user
        │   └── queries/
        │       ├── users.js
        │       ├── products.js
        │       ├── categories.js
        │       ├── brands.js
        │       ├── cart.js
        │       ├── wishlist.js
        │       ├── orders.js
        │       ├── reviews.js
        │       ├── coupons.js
        │       ├── banners.js
        │       └── notifications.js
        │
        ├── middleware/
        │   ├── authGuard.js            # verifyJWT → req.user
        │   ├── adminGuard.js           # req.user.role === 'admin'
        │   ├── validate.js             # Joi schema validator factory
        │   ├── upload.js               # multer config (diskStorage)
        │   └── errorHandler.js         # global error → { success:false, message }
        │
        ├── routes/
        │   ├── auth.routes.js
        │   ├── products.routes.js
        │   ├── categories.routes.js
        │   ├── brands.routes.js
        │   ├── cart.routes.js
        │   ├── wishlist.routes.js
        │   ├── orders.routes.js
        │   ├── reviews.routes.js
        │   ├── coupons.routes.js
        │   ├── payments.routes.js
        │   ├── account.routes.js
        │   ├── notifications.routes.js
        │   └── admin/
        │       ├── products.routes.js
        │       ├── categories.routes.js
        │       ├── brands.routes.js
        │       ├── orders.routes.js
        │       ├── coupons.routes.js
        │       ├── banners.routes.js
        │       ├── users.routes.js
        │       └── dashboard.routes.js
        │
        ├── controllers/
        │   ├── auth.controller.js
        │   ├── products.controller.js
        │   ├── cart.controller.js
        │   ├── wishlist.controller.js
        │   ├── orders.controller.js
        │   ├── reviews.controller.js
        │   ├── coupons.controller.js
        │   ├── payments.controller.js
        │   ├── account.controller.js
        │   ├── notifications.controller.js
        │   └── admin/
        │       ├── products.controller.js
        │       ├── orders.controller.js
        │       ├── dashboard.controller.js
        │       └── banners.controller.js
        │
        └── services/
            ├── auth.service.js         # token generation, password hashing
            ├── products.service.js     # filter/sort/paginate logic
            ├── cart.service.js         # merge guest cart on login
            ├── orders.service.js       # stock deduction, points award
            ├── payments.service.js     # Razorpay create + verify
            ├── coupons.service.js      # validate, apply, increment used_count
            └── notifications.service.js
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase `.jsx` | `ProductCard.jsx` |
| React pages | PascalCase + `Page.jsx` | `CheckoutPage.jsx` |
| Hooks | camelCase + `use` prefix | `useDebounce.js` |
| Stores | camelCase + `Store` | `cartStore.js` |
| API files | camelCase + `Api` | `productsApi.js` |
| Server routes | kebab + `.routes.js` | `auth.routes.js` |
| Server controllers | kebab + `.controller.js` | `orders.controller.js` |
| Server services | kebab + `.service.js` | `payments.service.js` |
| DB queries | singular noun | `products.js` |

---

## Import Order (enforce with ESLint)

```js
// 1. Node built-ins
import path from 'path'
// 2. External packages
import express from 'express'
// 3. Internal aliases / absolute
import { pool } from '../db/pool.js'
// 4. Relative imports
import { formatPrice } from './utils/formatPrice.js'
```
