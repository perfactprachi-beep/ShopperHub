import puppeteer from 'puppeteer';

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:10.5px;color:#1a1a1a;line-height:1.65;}
  .cover{display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;text-align:center;background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);color:white;page-break-after:always;padding:60px;}
  .cover-logo{font-size:48px;font-weight:900;letter-spacing:4px;color:#60a5fa;margin-bottom:8px;}
  .cover h1{font-size:28px;font-weight:700;margin-bottom:8px;color:#f1f5f9;}
  .cover h2{font-size:16px;font-weight:400;color:#94a3b8;margin-bottom:40px;}
  .cover-meta{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px 40px;font-size:12px;color:#cbd5e1;line-height:2.2;}
  .cover-badges{display:flex;gap:12px;margin-top:28px;flex-wrap:wrap;justify-content:center;}
  .badge{display:inline-block;padding:5px 16px;border-radius:20px;font-size:11px;font-weight:600;}
  .badge-blue{background:#3b82f6;color:white;}
  .badge-green{background:#10b981;color:white;}
  .badge-orange{background:#f59e0b;color:white;}
  .badge-red{background:#ef4444;color:white;}
  .toc-page{padding:50px 60px;page-break-after:always;}
  .toc-title{font-size:22px;font-weight:800;color:#0f172a;border-bottom:4px solid #3b82f6;padding-bottom:12px;margin-bottom:28px;}
  .toc-part{font-size:13px;font-weight:700;color:#1e40af;margin:20px 0 8px;text-transform:uppercase;letter-spacing:1px;}
  .toc-item{display:flex;justify-content:space-between;padding:5px 0 5px 16px;border-bottom:1px dotted #cbd5e1;color:#374151;font-size:10.5px;}
  .toc-item:hover{color:#1e40af;}
  .toc-item span{color:#6b7280;}
  .content{padding:40px 55px;}
  .part-divider{background:linear-gradient(135deg,#0f172a,#1e3a5f);color:white;padding:50px 55px;page-break-before:always;page-break-after:always;display:flex;flex-direction:column;justify-content:center;min-height:250px;}
  .part-divider .part-num{font-size:13px;color:#60a5fa;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;}
  .part-divider h2{font-size:28px;font-weight:800;color:white;margin-bottom:10px;}
  .part-divider p{font-size:12px;color:#94a3b8;max-width:600px;}
  h1.sec{font-size:18px;font-weight:800;color:#0f172a;border-bottom:3px solid #3b82f6;padding-bottom:8px;margin:36px 0 18px;page-break-before:always;}
  h1.sec:first-child{page-break-before:avoid;}
  h2.sub{font-size:13px;font-weight:700;color:#1e40af;margin:24px 0 10px;padding-left:8px;border-left:3px solid #60a5fa;}
  h3.sub2{font-size:11.5px;font-weight:700;color:#374151;margin:16px 0 8px;}
  p{margin-bottom:10px;}
  table{width:100%;border-collapse:collapse;margin:12px 0 20px;font-size:9.5px;}
  th{background:#1e40af;color:white;padding:7px 9px;text-align:left;font-weight:600;font-size:9px;}
  td{padding:6px 9px;border-bottom:1px solid #e2e8f0;vertical-align:top;}
  tr:nth-child(even) td{background:#f8fafc;}
  code{background:#f1f5f9;padding:1px 5px;border-radius:3px;font-family:'Courier New',monospace;font-size:9px;color:#be185d;}
  .arch{background:#0f172a;color:#e2e8f0;padding:18px 20px;border-radius:8px;font-family:'Courier New',monospace;font-size:9px;line-height:1.9;margin:14px 0;white-space:pre;}
  .phase{border:1px solid #e2e8f0;border-radius:8px;margin:18px 0;overflow:hidden;}
  .phase-header{background:#1e40af;color:white;padding:10px 16px;font-weight:700;font-size:11px;}
  .phase-body{padding:14px 16px;}
  .phase-row{display:flex;gap:8px;margin-bottom:7px;font-size:9.5px;}
  .phase-label{font-weight:700;color:#1e40af;min-width:130px;flex-shrink:0;}
  .ok{color:#16a34a;font-weight:700;}
  .warn{color:#d97706;font-weight:700;}
  .err{color:#dc2626;font-weight:700;}
  .tip{color:#2563eb;font-weight:700;}
  .score-table th{background:#0f172a;}
  .high{background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:600;}
  .med{background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:600;}
  .low{background:#dcfce7;color:#166534;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:600;}
  .exec{background:#f0f9ff;border:2px solid #3b82f6;border-radius:12px;padding:24px 28px;margin:20px 0;}
  .exec h3{font-size:15px;font-weight:800;color:#0f172a;margin-bottom:14px;}
  .exec-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .exec-card{background:white;border:1px solid #e2e8f0;border-radius:8px;padding:14px;}
  .exec-card h4{font-size:11px;font-weight:700;margin-bottom:8px;}
  .exec-card.green h4{color:#16a34a;}
  .exec-card.red h4{color:#dc2626;}
  .exec-card.blue h4{color:#1e40af;}
  .exec-card li{font-size:9.5px;margin-bottom:4px;padding-left:14px;position:relative;}
  .exec-card li::before{content:'→';position:absolute;left:0;color:#6b7280;}
  ul{padding-left:18px;margin-bottom:10px;}
  li{margin-bottom:4px;font-size:10px;}
</style>
</head>
<body>

<!-- ══════════ COVER ══════════ -->
<div class="cover">
  <div class="cover-logo">ShopperHub</div>
  <h1>Master Technical Document</h1>
  <h2>Software Requirements · Architecture Review · Workflow Documentation</h2>
  <div class="cover-meta">
    <div><strong>Version:</strong> 2.0 &nbsp;|&nbsp; <strong>Date:</strong> May 2026 &nbsp;|&nbsp; <strong>Status:</strong> Draft — Pre-Production</div>
    <div><strong>Repository:</strong> perfactprachi-beep/ShopperHub &nbsp;|&nbsp; <strong>Branch:</strong> main</div>
    <div><strong>Prepared by:</strong> Principal Software Architect &nbsp;|&nbsp; <strong>Classification:</strong> Confidential</div>
    <div><strong>Stack:</strong> React 18 · Node.js/Express 5 · PostgreSQL · Razorpay · Fast2SMS · Twilio</div>
  </div>
  <div class="cover-badges">
    <span class="badge badge-blue">Part 1 · SRD</span>
    <span class="badge badge-green">Part 2 · Architecture Review</span>
    <span class="badge badge-orange">Part 3 · Workflow Docs</span>
    <span class="badge badge-red">68 FR · 21 NFR · 10 Phases</span>
  </div>
</div>

<!-- ══════════ TOC ══════════ -->
<div class="toc-page">
  <div class="toc-title">Table of Contents</div>
  <div class="toc-part">Part 1 — Software Requirements Document</div>
  <div class="toc-item"><span>1.1 Project Overview</span><span>4</span></div>
  <div class="toc-item"><span>1.2 Functional Requirements</span><span>5</span></div>
  <div class="toc-item"><span>1.3 Non-Functional Requirements</span><span>9</span></div>
  <div class="toc-item"><span>1.4 Data Requirements</span><span>11</span></div>
  <div class="toc-item"><span>1.5 User Roles & Permissions</span><span>13</span></div>
  <div class="toc-item"><span>1.6 API Interface Requirements</span><span>14</span></div>
  <div class="toc-item"><span>1.7 Assumptions & Constraints</span><span>16</span></div>
  <div class="toc-item"><span>1.8 Glossary</span><span>17</span></div>
  <div class="toc-part">Part 2 — Architecture & Code Review</div>
  <div class="toc-item"><span>2.1 Architecture Assessment</span><span>18</span></div>
  <div class="toc-item"><span>2.2 Code Quality Review</span><span>19</span></div>
  <div class="toc-item"><span>2.3 Security Audit</span><span>20</span></div>
  <div class="toc-item"><span>2.4 Performance Analysis</span><span>21</span></div>
  <div class="toc-item"><span>2.5 Critical Gaps</span><span>21</span></div>
  <div class="toc-item"><span>2.6 Review Scorecard</span><span>22</span></div>
  <div class="toc-item"><span>2.7 Top 5 Priority Fixes</span><span>22</span></div>
  <div class="toc-part">Part 3 — Complete E-Commerce Workflow</div>
  <div class="toc-item"><span>3.1 System Workflow Overview</span><span>23</span></div>
  <div class="toc-item"><span>3.2 Phase-by-Phase Workflow (10 Phases)</span><span>24</span></div>
  <div class="toc-item"><span>3.3 Stock Management Decision Tree</span><span>30</span></div>
  <div class="toc-item"><span>3.4 Transaction Safety Map</span><span>31</span></div>
  <div class="toc-item"><span>3.5 Data Flow Diagrams</span><span>32</span></div>
  <div class="toc-item"><span>Executive Summary</span><span>33</span></div>
</div>

<!-- ══════════ PART 1 DIVIDER ══════════ -->
<div class="part-divider">
  <div class="part-num">Part 1</div>
  <h2>Software Requirements Document</h2>
  <p>Complete functional and non-functional requirements derived from source code analysis. Covers all modules including product management, inventory, cart, orders, payments, loyalty points, and admin operations.</p>
</div>

<div class="content">

<!-- 1.1 -->
<h1 class="sec" style="page-break-before:avoid;">1.1 Project Overview</h1>
<h2 class="sub">Project Name &amp; Purpose</h2>
<p><strong>ShopperHub</strong> is a full-stack, multi-category fashion and lifestyle e-commerce platform modelled after ShoppersStop. It enables customers to browse products across categories (Men, Women, Kids, Beauty, Luxe, Home), manage carts and wishlists, checkout via Razorpay online payment or Cash on Delivery, track orders, and earn/redeem loyalty points. Administrators manage the full product catalogue, inventory, orders, banners, coupons, CMS content, delivery configuration, and store pickup operations through a dedicated admin panel.</p>

<h2 class="sub">Tech Stack</h2>
<table>
<tr><th>Layer</th><th>Technology</th><th>Version</th><th>Notes</th></tr>
<tr><td>Frontend</td><td>React + Vite</td><td>18.3 / 5.4</td><td>SPA, lazy-loaded routes, PWA-enabled</td></tr>
<tr><td>State Management</td><td>Zustand</td><td>4.5</td><td>Auth, cart, wishlist, toast stores</td></tr>
<tr><td>Styling</td><td>Tailwind CSS</td><td>3.4</td><td>Utility-first; custom config</td></tr>
<tr><td>Routing</td><td>React Router</td><td>v6.23</td><td>Nested routes, ProtectedRoute guard</td></tr>
<tr><td>Backend</td><td>Node.js + Express</td><td>22 / 5.0</td><td>ESM modules throughout</td></tr>
<tr><td>Database</td><td>PostgreSQL</td><td>Latest</td><td>Raw SQL via pg.Pool; port 5433</td></tr>
<tr><td>Auth</td><td>JWT + bcrypt</td><td>9.0 / 5.1</td><td>Access + refresh tokens; httpOnly cookies</td></tr>
<tr><td>Payments</td><td>Razorpay</td><td>2.9</td><td>Order create + HMAC verification</td></tr>
<tr><td>SMS</td><td>Fast2SMS + Twilio</td><td>—</td><td>India (+91) vs international routing</td></tr>
<tr><td>File Processing</td><td>Multer + Sharp</td><td>—</td><td>Upload + resize images; local /uploads</td></tr>
<tr><td>Security</td><td>Helmet + cors + rate-limit</td><td>7.1</td><td>CSP, CORS, 1000 req/15min global limit</td></tr>
<tr><td>PWA</td><td>Vite PWA + Workbox</td><td>—</td><td>Offline caching for assets &amp; fonts</td></tr>
</table>

<h2 class="sub">Architecture Pattern</h2>
<p><strong>Layered Monolith</strong> — Frontend SPA served separately from backend API. Backend follows strict layering: <code>Routes → Controllers → Services/Queries → Database</code>. No microservices; single PostgreSQL instance. Horizontally scalable via stateless JWT auth, but local file storage is a current scaling blocker.</p>

<!-- 1.2 -->
<h1 class="sec">1.2 Functional Requirements</h1>

<h2 class="sub">Authentication Module</h2>
<table>
<tr><th>ID</th><th>Description</th><th>Input</th><th>Output</th><th>Business Logic</th></tr>
<tr><td>FR-001</td><td>User Registration</td><td>full_name, email, phone, password</td><td>JWT access token + user object</td><td>bcrypt hash (10 rounds); issue access + refresh JWT; set httpOnly cookie</td></tr>
<tr><td>FR-002</td><td>User Login</td><td>email, password</td><td>JWT tokens + user</td><td>Verify bcrypt hash; rate-limited 10 req/min via authLimiter</td></tr>
<tr><td>FR-003</td><td>Token Refresh</td><td>Refresh token (httpOnly cookie)</td><td>New access token</td><td>Verify refresh JWT secret; issue new short-lived access token</td></tr>
<tr><td>FR-004</td><td>Logout</td><td>Bearer token</td><td>Success message</td><td>Clear cookie; note: no server-side revocation store</td></tr>
<tr><td>FR-005</td><td>OTP Send</td><td>phone number</td><td>OTP sent via SMS</td><td>Route: +91 → Fast2SMS; other → Twilio; 6-digit OTP</td></tr>
<tr><td>FR-006</td><td>OTP Verify</td><td>phone, OTP</td><td>Verified status</td><td>Time-limited OTP validation</td></tr>
<tr><td>FR-007</td><td>Admin Login</td><td>email, password</td><td>JWT with role=admin</td><td>Same flow as FR-002; adminGuard enforces role check on all /api/admin/* routes</td></tr>
</table>

<h2 class="sub">Product Management Module</h2>
<table>
<tr><th>ID</th><th>Description</th><th>Input</th><th>Output</th><th>Business Logic</th></tr>
<tr><td>FR-008</td><td>List Products (storefront)</td><td>category, brand, gender, minPrice, maxPrice, minDiscount, sort, page, limit</td><td>Paginated product list with total_count</td><td>Recursive CTE for subcategory inclusion; only status='active' products shown</td></tr>
<tr><td>FR-009</td><td>Product Detail</td><td>slug</td><td>Product + images + variants + attributes</td><td>Three parallel queries; only active products returned</td></tr>
<tr><td>FR-010</td><td>Search Products</td><td>q (query string)</td><td>Ranked product list</td><td>PostgreSQL full-text <code>tsvector</code> + <code>ts_rank</code>; ILIKE fallback on brand/category name</td></tr>
<tr><td>FR-011</td><td>Sort Products</td><td>sort param</td><td>Ordered list</td><td>Enum: price_asc, price_desc, newest, discount, random (RANDOM())</td></tr>
<tr><td>FR-012</td><td>Admin: Create Product</td><td>title, slug, brand_id, category_id, description, gender, base_price, discount_pct, stock, status, is_deal, is_returnable + images</td><td>Created product</td><td>Images uploaded via Multer; processed by Sharp; stored in /uploads; first image set as primary</td></tr>
<tr><td>FR-013</td><td>Admin: Update Product</td><td>id + product fields</td><td>Updated product</td><td>Full field replacement; returns 404 if not found</td></tr>
<tr><td>FR-014</td><td>Admin: Soft-Delete Product</td><td>id</td><td>Success</td><td>Sets status='inactive'; product removed from storefront immediately</td></tr>
<tr><td>FR-015</td><td>Admin: Bulk Image Fill</td><td>— (none)</td><td>Count of filled products</td><td>Finds active products with no images; assigns placeholder via <code>getProductPlaceholder()</code></td></tr>
</table>

<h2 class="sub">Variant &amp; Inventory Management Module</h2>
<table>
<tr><th>ID</th><th>Description</th><th>Input</th><th>Output</th><th>Business Logic</th></tr>
<tr><td>FR-016</td><td>Add Product Variant</td><td>product_id, size, color, sku, stock, extra_price</td><td>Created variant</td><td>Each variant has independent stock; no auto-creation of inventory row</td></tr>
<tr><td>FR-017</td><td>Update Variant</td><td>variant_id + fields</td><td>Updated variant</td><td>Full replacement of size, color, sku, stock, extra_price</td></tr>
<tr><td>FR-018</td><td>Delete Variant</td><td>variant_id</td><td>Success</td><td>Hard delete; cascades via FK constraints</td></tr>
<tr><td>FR-019</td><td>Set Variant Stock (Inventory Module)</td><td>variantId, stock_quantity, low_stock_threshold, notes</td><td>Inventory record + updated variant</td><td><code>setVariantStock()</code>: upserts inventory row; updates product_variants.stock atomically; creates inventory log</td></tr>
<tr><td>FR-020</td><td>Adjust Stock (delta)</td><td>inventory_id, quantity_change, action_type, notes</td><td>Updated inventory</td><td>Adds/subtracts from current stock; logs adjustment; syncs product_variants</td></tr>
<tr><td>FR-021</td><td>Bulk Stock Update</td><td>updates[] array of {id, stock_quantity}</td><td>Updated records</td><td>Sequential updates; no transaction wrapper — partial failure leaves inconsistent state</td></tr>
<tr><td>FR-022</td><td>Low Stock Alert List</td><td>threshold, page, limit</td><td>Variants below threshold</td><td>Compares inventory.stock_quantity &lt; low_stock_threshold</td></tr>
<tr><td>FR-023</td><td>Warehouse CRUD</td><td>name, location, manager_name, contact_number</td><td>Warehouse record</td><td>Soft-delete (is_active=false); inventory items remain orphaned</td></tr>
<tr><td>FR-024</td><td>Inventory Dashboard Stats</td><td>—</td><td>total_products, total_warehouses, in_stock, low_stock, out_of_stock counts</td><td>Parallel queries across warehouse + inventory + product_variants tables</td></tr>
<tr><td>FR-025</td><td>Inventory Logs</td><td>page, limit, filters</td><td>Paginated audit log</td><td>Types: order_deduction, return_restock, manual_adjustment, variant_stock_set</td></tr>
</table>

<h2 class="sub">Cart Management Module</h2>
<table>
<tr><th>ID</th><th>Description</th><th>Input</th><th>Output</th><th>Business Logic</th></tr>
<tr><td>FR-026</td><td>View Cart</td><td>userId (from JWT)</td><td>items[], subtotal, itemCount</td><td>JOIN product/variant/image; <code>buildResponse()</code> computes lineTotal server-side</td></tr>
<tr><td>FR-027</td><td>Add to Cart</td><td>productId or variantId, quantity</td><td>Updated cart</td><td>If no variantId: find/create default variant (null size/color); stock check before add; UPSERT on conflict</td></tr>
<tr><td>FR-028</td><td>Update Cart Quantity</td><td>itemId, quantity</td><td>Updated cart</td><td>quantity must be ≥ 1; ownership validated (user_id match)</td></tr>
<tr><td>FR-029</td><td>Remove Cart Item</td><td>itemId</td><td>Updated cart</td><td>Hard delete; ownership validated</td></tr>
<tr><td>FR-030</td><td>Clear Cart</td><td>userId</td><td>Empty cart</td><td>Auto-triggered inside <code>fulfillOrder()</code> transaction after successful order</td></tr>
<tr><td>FR-031</td><td>Guest Cart Merge</td><td>guestItems[] array (variantId, quantity)</td><td>Merged DB cart</td><td>On login: client sends localStorage cart items; server upserts each into DB cart</td></tr>
</table>

<h2 class="sub">Order Lifecycle Module</h2>
<table>
<tr><th>ID</th><th>Description</th><th>Input</th><th>Output</th><th>Business Logic</th></tr>
<tr><td>FR-032</td><td>Create Razorpay Order</td><td>addressId, couponCode, usePoints, deliveryType</td><td>razorpayOrderId, amount, keyId, subtotal, discount, shipping, total</td><td>Batch stock pre-check (ANY query); coupon validate; points cap 20%; <code>calcShipping()</code>; Razorpay API call</td></tr>
<tr><td>FR-033</td><td>Verify Payment &amp; Fulfill</td><td>razorpayOrderId, razorpayPaymentId, razorpaySignature, addressId, couponId, totals, deliveryType</td><td>orderId + success message</td><td>HMAC-SHA256 verify; calls <code>fulfillOrder()</code> atomic transaction; SMS confirmation</td></tr>
<tr><td>FR-034</td><td>Place COD Order</td><td>addressId, couponCode, usePoints, deliveryType, storeId</td><td>orderId + success message</td><td>Same as FR-032 without Razorpay; payment_status='pending'; direct fulfillment</td></tr>
<tr><td>FR-035</td><td>Order Fulfillment (atomic)</td><td>Full order data + items[]</td><td>Confirmed order record</td><td>BEGIN → INSERT orders → INSERT order_items → FOR UPDATE lock variants → validate stock ≥ qty → UPDATE stock → sync inventory → award points → mark coupon used → DELETE cart → COMMIT; ROLLBACK on any failure</td></tr>
<tr><td>FR-036</td><td>Cancel Order</td><td>orderId, userId</td><td>Cancelled order</td><td>Only status IN ('pending','confirmed'); transaction: set cancelled → restore variant stock → restore inventory → log return_restock → deduct earned points; COMMIT</td></tr>
<tr><td>FR-037</td><td>View Order History</td><td>userId, page, limit</td><td>Paginated orders with items (JSON_AGG)</td><td>Grouped by order; items aggregated per order in single query</td></tr>
<tr><td>FR-038</td><td>Order Detail</td><td>orderId</td><td>Order + items + address + store info</td><td>Ownership check (user_id = $2); includes store timing for pickup orders</td></tr>
<tr><td>FR-039</td><td>Admin: List All Orders</td><td>page, limit, status filter</td><td>Paginated orders with customer info</td><td>Joined with users; total_count via window function</td></tr>
<tr><td>FR-040</td><td>Admin: Update Order Status</td><td>orderId, status</td><td>Updated order + notification</td><td>Status transitions: confirmed → shipped → delivered; fires in-app notification</td></tr>
</table>

<h2 class="sub">Payment Integration Module</h2>
<table>
<tr><th>ID</th><th>Description</th><th>Input</th><th>Output</th><th>Business Logic</th></tr>
<tr><td>FR-041</td><td>List Payment Methods</td><td>—</td><td>Active payment methods</td><td>Public endpoint; admin-configurable via <code>payment_methods</code> table</td></tr>
<tr><td>FR-042</td><td>Razorpay Order Create</td><td>amount (₹), currency, receipt</td><td>Razorpay order object</td><td><code>Math.round(amount * 100)</code> converts to paise; <code>payment_capture: 1</code> for auto-capture</td></tr>
<tr><td>FR-043</td><td>Payment Signature Verify</td><td>orderId, paymentId, signature</td><td>Boolean valid/invalid</td><td>HMAC-SHA256: <code>orderId|paymentId</code> signed with RAZORPAY_KEY_SECRET; constant-time comparison</td></tr>
<tr><td>FR-044</td><td>Admin: Configure Payment Methods</td><td>method, is_active, display config</td><td>Updated config</td><td>Toggle Razorpay / COD availability for storefront</td></tr>
</table>

<h2 class="sub">Coupon &amp; Discount Engine</h2>
<table>
<tr><th>ID</th><th>Description</th><th>Input</th><th>Output</th><th>Business Logic</th></tr>
<tr><td>FR-045</td><td>Validate &amp; Apply Coupon</td><td>couponCode, subtotal, userId</td><td>{valid, discount, couponId, reason}</td><td>Chain: is_active → not expired → min_order met → per_user_limit not exceeded → global max_uses not exceeded → compute discount (flat or %)</td></tr>
<tr><td>FR-046</td><td>List Active Coupons</td><td>—</td><td>Public coupon list</td><td>Returns is_active + not expired coupons for storefront display</td></tr>
<tr><td>FR-047</td><td>Admin: Coupon CRUD</td><td>code, discount_type, discount_value, min_order, max_uses, per_user_limit, expires_at</td><td>Coupon record</td><td>Full CRUD; used_count tracked; unique code constraint</td></tr>
<tr><td>FR-048</td><td>Mark Coupon Used</td><td>couponId</td><td>Incremented used_count</td><td>Called inside <code>fulfillOrder()</code> transaction; atomically committed with order</td></tr>
</table>

<h2 class="sub">Loyalty Points (First Citizen Points)</h2>
<table>
<tr><th>ID</th><th>Description</th><th>Input</th><th>Output</th><th>Business Logic</th></tr>
<tr><td>FR-049</td><td>Earn Points on Order</td><td>order total</td><td>Points credited to user</td><td>1 point per ₹100 (floor); awarded inside <code>fulfillOrder()</code> transaction atomically</td></tr>
<tr><td>FR-050</td><td>Redeem Points at Checkout</td><td>usePoints flag, current points balance, subtotal</td><td>pointsDiscount amount</td><td>Cap: MIN(user_points, FLOOR((subtotal - coupon_discount) × 0.20)); 1 point = ₹1</td></tr>
<tr><td>FR-051</td><td>Deduct Points on Cancel</td><td>orderId, points_earned</td><td>Reduced balance</td><td>GREATEST(points - earned, 0) inside cancel transaction; prevents negative balance</td></tr>
<tr><td>FR-052</td><td>Points Balance</td><td>userId</td><td>first_citizen_points</td><td>Returned in user profile; non-negative guaranteed by DB constraint</td></tr>
</table>

<h2 class="sub">Storefront / Homepage &amp; Delivery</h2>
<table>
<tr><th>ID</th><th>Description</th><th>Input</th><th>Output</th><th>Business Logic</th></tr>
<tr><td>FR-053</td><td>Homepage Sections</td><td>—</td><td>Banners, featured products, categories, offers</td><td>Parallel DB queries; only active records returned</td></tr>
<tr><td>FR-054</td><td>Shipping Calculation</td><td>deliveryType, subtotal</td><td>Shipping amount (₹)</td><td>Standard: ₹0 if subtotal ≥ ₹999 else ₹99; Express: ₹199 flat; Store Pickup: ₹0</td></tr>
<tr><td>FR-055</td><td>Express Delivery Check</td><td>pincode</td><td>is_express, delivery_hrs</td><td>Lookup in <code>express_delivery_pincodes</code> table; returns availability flag</td></tr>
<tr><td>FR-056</td><td>Store Pickup</td><td>—</td><td>Active stores with address + timing</td><td>is_active=true stores only; returns timing for customer display</td></tr>
<tr><td>FR-057</td><td>Store Pickup PIN</td><td>orderId (store_pickup orders)</td><td>4-digit PIN</td><td>Generated at order creation: <code>Math.floor(1000 + Math.random() * 9000)</code></td></tr>
<tr><td>FR-058</td><td>CMS Pages</td><td>slug</td><td>Page content</td><td>Admin-managed; rendered at /pages/:slug on frontend</td></tr>
</table>

<h2 class="sub">Admin Dashboard Module</h2>
<table>
<tr><th>ID</th><th>Description</th><th>Input</th><th>Output</th><th>Business Logic</th></tr>
<tr><td>FR-059</td><td>Dashboard Stats</td><td>—</td><td>totalOrders, revenue, totalUsers, totalProducts, recentOrders[], salesByDay[]</td><td>6 parallel DB queries; 30-day rolling sales chart; only paid orders in revenue</td></tr>
<tr><td>FR-060</td><td>Banner CRUD</td><td>image (upload or URL), link, position</td><td>Banner record</td><td>Supports file upload OR URL; is_active toggleable</td></tr>
<tr><td>FR-061</td><td>Offer Management</td><td>title, discount_pct, target_type, target_id, expires_at</td><td>Offer record</td><td>Polymorphic target (product/category); shown on product detail page</td></tr>
<tr><td>FR-062</td><td>User Management</td><td>userId, is_active</td><td>Updated user</td><td>Cannot modify/delete admin accounts (protected by query WHERE role != 'admin')</td></tr>
<tr><td>FR-063</td><td>Notification Send</td><td>userId, message</td><td>Notification record</td><td>In-app; triggered on order status changes; fire-and-forget outside transaction</td></tr>
<tr><td>FR-064</td><td>Pickup Status Update</td><td>orderId, status</td><td>Updated pickup_status</td><td>FSM: pending → ready → collected → expired</td></tr>
</table>

<!-- 1.3 -->
<h1 class="sec">1.3 Non-Functional Requirements</h1>
<table>
<tr><th>ID</th><th>Category</th><th>Requirement</th><th>Acceptance Criteria</th></tr>
<tr><td>NFR-001</td><td>Security</td><td>Password hashing with bcrypt</td><td>Min 10 salt rounds; no plaintext passwords in DB or logs</td></tr>
<tr><td>NFR-002</td><td>Security</td><td>JWT token lifecycle management</td><td>Access tokens short-lived; refresh tokens in httpOnly, Secure, SameSite cookies</td></tr>
<tr><td>NFR-003</td><td>Security</td><td>Content Security Policy</td><td>Helmet CSP allowlist: only Razorpay, Google Fonts, and self; no wildcard sources</td></tr>
<tr><td>NFR-004</td><td>Security</td><td>Auth rate limiting</td><td>Max 10 requests/min/IP on all /api/auth/* routes</td></tr>
<tr><td>NFR-005</td><td>Security</td><td>Global rate limiting</td><td>Max 1000 requests/15min/IP across all API routes</td></tr>
<tr><td>NFR-006</td><td>Security</td><td>Payment signature verification</td><td>Every Razorpay payment verified server-side via HMAC-SHA256 before order fulfillment</td></tr>
<tr><td>NFR-007</td><td>Security</td><td>Admin role enforcement</td><td>All /api/admin/* routes require both authGuard (JWT) + adminGuard (role='admin')</td></tr>
<tr><td>NFR-008</td><td>Security</td><td>SQL injection prevention</td><td>100% parameterized queries via pg; no string interpolation in SQL</td></tr>
<tr><td>NFR-009</td><td>Performance</td><td>Response compression</td><td>All API responses gzip-compressed via compression middleware</td></tr>
<tr><td>NFR-010</td><td>Performance</td><td>DB connection pooling</td><td>Single pg.Pool shared across all requests; no per-request connection overhead</td></tr>
<tr><td>NFR-011</td><td>Performance</td><td>Batch stock pre-check</td><td>Stock validation uses single ANY($1) query — not N+1 — before order creation</td></tr>
<tr><td>NFR-012</td><td>Performance</td><td>Image optimization</td><td>All uploads processed by Sharp before storage; appropriate dimensions and quality</td></tr>
<tr><td>NFR-013</td><td>Reliability</td><td>DB connection resilience</td><td>connectDB() retries up to 5 times with exponential backoff (2s, 4s, 6s, 8s, 10s)</td></tr>
<tr><td>NFR-014</td><td>Reliability</td><td>Atomic order fulfillment</td><td>fulfillOrder() uses BEGIN/FOR UPDATE/COMMIT; full ROLLBACK on any failure</td></tr>
<tr><td>NFR-015</td><td>Reliability</td><td>Process crash prevention</td><td>unhandledRejection + uncaughtException handlers log and exit cleanly (code 1)</td></tr>
<tr><td>NFR-016</td><td>Scalability</td><td>Stateless authentication</td><td>JWT-based; no server-side session store; horizontal scaling possible</td></tr>
<tr><td>NFR-017</td><td>Scalability</td><td>12-factor config</td><td>All secrets and URLs via .env; no hardcoded values in source (post-remediation)</td></tr>
<tr><td>NFR-018</td><td>Scalability</td><td>Health &amp; readiness endpoints</td><td>/api/health (liveness) and /api/ready (DB ping) for orchestration probes</td></tr>
<tr><td>NFR-019</td><td>Maintainability</td><td>Layered architecture</td><td>Business logic in controllers/services only; no logic in route handlers or query files</td></tr>
<tr><td>NFR-020</td><td>Availability</td><td>PWA offline support</td><td>Workbox caches all static assets + Google Fonts; app shell available offline</td></tr>
<tr><td>NFR-021</td><td>Data Integrity</td><td>Non-negative stock guarantee</td><td>GREATEST(stock - qty, 0) on deduction; FOR UPDATE row lock prevents race conditions</td></tr>
</table>

<!-- 1.4 -->
<h1 class="sec">1.4 Data Requirements</h1>
<h2 class="sub">Core Entities</h2>
<table>
<tr><th>Entity / Table</th><th>Key Fields</th><th>Relationships</th><th>Constraints</th></tr>
<tr><td><code>users</code></td><td>id, full_name, email, phone, password_hash, role, first_citizen_points, is_active</td><td>→ orders, addresses, cart_items, wishlists, reviews</td><td>email UNIQUE; role ENUM(user/admin); points ≥ 0</td></tr>
<tr><td><code>products</code></td><td>id, title, slug, brand_id, category_id, sub_category_id, base_price, discount_pct, gender, stock, status, is_deal, is_returnable</td><td>→ product_variants, product_images, product_attributes; ← brands, categories</td><td>slug UNIQUE; status ENUM(active/inactive); stock fallback when no variants</td></tr>
<tr><td><code>product_variants</code></td><td>id, product_id, size, color, sku, stock, extra_price</td><td>→ cart_items, order_items, inventory</td><td>stock ≥ 0; default variant: size=NULL, color=NULL</td></tr>
<tr><td><code>product_images</code></td><td>id, product_id, url, is_primary, sort_order</td><td>← products</td><td>One primary per product enforced by app logic</td></tr>
<tr><td><code>product_attributes</code></td><td>id, product_id, label, value, sort_order, section</td><td>← products</td><td>section ENUM(highlights/specifications)</td></tr>
<tr><td><code>categories</code></td><td>id, name, slug, parent_id</td><td>self-referential parent/child</td><td>slug UNIQUE; recursive CTE used in product queries</td></tr>
<tr><td><code>brands</code></td><td>id, name, slug, logo_url</td><td>→ products</td><td>slug UNIQUE</td></tr>
<tr><td><code>cart_items</code></td><td>id, user_id, product_id, variant_id, quantity</td><td>← users, product_variants</td><td>UNIQUE(user_id, variant_id) for upsert logic</td></tr>
<tr><td><code>orders</code></td><td>id, user_id, address_id, coupon_id, subtotal, discount, shipping, total, points_earned, payment_method, payment_status, status, delivery_type, delivery_method, store_id, pickup_status, pickup_pin, expected_by, razorpay_order_id</td><td>← users, addresses; → order_items; ← coupons, stores</td><td>status ENUM; payment_status ENUM; delivery_type ENUM</td></tr>
<tr><td><code>order_items</code></td><td>id, order_id, product_id, variant_id, quantity, unit_price</td><td>← orders, products, product_variants</td><td>unit_price snapshot at purchase time</td></tr>
<tr><td><code>addresses</code></td><td>id, user_id, label, line1, line2, city, state, pincode, full_name, phone, is_deleted</td><td>← users</td><td>Soft-deleted; is_deleted=true never shown</td></tr>
<tr><td><code>coupons</code></td><td>id, code, discount_type, discount_value, min_order, max_uses, used_count, per_user_limit, expires_at, is_active</td><td>→ orders</td><td>code UNIQUE; used_count increments atomically</td></tr>
<tr><td><code>inventory</code></td><td>id, variant_id, warehouse_id, stock_quantity, low_stock_threshold</td><td>← product_variants, warehouses</td><td>NOT auto-created on variant add; manually registered via Inventory module</td></tr>
<tr><td><code>inventory_logs</code></td><td>id, inventory_id, action_type, quantity, notes, admin_id, created_at</td><td>← inventory</td><td>action_type ENUM(order_deduction/return_restock/manual_adjustment/variant_stock_set)</td></tr>
<tr><td><code>warehouses</code></td><td>id, name, location, manager_name, contact_number, is_active</td><td>→ inventory</td><td>Soft-deleted via is_active=false</td></tr>
<tr><td><code>stores</code></td><td>id, name, city, state, address, pincode, timing, is_active</td><td>→ orders (store_id)</td><td>Pickup locations only; separate from warehouses</td></tr>
<tr><td><code>banners</code></td><td>id, image_url, link, position, is_active</td><td>standalone</td><td>position for display ordering</td></tr>
<tr><td><code>offers</code></td><td>id, title, discount_pct, target_type, target_id, expires_at, is_active</td><td>polymorphic target</td><td>target_type ENUM(product/category)</td></tr>
<tr><td><code>notifications</code></td><td>id, user_id, message, read_at, created_at</td><td>← users</td><td>read_at=NULL means unread</td></tr>
<tr><td><code>reviews</code></td><td>id, user_id, product_id, rating, comment, created_at</td><td>← users, products</td><td>hasPurchasedProduct() guard; rating 1-5</td></tr>
<tr><td><code>pages</code></td><td>id, title, slug, content, is_active</td><td>standalone</td><td>slug UNIQUE; CMS content</td></tr>
<tr><td><code>payment_methods</code></td><td>id, method, is_active, display config</td><td>standalone</td><td>Admin-configured; controls storefront payment options</td></tr>
<tr><td><code>express_delivery_pincodes</code></td><td>pincode, city, is_express, delivery_hrs</td><td>standalone</td><td>PK = pincode (6 digits)</td></tr>
</table>

<h2 class="sub">Stock Source-of-Truth Rules (COALESCE Logic)</h2>
<table>
<tr><th>Scenario</th><th>Stock Source</th><th>Query Used</th></tr>
<tr><td>Product has variants</td><td>SUM(product_variants.stock)</td><td>COALESCE((SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id), p.stock)</td></tr>
<tr><td>Product has no variants</td><td>products.stock (fallback)</td><td>Same COALESCE — returns p.stock when subquery is NULL</td></tr>
<tr><td>Order fulfillment deduction</td><td>product_variants.stock (primary) + inventory.stock_quantity (synced)</td><td>FOR UPDATE lock → UPDATE product_variants → UPDATE inventory</td></tr>
<tr><td>Inventory module view</td><td>inventory.stock_quantity (display only)</td><td>LEFT JOIN — variant shown even without inventory record</td></tr>
</table>

<!-- 1.5 -->
<h1 class="sec">1.5 User Roles &amp; Permissions</h1>
<table>
<tr><th>Role</th><th>Module</th><th>Read</th><th>Write</th><th>Delete</th><th>Notes</th></tr>
<tr><td>Guest</td><td>Products / Search / Categories</td><td>✅</td><td>❌</td><td>❌</td><td>Browse-only</td></tr>
<tr><td>Guest</td><td>Cart</td><td>✅ (local)</td><td>✅ (localStorage)</td><td>✅ (local)</td><td>No DB cart; merged on login</td></tr>
<tr><td>Guest</td><td>Orders / Wishlist / Reviews</td><td>❌</td><td>❌</td><td>❌</td><td>Must register</td></tr>
<tr><td>Customer</td><td>Products / Search / Banners</td><td>✅</td><td>❌</td><td>❌</td><td>Storefront only</td></tr>
<tr><td>Customer</td><td>Cart (DB)</td><td>✅</td><td>✅</td><td>✅ own items</td><td>Authenticated; variant stock checked</td></tr>
<tr><td>Customer</td><td>Orders</td><td>✅ own</td><td>✅ (place)</td><td>✅ cancel (pending/confirmed)</td><td>Cannot view others' orders</td></tr>
<tr><td>Customer</td><td>Addresses</td><td>✅ own</td><td>✅</td><td>✅ (soft)</td><td>Soft-delete only</td></tr>
<tr><td>Customer</td><td>Reviews</td><td>✅</td><td>✅ (purchased)</td><td>❌</td><td>hasPurchasedProduct() gate</td></tr>
<tr><td>Customer</td><td>Loyalty Points</td><td>✅ own</td><td>System-managed</td><td>❌</td><td>Auto earn/deduct by system</td></tr>
<tr><td>Admin</td><td>All Admin Routes</td><td>✅</td><td>✅</td><td>✅</td><td>role='admin' enforced by adminGuard</td></tr>
<tr><td>Admin</td><td>User Management</td><td>✅</td><td>✅ (non-admin)</td><td>✅ (non-admin)</td><td>Cannot modify other admin accounts</td></tr>
<tr><td>Admin</td><td>Inventory / Warehouse</td><td>✅</td><td>✅</td><td>✅ (soft)</td><td>Full access; logs all changes</td></tr>
<tr><td>Admin</td><td>Order Status</td><td>✅</td><td>✅ (any status)</td><td>❌</td><td>No hard delete of orders</td></tr>
</table>

<!-- 1.6 -->
<h1 class="sec">1.6 API Interface Requirements</h1>
<h3 class="sub2">Base: http://localhost:5000/api &nbsp;|&nbsp; Envelope: { success, data?, message? }</h3>

<h2 class="sub">Auth, Products &amp; Cart</h2>
<table>
<tr><th>Method</th><th>Endpoint</th><th>Auth</th><th>Description</th></tr>
<tr><td>POST</td><td>/auth/register</td><td>None</td><td>Register user</td></tr>
<tr><td>POST</td><td>/auth/login</td><td>None</td><td>Login (rate-limited)</td></tr>
<tr><td>POST</td><td>/auth/refresh</td><td>Cookie</td><td>Refresh access token</td></tr>
<tr><td>POST</td><td>/auth/logout</td><td>Bearer</td><td>Logout</td></tr>
<tr><td>POST</td><td>/auth/send-otp</td><td>None</td><td>Send OTP via SMS</td></tr>
<tr><td>POST</td><td>/auth/verify-otp</td><td>None</td><td>Verify OTP</td></tr>
<tr><td>GET</td><td>/products</td><td>None</td><td>List with filters/sort/page</td></tr>
<tr><td>GET</td><td>/products/:slug</td><td>None</td><td>Product detail + variants + images + attrs</td></tr>
<tr><td>GET</td><td>/products/search?q=</td><td>None</td><td>Full-text search</td></tr>
<tr><td>GET</td><td>/cart</td><td>Bearer</td><td>View cart</td></tr>
<tr><td>POST</td><td>/cart</td><td>Bearer</td><td>Add item (productId or variantId)</td></tr>
<tr><td>PUT</td><td>/cart/:itemId</td><td>Bearer</td><td>Update quantity</td></tr>
<tr><td>DELETE</td><td>/cart/:itemId</td><td>Bearer</td><td>Remove item</td></tr>
<tr><td>POST</td><td>/cart/merge</td><td>Bearer</td><td>Merge guest cart on login</td></tr>
</table>

<h2 class="sub">Payments, Orders &amp; Account</h2>
<table>
<tr><th>Method</th><th>Endpoint</th><th>Auth</th><th>Description</th></tr>
<tr><td>GET</td><td>/payments/methods</td><td>None</td><td>List active payment methods</td></tr>
<tr><td>POST</td><td>/payments/create-order</td><td>Bearer</td><td>Create Razorpay order + pre-checks</td></tr>
<tr><td>POST</td><td>/payments/create-cod-order</td><td>Bearer</td><td>Place COD order + fulfill</td></tr>
<tr><td>POST</td><td>/payments/verify</td><td>Bearer</td><td>Verify Razorpay payment + fulfill order</td></tr>
<tr><td>GET</td><td>/payments/orders/:id</td><td>Bearer</td><td>Fetch order detail</td></tr>
<tr><td>GET</td><td>/orders</td><td>Bearer</td><td>Order history (paginated)</td></tr>
<tr><td>POST</td><td>/orders/:id/cancel</td><td>Bearer</td><td>Cancel order (pending/confirmed only)</td></tr>
<tr><td>GET</td><td>/account/profile</td><td>Bearer</td><td>User profile + points</td></tr>
<tr><td>GET</td><td>/account/addresses</td><td>Bearer</td><td>List active addresses</td></tr>
<tr><td>POST</td><td>/account/addresses</td><td>Bearer</td><td>Add address</td></tr>
<tr><td>PUT</td><td>/account/addresses/:id</td><td>Bearer</td><td>Update address</td></tr>
<tr><td>DELETE</td><td>/account/addresses/:id</td><td>Bearer</td><td>Soft-delete address</td></tr>
<tr><td>GET</td><td>/notifications</td><td>Bearer</td><td>List user notifications</td></tr>
<tr><td>PUT</td><td>/notifications/:id/read</td><td>Bearer</td><td>Mark notification read</td></tr>
</table>

<h2 class="sub">Admin Routes (Bearer + role=admin required)</h2>
<table>
<tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
<tr><td>GET</td><td>/admin/dashboard/stats</td><td>Dashboard KPIs + 30-day sales chart</td></tr>
<tr><td>GET/POST/PUT/DELETE</td><td>/admin/products</td><td>Product CRUD (images via Multer)</td></tr>
<tr><td>GET/POST/PUT/DELETE</td><td>/admin/products/:id/variants</td><td>Variant management</td></tr>
<tr><td>GET/POST/PUT/DELETE</td><td>/admin/products/:id/attributes</td><td>Product attributes</td></tr>
<tr><td>GET/POST/DELETE</td><td>/admin/products/:id/images</td><td>Image management</td></tr>
<tr><td>POST</td><td>/admin/products/fill-missing-images</td><td>Bulk placeholder image assignment</td></tr>
<tr><td>GET/POST/PUT/DELETE</td><td>/admin/categories</td><td>Category CRUD (hierarchical)</td></tr>
<tr><td>GET/POST/PUT/DELETE</td><td>/admin/brands</td><td>Brand CRUD (with logo upload)</td></tr>
<tr><td>GET/POST/PUT/DELETE</td><td>/admin/banners</td><td>Banner CRUD</td></tr>
<tr><td>GET/POST/PUT/DELETE</td><td>/admin/coupons</td><td>Coupon CRUD</td></tr>
<tr><td>GET/POST/PUT/DELETE</td><td>/admin/offers</td><td>Offer management</td></tr>
<tr><td>GET</td><td>/admin/orders</td><td>All orders with filters</td></tr>
<tr><td>PUT</td><td>/admin/orders/:id/status</td><td>Update order status</td></tr>
<tr><td>PUT</td><td>/admin/orders/:id/pickup-status</td><td>Update pickup FSM status</td></tr>
<tr><td>GET/PATCH/DELETE</td><td>/admin/users</td><td>User management</td></tr>
<tr><td>GET/POST/PUT/DELETE</td><td>/admin/payment-methods</td><td>Payment method config</td></tr>
<tr><td>GET/POST/PATCH/DELETE</td><td>/admin/delivery/stores</td><td>Store pickup management</td></tr>
<tr><td>GET/POST/PATCH/DELETE</td><td>/admin/delivery/pincodes</td><td>Express delivery pincodes</td></tr>
<tr><td>GET/POST/PUT/DELETE</td><td>/admin/pages</td><td>CMS page management</td></tr>
</table>

<h2 class="sub">Inventory Routes (Bearer + role=admin required)</h2>
<table>
<tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
<tr><td>GET</td><td>/inventory/dashboard/stats</td><td>Stock counts by status + warehouse</td></tr>
<tr><td>GET/POST/PUT/DELETE</td><td>/inventory/warehouses</td><td>Warehouse CRUD</td></tr>
<tr><td>GET/POST/PUT</td><td>/inventory/inventory</td><td>Inventory record CRUD</td></tr>
<tr><td>POST</td><td>/inventory/inventory/bulk-update</td><td>Bulk stock quantity update</td></tr>
<tr><td>POST</td><td>/inventory/inventory/:id/adjust</td><td>Stock delta adjustment with log</td></tr>
<tr><td>PUT</td><td>/inventory/variants/:variantId/stock</td><td>setVariantStock() — upserts inventory + syncs variant</td></tr>
<tr><td>GET</td><td>/inventory/low-stock</td><td>Low stock alert list</td></tr>
<tr><td>GET/POST</td><td>/inventory/logs</td><td>Inventory audit log</td></tr>
</table>

<!-- 1.7 -->
<h1 class="sec">1.7 Assumptions &amp; Constraints</h1>
<table>
<tr><th>ID</th><th>Type</th><th>Description</th></tr>
<tr><td>A-01</td><td>Assumption</td><td>Currency is INR exclusively; Razorpay amounts converted to paise (×100) via Math.round()</td></tr>
<tr><td>A-02</td><td>Assumption</td><td>Phone numbers with +91 prefix route to Fast2SMS; all others to Twilio</td></tr>
<tr><td>A-03</td><td>Assumption</td><td>Products with no variants use products.stock as fallback; COALESCE handles both cases</td></tr>
<tr><td>A-04</td><td>Assumption</td><td>Loyalty points never expire; permanent until redeemed or order cancelled</td></tr>
<tr><td>A-05</td><td>Assumption</td><td>A review can only be submitted after order.status = 'delivered'</td></tr>
<tr><td>A-06</td><td>Assumption</td><td>Store pickup and warehouses are separate concepts (stores table ≠ warehouses table)</td></tr>
<tr><td>A-07</td><td>Assumption</td><td>Image uploads are processed by Sharp and stored on local disk /uploads (no cloud storage)</td></tr>
<tr><td>C-01</td><td>Constraint</td><td>Inventory row is NOT auto-created when a variant is added via the Products tab — admin must manually register it in the Inventory module</td></tr>
<tr><td>C-02</td><td>Constraint</td><td>Guest cart relies on client-side localStorage only — no server-side stock validation until merge on login</td></tr>
<tr><td>C-03</td><td>Constraint</td><td>Bulk stock update (bulkUpdateInventoryStock) has no transaction wrapper — partial failure leaves inconsistent state</td></tr>
<tr><td>C-04</td><td>Constraint</td><td>No refresh token revocation store — logout does not truly invalidate tokens until natural expiry</td></tr>
<tr><td>C-05</td><td>Constraint</td><td>Local file storage blocks horizontal scaling — S3/CDN migration required for multi-server deployment</td></tr>
<tr><td>C-06</td><td>Constraint</td><td>No API versioning (/api/v1/) — breaking changes affect all clients immediately</td></tr>
<tr><td>C-07</td><td>Constraint</td><td>No automated test suite — all testing is manual; no CI/CD pipeline configured</td></tr>
<tr><td>C-08</td><td>Constraint</td><td>Migration scripts are numbered manually (migrate.js, migrate-phase5.js…) with no migration runner</td></tr>
<tr><td>C-09</td><td>Constraint</td><td>Razorpay only; no PayPal, UPI QR, or digital wallet support</td></tr>
<tr><td>C-10</td><td>Constraint</td><td>Store pickup PIN is random (not cryptographically secure); adequate for low-stakes use but not banking-grade</td></tr>
</table>

<!-- 1.8 -->
<h1 class="sec">1.8 Glossary</h1>
<table>
<tr><th>Term</th><th>Definition</th></tr>
<tr><td>SKU</td><td>Stock Keeping Unit — unique identifier per product variant (stored in product_variants.sku)</td></tr>
<tr><td>COALESCE Stock</td><td>SQL pattern used in product queries: COALESCE((SELECT SUM(variant.stock)...), product.stock) — returns variant sum if variants exist, otherwise falls back to product-level stock</td></tr>
<tr><td>First Citizen Points</td><td>Loyalty reward program; customers earn 1 point per ₹100 spent; redeemable at checkout (1 pt = ₹1); capped at 20% of post-coupon subtotal per order</td></tr>
<tr><td>setVariantStock()</td><td>Server function in inventory.js that upserts an inventory record for a variant AND updates product_variants.stock simultaneously — the canonical way to set stock via the Inventory module</td></tr>
<tr><td>fulfillOrder()</td><td>Atomic DB transaction function in orders.js that: inserts order, inserts items, locks variants (FOR UPDATE), validates stock, deducts stock, syncs inventory, awards points, marks coupon used, clears cart — all in one BEGIN/COMMIT block</td></tr>
<tr><td>authGuard</td><td>Express middleware that validates JWT Bearer token and attaches req.user; applied to all protected routes</td></tr>
<tr><td>adminGuard</td><td>Express middleware that enforces req.user.role === 'admin'; applied after authGuard on all /api/admin/* and /api/inventory/* routes</td></tr>
<tr><td>lineTotal</td><td>Cart item subtotal computed as unitPrice × quantity in the DB cart query; returned pre-computed in cart response</td></tr>
<tr><td>paise</td><td>Indian sub-unit of currency; 1 INR = 100 paise; Razorpay API requires all amounts in paise (Math.round(amount × 100))</td></tr>
<tr><td>Pickup PIN</td><td>4-digit random code generated at store-pickup order creation for collection</td></tr>
<tr><td>Soft Delete</td><td>Setting is_deleted=true (addresses) or is_active=false (warehouses) instead of removing the DB row</td></tr>
<tr><td>Default Variant</td><td>A product_variants row with size=NULL and color=NULL, auto-created by cart.controller.js when a product without explicit variants is added to cart</td></tr>
<tr><td>buildResponse()</td><td>Cart controller helper that computes subtotal and itemCount from raw cart items array; ensures consistent cart response shape</td></tr>
<tr><td>calcShipping()</td><td>Shared function in payments.controller.js; determines shipping cost from deliveryType and subtotal; single source of truth for shipping logic</td></tr>
</table>

</div><!-- end content -->

<!-- ══════════ PART 2 DIVIDER ══════════ -->
<div class="part-divider">
  <div class="part-num">Part 2</div>
  <h2>Architecture &amp; Code Review</h2>
  <p>Independent assessment of code quality, security posture, performance characteristics, and architectural integrity. Findings reference actual function names, file paths, and SQL patterns found in the source code.</p>
</div>

<div class="content">

<!-- 2.1 -->
<h1 class="sec" style="page-break-before:avoid;">2.1 Architecture Assessment</h1>
<table>
<tr><th>Dimension</th><th>Finding</th><th>Status</th></tr>
<tr><td>Pattern</td><td>Layered Monolith — React SPA + Express REST API. Clean separation of concerns.</td><td><span class="ok">✅ Appropriate</span></td></tr>
<tr><td>Layer Separation</td><td>Routes → Controllers → Queries/Services strictly followed. No business logic in route handlers.</td><td><span class="ok">✅ Clean</span></td></tr>
<tr><td>Admin Module</td><td>admin.routes.js is 566 lines with inline route handlers — no dedicated admin controllers. Untestable.</td><td><span class="warn">⚠️ God File</span></td></tr>
<tr><td>Coupling</td><td>Controllers are loosely coupled via function imports. DB pool is a shared singleton — acceptable.</td><td><span class="ok">✅ Acceptable</span></td></tr>
<tr><td>Reusability</td><td>calcShipping(), buildResponse(), getProductPlaceholder() are good shared helpers. More extraction needed.</td><td><span class="warn">⚠️ Partial</span></td></tr>
<tr><td>Config</td><td>All secrets via .env — 12-factor compliant. Health + readiness endpoints present.</td><td><span class="ok">✅ Good</span></td></tr>
<tr><td>Frontend Architecture</td><td>Zustand stores per concern (auth, cart, wishlist, UI). Lazy-loaded routes with Suspense. PWA-ready.</td><td><span class="ok">✅ Well structured</span></td></tr>
</table>

<!-- 2.2 -->
<h1 class="sec">2.2 Code Quality Review</h1>
<table>
<tr><th>Area</th><th>Observation</th><th>Status</th></tr>
<tr><td>Naming Conventions</td><td>Consistent camelCase throughout; descriptive function names (fulfillOrder, setVariantStock, buildResponse).</td><td><span class="ok">✅ Good</span></td></tr>
<tr><td>DRY Violations</td><td>Stock pre-check loop was duplicated in createOrder + createCodOrder (fixed). calcShipping defined once — good.</td><td><span class="warn">⚠️ Mostly fixed</span></td></tr>
<tr><td>Function Complexity</td><td>CheckoutPage.jsx ~889 lines; fulfillOrder() ~100 lines but justified as a transaction unit.</td><td><span class="warn">⚠️ CheckoutPage needs splitting</span></td></tr>
<tr><td>Dead Code</td><td>Old createOrder() / addOrderItems() / deductStock() / awardPoints() / markCouponUsed() functions in orders.js are superseded by fulfillOrder() but still exported. Unused.</td><td><span class="err">❌ Remove dead exports</span></td></tr>
<tr><td>Comments</td><td>Meaningful inline comments on complex logic (COALESCE, recursive CTE, FOR UPDATE). Not over-commented.</td><td><span class="ok">✅ Good</span></td></tr>
<tr><td>Console Logs</td><td>authGuard.js debug logs removed. Some [createOrder] logs remain — acceptable for dev, gate behind DEBUG env var for prod.</td><td><span class="warn">⚠️ Minor</span></td></tr>
<tr><td>Joi Usage</td><td>Joi installed but not used anywhere — no request body validation layer exists.</td><td><span class="err">❌ Critical gap</span></td></tr>
<tr><td>Magic Strings</td><td>'standard', 'express', 'store_pickup' delivery type strings used in 5+ places without constants.</td><td><span class="warn">⚠️ Extract constants</span></td></tr>
</table>

<!-- 2.3 -->
<h1 class="sec">2.3 Security Audit</h1>
<table>
<tr><th>Check</th><th>Finding</th><th>Status</th></tr>
<tr><td>Password Hashing</td><td>bcrypt with default rounds. No plaintext anywhere.</td><td><span class="ok">✅ Secure</span></td></tr>
<tr><td>JWT Implementation</td><td>Short-lived access tokens; refresh in httpOnly cookie. No revocation store.</td><td><span class="warn">⚠️ Logout gap</span></td></tr>
<tr><td>SQL Injection</td><td>100% parameterized queries. No string interpolation in SQL. Safe.</td><td><span class="ok">✅ Secure</span></td></tr>
<tr><td>Admin Authorization</td><td>authGuard + adminGuard applied at router level (router.use(authGuard, adminGuard)). All admin routes covered.</td><td><span class="ok">✅ Secure</span></td></tr>
<tr><td>Payment Security</td><td>HMAC-SHA256 signature verification server-side before any order fulfillment. Correct.</td><td><span class="ok">✅ Secure</span></td></tr>
<tr><td>Exposed Secrets (Historical)</td><td>Twilio SID + Fast2SMS key were in SMS-NOTIFICATION-GUIDE.md (commit a29ee3f). Scrubbed from history. CREDENTIALS MUST BE ROTATED.</td><td><span class="err">❌ Rotate immediately</span></td></tr>
<tr><td>CSP Headers</td><td>Helmet CSP configured with explicit allowlist — Razorpay + Google Fonts only.</td><td><span class="ok">✅ Secure</span></td></tr>
<tr><td>CORS</td><td>Allows CLIENT_URL + any localhost port in dev. Strict in production.</td><td><span class="ok">✅ Acceptable</span></td></tr>
<tr><td>Input Validation</td><td>No Joi schemas on any endpoint. Only ad-hoc checks (if !addressId). XSS risk from unvalidated string inputs.</td><td><span class="err">❌ Add validation</span></td></tr>
<tr><td>Address Ownership</td><td>Validated via array scan (addresses.find()) not DB query — inefficient but functionally correct.</td><td><span class="warn">⚠️ Use DB WHERE user_id=$1 AND id=$2</span></td></tr>
<tr><td>Rate Limiting</td><td>Auth: 10/min; Global: 1000/15min. In-memory store — resets on restart; Redis recommended for prod.</td><td><span class="warn">⚠️ Use Redis for prod</span></td></tr>
</table>

<!-- 2.4 -->
<h1 class="sec">2.4 Performance Analysis</h1>
<table>
<tr><th>Issue</th><th>Location</th><th>Impact</th><th>Status</th></tr>
<tr><td>N+1 Stock Pre-check (fixed)</td><td>payments.controller.js</td><td>Was: 1 query per cart item. Now: single ANY($1) batch query.</td><td><span class="ok">✅ Fixed</span></td></tr>
<tr><td>Stock loop in fulfillOrder()</td><td>orders.js fulfillOrder()</td><td>Still loops per item for FOR UPDATE lock — intentional (cannot batch row locks)</td><td><span class="ok">✅ Correct</span></td></tr>
<tr><td>RANDOM() sort</td><td>products.js getProducts()</td><td>ORDER BY RANDOM() is O(n log n) full table scan — disables index use</td><td><span class="warn">⚠️ Cache or precompute</span></td></tr>
<tr><td>No query indexes documented</td><td>All migration files</td><td>Missing indexes on: orders.user_id, cart_items.user_id, products.slug, product_variants.product_id</td><td><span class="err">❌ Add indexes</span></td></tr>
<tr><td>Razorpay singleton</td><td>payments.service.js getRazorpay()</td><td>New Razorpay instance created per call. Should be module-level singleton.</td><td><span class="warn">⚠️ Minor overhead</span></td></tr>
<tr><td>No caching</td><td>Public endpoints</td><td>Categories, banners, homepage data queried from DB on every request — cacheable.</td><td><span class="warn">⚠️ Add Redis cache</span></td></tr>
<tr><td>Parallel queries</td><td>getProductBySlug(), adminGetDashboardStats()</td><td>Promise.all() used correctly for independent queries.</td><td><span class="ok">✅ Good</span></td></tr>
</table>

<!-- 2.5 -->
<h1 class="sec">2.5 Critical Gaps Found</h1>
<table>
<tr><th>#</th><th>Gap</th><th>Location</th><th>Risk</th><th>Recommendation</th></tr>
<tr><td>1</td><td>Inventory row NOT auto-created on variant add</td><td>admin.routes.js POST /products/:id/variants</td><td><span class="high">HIGH</span></td><td>Add createInventory() call after addVariant() or add a DB trigger on product_variants INSERT</td></tr>
<tr><td>2</td><td>Guest cart has no server-side stock check</td><td>localStorage (client only)</td><td><span class="high">HIGH</span></td><td>Cart merge endpoint (POST /cart/merge) should validate stock per item before upserting</td></tr>
<tr><td>3</td><td>Bulk stock update has no transaction</td><td>inventory.js bulkUpdateInventoryStock()</td><td><span class="high">HIGH</span></td><td>Wrap in BEGIN/COMMIT; partial failure currently leaves inconsistent state</td></tr>
<tr><td>4</td><td>No Joi validation on any request body</td><td>All controllers</td><td><span class="high">HIGH</span></td><td>Add Joi schemas — library already installed; implement on checkout, auth, and admin routes first</td></tr>
<tr><td>5</td><td>Dead code in orders.js</td><td>orders.js lines 4-50</td><td><span class="med">MED</span></td><td>Remove createOrder(), addOrderItems(), deductStock(), awardPoints(), markCouponUsed() — all superseded by fulfillOrder()</td></tr>
<tr><td>6</td><td>Zero test coverage</td><td>Entire codebase</td><td><span class="high">HIGH</span></td><td>Start with: verifySignature(), validateCoupon(), calcShipping(), fulfillOrder() integration test</td></tr>
<tr><td>7</td><td>No missing index definitions</td><td>Migration files</td><td><span class="med">MED</span></td><td>Add: CREATE INDEX ON orders(user_id); CREATE INDEX ON cart_items(user_id); CREATE UNIQUE INDEX ON products(slug);</td></tr>
</table>

<!-- 2.6 -->
<h1 class="sec">2.6 Review Scorecard</h1>
<table class="score-table">
<tr><th>Area</th><th>Score (1–10)</th><th>Status</th><th>Priority</th></tr>
<tr><td>Architecture</td><td>7.5 / 10</td><td><span class="ok">✅ Good</span></td><td><span class="low">LOW</span></td></tr>
<tr><td>Code Quality</td><td>6.5 / 10</td><td><span class="warn">⚠️ Acceptable</span></td><td><span class="med">MEDIUM</span></td></tr>
<tr><td>Security</td><td>6.0 / 10</td><td><span class="warn">⚠️ Needs work</span></td><td><span class="high">HIGH</span></td></tr>
<tr><td>Performance</td><td>6.0 / 10</td><td><span class="warn">⚠️ Missing indexes/cache</span></td><td><span class="med">MEDIUM</span></td></tr>
<tr><td>Data Integrity</td><td>7.0 / 10</td><td><span class="ok">✅ Good (transaction fixed)</span></td><td><span class="med">MEDIUM</span></td></tr>
<tr><td>Error Handling</td><td>7.0 / 10</td><td><span class="ok">✅ Central handler + process guards</span></td><td><span class="low">LOW</span></td></tr>
<tr><td>Testing</td><td>1.0 / 10</td><td><span class="err">❌ Zero tests</span></td><td><span class="high">CRITICAL</span></td></tr>
<tr><td><strong>Overall</strong></td><td><strong>5.9 / 10</strong></td><td><strong>Pre-production MVP</strong></td><td><strong>Not production-ready</strong></td></tr>
</table>

<!-- 2.7 -->
<h1 class="sec">2.7 Top 5 Priority Fixes Before Production</h1>
<table>
<tr><th>#</th><th>Issue</th><th>Fix</th><th>Effort</th></tr>
<tr><td>1</td><td><span class="err">🔴 Rotate exposed credentials</span></td><td>Regenerate Twilio SID/auth token and Fast2SMS API key on their dashboards immediately. Update .env. The old credentials were in git commit a29ee3f and may have been scraped.</td><td>30 min</td></tr>
<tr><td>2</td><td><span class="err">🔴 Auto-create inventory on variant add</span></td><td>In admin.routes.js POST /products/:id/variants, after addVariant(), call createInventory({ variant_id: variant.id, stock_quantity: variant.stock }). This closes the gap between the Products tab and Inventory module.</td><td>1 hour</td></tr>
<tr><td>3</td><td><span class="err">🔴 Add Joi validation to all endpoints</span></td><td>Joi is installed. Add schemas for: register, login, createOrder, createCodOrder, addToCart, updateQty. Prevents invalid data reaching DB and closes XSS surface.</td><td>1 day</td></tr>
<tr><td>4</td><td><span class="err">🔴 Wrap bulk stock update in transaction</span></td><td>In inventory.js bulkUpdateInventoryStock(), wrap all updates in a single client.query('BEGIN') / COMMIT block. If any update fails, ROLLBACK to maintain consistency.</td><td>2 hours</td></tr>
<tr><td>5</td><td><span class="err">🔴 Add critical DB indexes</span></td><td>Run migration: CREATE INDEX ON orders(user_id); CREATE INDEX ON cart_items(user_id); CREATE INDEX ON product_variants(product_id); CREATE UNIQUE INDEX ON products(slug). Without these, queries degrade as data grows.</td><td>1 hour</td></tr>
</table>

</div>

<!-- ══════════ PART 3 DIVIDER ══════════ -->
<div class="part-divider">
  <div class="part-num">Part 3</div>
  <h2>Complete E-Commerce Workflow Documentation</h2>
  <p>End-to-end workflow covering all 10 operational phases for Admin, Customer, and Guest actors. Includes phase triggers, API calls, DB tables affected, business rules, and outcomes.</p>
</div>

<div class="content">

<!-- 3.1 -->
<h1 class="sec" style="page-break-before:avoid;">3.1 System Workflow Overview</h1>

<h2 class="sub">Admin Actor</h2>
<p>The admin accesses the platform at <code>/admin</code> and logs in using credentials verified against the users table (role='admin'). Once authenticated, the admin can manage the full product catalogue — creating products, adding size/color variants with stock levels, uploading images, and optionally registering those variants in the Inventory module (linked to a physical warehouse). The admin configures homepage banners, promotional offers, discount coupons, delivery options (express pincodes, store pickup locations), and CMS pages. When orders arrive, the admin reviews them on the Orders dashboard, updates status through the lifecycle (confirmed → shipped → delivered), and monitors inventory health via the Inventory Dashboard with low-stock alerts and audit logs.</p>

<h2 class="sub">Logged-in Customer Actor</h2>
<p>A registered customer authenticates via email/password or OTP. On login, any items in their localStorage guest cart are automatically merged into their DB cart. They browse products using category navigation, filters (price, brand, gender, discount), full-text search, and sorting. On the product detail page they select a size/color variant, check stock availability, and add to their DB cart. At checkout, they select a saved address (or add a new one), choose a delivery option (Standard, Express subject to pincode availability, or Store Pickup), optionally apply a coupon code, optionally redeem First Citizen loyalty points (up to 20% of subtotal), and proceed to pay via Razorpay (online) or COD. After payment, the order is atomically fulfilled, their cart is cleared, points are awarded, and an SMS confirmation is sent. They can track orders, view history, cancel eligible orders, and leave reviews on delivered products.</p>

<h2 class="sub">Guest Customer Actor</h2>
<p>A guest can browse the full product catalogue, view product details including pricing and availability, and add items to a local cart stored in their browser's localStorage. The app reads variant stock from the API for display purposes. No server-side stock reservation happens for guests. When the guest registers or logs in, their localStorage cart is sent to the POST /cart/merge endpoint, which upserts each item into the authenticated DB cart. From that point they follow the customer checkout flow.</p>

<!-- 3.2 -->
<h1 class="sec">3.2 Phase-by-Phase Workflow</h1>

<div class="phase">
<div class="phase-header">PHASE 1 — Product Creation (Admin)</div>
<div class="phase-body">
<div class="phase-row"><div class="phase-label">Actor:</div><div>Admin</div></div>
<div class="phase-row"><div class="phase-label">Trigger:</div><div>Admin clicks "Add Product" in Admin Panel → Products</div></div>
<div class="phase-row"><div class="phase-label">Steps:</div><div>1. Fill product form (title, brand, category, price, discount%, gender, description, status)<br/>2. Upload product images (Multer receives files; Sharp resizes/optimizes; saved to /uploads)<br/>3. Submit → POST /admin/products</div></div>
<div class="phase-row"><div class="phase-label">API Called:</div><div>POST /admin/products (multipart/form-data with images)</div></div>
<div class="phase-row"><div class="phase-label">DB Tables Affected:</div><div>products (INSERT), product_images (INSERT per file, first=primary)</div></div>
<div class="phase-row"><div class="phase-label">Business Rules:</div><div>slug must be unique; status defaults to 'active'; is_deal and is_returnable default to false/true</div></div>
<div class="phase-row"><div class="phase-label">Success Outcome:</div><div>Product visible in admin list; if status='active' immediately visible on storefront</div></div>
<div class="phase-row"><div class="phase-label">Failure Outcome:</div><div>Duplicate slug → DB unique constraint error → 500 (should be caught + 400)</div></div>
</div>
</div>

<div class="phase">
<div class="phase-header">PHASE 2 — Variant Addition & Stock Setup</div>
<div class="phase-body">
<div class="phase-row"><div class="phase-label">Actor:</div><div>Admin</div></div>
<div class="phase-row"><div class="phase-label">Trigger:</div><div>Admin opens product → Variants tab → "Add Variant"</div></div>
<div class="phase-row"><div class="phase-label">Steps:</div><div>1. Enter size, color, SKU, stock quantity, extra_price<br/>2. POST /admin/products/:id/variants<br/>3. Variant appears in variant list with stock count<br/>⚠️ NOTE: No inventory record is auto-created at this step</div></div>
<div class="phase-row"><div class="phase-label">API Called:</div><div>POST /admin/products/:id/variants</div></div>
<div class="phase-row"><div class="phase-label">DB Tables Affected:</div><div>product_variants (INSERT)</div></div>
<div class="phase-row"><div class="phase-label">Business Rules:</div><div>stock ≥ 0; extra_price added to base_price for final variant price; variant stock overrides products.stock in COALESCE queries</div></div>
<div class="phase-row"><div class="phase-label">Success Outcome:</div><div>Variant selectable on product detail page; stock shown to customers</div></div>
<div class="phase-row"><div class="phase-label">Failure Outcome:</div><div>Variant without inventory record — Inventory module shows it but cannot track warehouse location until Step 3</div></div>
</div>
</div>

<div class="phase">
<div class="phase-header">PHASE 3 — Inventory Module Registration</div>
<div class="phase-body">
<div class="phase-row"><div class="phase-label">Actor:</div><div>Admin</div></div>
<div class="phase-row"><div class="phase-label">Trigger:</div><div>Admin navigates to Inventory module → assigns variant to warehouse</div></div>
<div class="phase-row"><div class="phase-label">Steps:</div><div>1. Create warehouse if needed: POST /inventory/warehouses<br/>2. Register variant: POST /inventory/inventory {variant_id, warehouse_id, stock_quantity}<br/>OR use the faster: PUT /inventory/variants/:variantId/stock<br/>3. setVariantStock() upserts inventory row + updates product_variants.stock + creates inventory log</div></div>
<div class="phase-row"><div class="phase-label">API Called:</div><div>POST /inventory/warehouses; PUT /inventory/variants/:variantId/stock</div></div>
<div class="phase-row"><div class="phase-label">DB Tables Affected:</div><div>warehouses (INSERT), inventory (UPSERT), product_variants (UPDATE stock), inventory_logs (INSERT with action='variant_stock_set')</div></div>
<div class="phase-row"><div class="phase-label">Business Rules:</div><div>setVariantStock() is the authoritative function — it keeps both tables in sync; inventory.stock_quantity mirrors product_variants.stock after this call</div></div>
<div class="phase-row"><div class="phase-label">Success Outcome:</div><div>Variant appears in Inventory Dashboard; low-stock alerts now active; warehouse association visible</div></div>
<div class="phase-row"><div class="phase-label">Failure Outcome:</div><div>If skipped: variant tracked only in product_variants; inventory module shows it with no warehouse; low-stock alerts inactive for this variant</div></div>
</div>
</div>

<div class="phase">
<div class="phase-header">PHASE 4 — Customer Browses Storefront</div>
<div class="phase-body">
<div class="phase-row"><div class="phase-label">Actor:</div><div>Guest or Customer</div></div>
<div class="phase-row"><div class="phase-label">Trigger:</div><div>User opens app at http://localhost:5173</div></div>
<div class="phase-row"><div class="phase-label">Steps:</div><div>1. Homepage loads → parallel API calls: banners, featured products, categories, offers<br/>2. User navigates category (e.g., /women) → GET /products?gender=women&amp;category=women<br/>3. Recursive CTE resolves parent category → all subcategory products included<br/>4. User applies filters (price, brand, discount) → query params updated → new API call<br/>5. User clicks product → GET /products/:slug → images + variants + attributes loaded<br/>6. Stock shown per variant via COALESCE logic</div></div>
<div class="phase-row"><div class="phase-label">API Called:</div><div>GET /home; GET /products; GET /products/:slug; GET /products/search</div></div>
<div class="phase-row"><div class="phase-label">DB Tables Affected:</div><div>Read-only: products, product_variants, product_images, product_attributes, brands, categories, banners, offers</div></div>
<div class="phase-row"><div class="phase-label">Business Rules:</div><div>Only status='active' products shown; COALESCE stock: SUM(variant.stock) if variants exist, else products.stock; offers displayed if not expired</div></div>
<div class="phase-row"><div class="phase-label">Success Outcome:</div><div>Product catalogue rendered with live stock and pricing</div></div>
<div class="phase-row"><div class="phase-label">Failure Outcome:</div><div>DB unavailable → /api/ready returns 503; frontend shows error state</div></div>
</div>
</div>

<div class="phase">
<div class="phase-header">PHASE 5 — Add to Cart (Logged-in + Guest)</div>
<div class="phase-body">
<div class="phase-row"><div class="phase-label">Actor:</div><div>Customer (DB cart) or Guest (localStorage)</div></div>
<div class="phase-row"><div class="phase-label">Trigger:</div><div>User clicks "Add to Bag" on product detail page after selecting variant</div></div>
<div class="phase-row"><div class="phase-label">Steps (Customer):</div><div>1. POST /cart {variantId, quantity}<br/>2. If no variantId: server finds/creates default variant (size=NULL, color=NULL)<br/>3. Server checks product_variants.stock > 0 → 409 if out of stock<br/>4. addOrUpdateItem(): INSERT ... ON CONFLICT (user_id, variant_id) DO UPDATE SET quantity = quantity + $qty<br/>5. Returns updated cart with subtotal and itemCount</div></div>
<div class="phase-row"><div class="phase-label">Steps (Guest):</div><div>1. Item added to localStorage array (no server call)<br/>2. Stock display is from previous product detail API call (not real-time)<br/>3. On login: POST /cart/merge {items:[]} sends localStorage cart to server<br/>⚠️ No stock validation at merge time — gap exists</div></div>
<div class="phase-row"><div class="phase-label">API Called:</div><div>POST /cart; POST /cart/merge (on login)</div></div>
<div class="phase-row"><div class="phase-label">DB Tables Affected:</div><div>cart_items (UPSERT), product_variants (READ stock check only)</div></div>
<div class="phase-row"><div class="phase-label">Business Rules:</div><div>Stock must be > 0 to add (authenticated users); UPSERT increments quantity if item exists; quantity must be ≥ 1</div></div>
<div class="phase-row"><div class="phase-label">Success Outcome:</div><div>Item in cart; subtotal updated; cart badge in navbar increments</div></div>
<div class="phase-row"><div class="phase-label">Failure Outcome:</div><div>Out of stock → 409; item not found → 404</div></div>
</div>
</div>

<div class="phase">
<div class="phase-header">PHASE 6 — Checkout & Payment (Razorpay + COD)</div>
<div class="phase-body">
<div class="phase-row"><div class="phase-label">Actor:</div><div>Customer</div></div>
<div class="phase-row"><div class="phase-label">Trigger:</div><div>Customer clicks "Proceed to Checkout" from cart</div></div>
<div class="phase-row"><div class="phase-label">Steps (Razorpay):</div><div>1. Step 1 (Address): Select/add delivery address<br/>2. Step 2 (Delivery): Choose Standard / Express (pincode check) / Store Pickup<br/>3. Step 3 (Payment): Enter coupon code → validated server-side; toggle Use Points; select Razorpay<br/>4. POST /payments/create-order → batch stock check (ANY query) → coupon validate → points cap 20% → calcShipping() → Razorpay API creates order<br/>5. Response: razorpayOrderId + amount + keyId sent to frontend<br/>6. Razorpay modal opens → customer pays<br/>7. On success: POST /payments/verify {razorpayOrderId, paymentId, signature, ...totals}<br/>8. Server: verifySignature() → HMAC match → fulfillOrder() → redirect to /order-success</div></div>
<div class="phase-row"><div class="phase-label">Steps (COD):</div><div>1–3 same as above<br/>4. POST /payments/create-cod-order → same pre-checks → direct fulfillOrder() call<br/>5. payment_status='pending' (paid only on delivery)</div></div>
<div class="phase-row"><div class="phase-label">API Called:</div><div>GET /stores; GET /account/addresses; POST /payments/create-order; POST /payments/verify; POST /payments/create-cod-order</div></div>
<div class="phase-row"><div class="phase-label">DB Tables Affected:</div><div>orders (INSERT), order_items (INSERT), product_variants (UPDATE stock), inventory (UPDATE), cart_items (DELETE), users (UPDATE points), coupons (UPDATE used_count)</div></div>
<div class="phase-row"><div class="phase-label">Business Rules:</div><div>Shipping: Standard ≥₹999 free else ₹99; Express ₹199; Pickup ₹0. Points: MIN(balance, FLOOR((subtotal-discount)×0.20)). Coupon: validated against active/expired/min_order/per_user/global limits.</div></div>
<div class="phase-row"><div class="phase-label">Success Outcome:</div><div>Order created; cart cleared; SMS sent; in-app notification fired; redirect to order success page</div></div>
<div class="phase-row"><div class="phase-label">Failure Outcome:</div><div>Out of stock → 409; invalid signature → 400; Razorpay error → 502 with message; coupon invalid → 400</div></div>
</div>
</div>

<div class="phase">
<div class="phase-header">PHASE 7 — Order Fulfillment & Stock Deduction (atomic)</div>
<div class="phase-body">
<div class="phase-row"><div class="phase-label">Actor:</div><div>System (fulfillOrder() transaction)</div></div>
<div class="phase-row"><div class="phase-label">Trigger:</div><div>Called from verifyPayment() or createCodOrder() after all pre-checks pass</div></div>
<div class="phase-row"><div class="phase-label">Steps:</div><div>1. client.query('BEGIN')<br/>2. INSERT INTO orders (...) RETURNING * → order record created<br/>3. INSERT INTO order_items (batch values template) → all items inserted<br/>4. FOR EACH item with variantId:<br/>&nbsp;&nbsp;a. SELECT stock FROM product_variants WHERE id=$1 FOR UPDATE (row lock)<br/>&nbsp;&nbsp;b. IF stock &lt; quantity → throw 409 error → ROLLBACK<br/>&nbsp;&nbsp;c. UPDATE product_variants SET stock = stock - $qty WHERE id=$variantId<br/>&nbsp;&nbsp;d. UPDATE inventory SET stock_quantity = GREATEST(stock_quantity - $qty, 0) WHERE variant_id=$variantId<br/>&nbsp;&nbsp;e. INSERT INTO inventory_logs (action='order_deduction', qty=-qty)<br/>5. IF pointsEarned > 0: UPDATE users SET first_citizen_points = first_citizen_points + $pts<br/>6. IF couponId: UPDATE coupons SET used_count = used_count + 1<br/>7. DELETE FROM cart_items WHERE user_id=$userId<br/>8. client.query('COMMIT')<br/>9. (Outside transaction): createNotification() fire-and-forget</div></div>
<div class="phase-row"><div class="phase-label">DB Tables Affected:</div><div>orders, order_items, product_variants, inventory, inventory_logs, users, coupons, cart_items, notifications</div></div>
<div class="phase-row"><div class="phase-label">Business Rules:</div><div>FOR UPDATE prevents race condition on last item. GREATEST prevents negative stock. pointsEarned = FLOOR(total/100). All steps atomic — any failure rolls back completely.</div></div>
<div class="phase-row"><div class="phase-label">Success Outcome:</div><div>Order confirmed; stock decremented in both product_variants and inventory; points awarded; coupon counted; cart empty</div></div>
<div class="phase-row"><div class="phase-label">Failure Outcome:</div><div>Any error → ROLLBACK → no partial state; customer sees error message; Razorpay payment captured but order not created → requires manual reconciliation (gap)</div></div>
</div>
</div>

<div class="phase">
<div class="phase-header">PHASE 8 — Order Cancellation & Stock Restoration</div>
<div class="phase-body">
<div class="phase-row"><div class="phase-label">Actor:</div><div>Customer or Admin</div></div>
<div class="phase-row"><div class="phase-label">Trigger:</div><div>Customer clicks "Cancel Order" on order detail page; or Admin changes order status</div></div>
<div class="phase-row"><div class="phase-label">Steps:</div><div>1. POST /orders/:id/cancel (customer) or PUT /admin/orders/:id/status {status:'cancelled'}<br/>2. client.query('BEGIN')<br/>3. UPDATE orders SET status='cancelled' WHERE id=$1 AND user_id=$2 AND status IN ('pending','confirmed') RETURNING *<br/>4. IF no rows returned → ROLLBACK (order not in cancellable state)<br/>5. SELECT variant_id, quantity FROM order_items WHERE order_id=$1<br/>6. FOR EACH item:<br/>&nbsp;&nbsp;a. UPDATE product_variants SET stock = stock + $qty WHERE id=$variantId<br/>&nbsp;&nbsp;b. UPDATE inventory SET stock_quantity = stock_quantity + $qty WHERE variant_id=$variantId RETURNING id<br/>&nbsp;&nbsp;c. INSERT INTO inventory_logs (action='return_restock', qty=+qty, notes='Order #X cancelled')<br/>7. IF points_earned > 0: UPDATE users SET first_citizen_points = GREATEST(pts - earned, 0)<br/>8. client.query('COMMIT')</div></div>
<div class="phase-row"><div class="phase-label">API Called:</div><div>POST /orders/:id/cancel</div></div>
<div class="phase-row"><div class="phase-label">DB Tables Affected:</div><div>orders, product_variants, inventory, inventory_logs, users</div></div>
<div class="phase-row"><div class="phase-label">Business Rules:</div><div>Only pending/confirmed orders cancellable. Stock fully restored. Points from this order deducted (GREATEST prevents negative). Coupon used_count NOT decremented (gap).</div></div>
<div class="phase-row"><div class="phase-label">Success Outcome:</div><div>Order cancelled; stock restored; points adjusted; customer can re-order</div></div>
<div class="phase-row"><div class="phase-label">Failure Outcome:</div><div>Order already shipped/delivered → null returned → 404 "Order not found or cannot be cancelled"</div></div>
</div>
</div>

<div class="phase">
<div class="phase-header">PHASE 9 — Storefront Visibility & Stock Filters</div>
<div class="phase-body">
<div class="phase-row"><div class="phase-label">Actor:</div><div>System (query layer)</div></div>
<div class="phase-row"><div class="phase-label">Trigger:</div><div>Any product listing or detail API call</div></div>
<div class="phase-row"><div class="phase-label">Steps:</div><div>1. getProducts() builds WHERE p.status = 'active' as base condition<br/>2. If category filter: recursive CTE resolves all child category IDs<br/>3. Stock computed: COALESCE((SELECT SUM(pv.stock) FROM product_variants pv WHERE pv.product_id = p.id), p.stock)<br/>4. Returns stock alongside each product — frontend uses this to show "In Stock" / "Out of Stock"<br/>5. Variant-level stock shown on product detail page (SELECT * FROM product_variants WHERE product_id=$1)<br/>6. Admin soft-delete sets status='inactive' → product immediately disappears from all storefront queries</div></div>
<div class="phase-row"><div class="phase-label">API Called:</div><div>GET /products; GET /products/:slug</div></div>
<div class="phase-row"><div class="phase-label">DB Tables Affected:</div><div>Read-only: products, product_variants, categories (recursive CTE)</div></div>
<div class="phase-row"><div class="phase-label">Business Rules:</div><div>COALESCE: if variants exist → SUM(variant.stock); else → products.stock. Frontend filters: stock=0 → "Out of Stock" badge, add-to-cart disabled. Categories: browsing /category/men shows all men + subcategory products via recursive CTE.</div></div>
<div class="phase-row"><div class="phase-label">Success Outcome:</div><div>Accurate real-time stock visibility; category hierarchy browsing works correctly</div></div>
<div class="phase-row"><div class="phase-label">Failure Outcome:</div><div>If inventory row not created but variant exists: stock from product_variants — functionally correct, inventory module just has no warehouse mapping</div></div>
</div>
</div>

<div class="phase">
<div class="phase-header">PHASE 10 — Loyalty Points & Coupon Lifecycle</div>
<div class="phase-body">
<div class="phase-row"><div class="phase-label">Actor:</div><div>System + Customer</div></div>
<div class="phase-row"><div class="phase-label">Trigger:</div><div>Customer places order / cancels order / applies coupon at checkout</div></div>
<div class="phase-row"><div class="phase-label">Points Earn:</div><div>pointsEarned = FLOOR(total / 100) → awarded inside fulfillOrder() transaction atomically</div></div>
<div class="phase-row"><div class="phase-label">Points Redeem:</div><div>1. Customer toggles "Use Points" at checkout<br/>2. Server fetches user.first_citizen_points<br/>3. maxDiscount = FLOOR((subtotal - couponDiscount) × 0.20)<br/>4. pointsDiscount = MIN(userPoints, maxDiscount)<br/>5. Deducted from order total; separate deduction via UPDATE users after verify (gap: not inside fulfillOrder transaction)</div></div>
<div class="phase-row"><div class="phase-label">Points on Cancel:</div><div>Earned points reversed: UPDATE users SET first_citizen_points = GREATEST(pts - earned, 0) inside cancel transaction</div></div>
<div class="phase-row"><div class="phase-label">Coupon Flow:</div><div>1. Customer enters code → POST /coupons/validate (or inline in create-order)<br/>2. validateCoupon(): active? → not expired? → min_order met? → per_user_limit? → global max_uses? → compute discount<br/>3. Coupon ID stored in order; used_count incremented inside fulfillOrder() transaction<br/>⚠️ On cancel: used_count NOT decremented — gap</div></div>
<div class="phase-row"><div class="phase-label">DB Tables Affected:</div><div>users (points UPDATE), coupons (used_count UPDATE), orders (discount, coupon_id)</div></div>
<div class="phase-row"><div class="phase-label">Business Rules:</div><div>Points cap: 20% of post-coupon subtotal. 1 point = ₹1. No expiry on points. Coupon: flat or percentage discount; per-user and global usage limits enforced separately.</div></div>
<div class="phase-row"><div class="phase-label">Success Outcome:</div><div>Points correctly earned, capped, and redeemed. Coupon validated and usage tracked.</div></div>
<div class="phase-row"><div class="phase-label">Failure Outcome:</div><div>Coupon expired/overused → 400 with reason message. Points balance never goes negative (GREATEST guard).</div></div>
</div>
</div>

<!-- 3.3 -->
<h1 class="sec">3.3 Stock Management Decision Tree</h1>
<div class="arch">
STOCK SOURCE OF TRUTH DECISION TREE
════════════════════════════════════════════════════════════

Q1: Does the product have any rows in product_variants?
│
├─ NO  → Stock = products.stock (fallback field)
│        Shown as: COALESCE(NULL, products.stock) = products.stock
│        Edit via: PUT /admin/products/:id {stock: N}
│
└─ YES → Stock = SUM(product_variants.stock) for all variants
         Shown as: COALESCE(SUM(pv.stock), products.stock)
         products.stock is IGNORED when variants exist

   Q2: Is this variant registered in the Inventory module?
   │
   ├─ NO  → Stock tracked in product_variants only
   │        No warehouse mapping; no low-stock alert
   │        Updated via: PUT /admin/products/variants/:id
   │
   └─ YES → Stock synced across BOTH tables:
            • product_variants.stock (source of truth for orders)
            • inventory.stock_quantity (mirrors; used for dashboard)
            Updated via: PUT /inventory/variants/:variantId/stock
                         → setVariantStock() keeps both in sync

STOCK STATE TABLE
═══════════════════════════════════════════════════════════════════
State                              │ Storefront   │ Inventory Module
───────────────────────────────────┼──────────────┼─────────────────
No variants, products.stock = 0    │ Out of Stock │ Not tracked
No variants, products.stock > 0    │ In Stock     │ Not tracked
Variants exist, all stock = 0      │ Out of Stock │ Depends on reg.
Variants exist, some stock > 0     │ In Stock     │ Depends on reg.
Variant registered, inv. row exists│ In Stock     │ Tracked + alerts
Order placed → stock decremented   │ Real-time    │ Synced + logged
Order cancelled → stock restored   │ Real-time    │ Synced + logged
═══════════════════════════════════════════════════════════════════</div>

<!-- 3.4 -->
<h1 class="sec">3.4 Transaction Safety Map</h1>
<table>
<tr><th>Operation</th><th>Transaction?</th><th>Row Lock?</th><th>Tables Modified</th><th>Rollback Condition</th></tr>
<tr><td>Order Placement (fulfillOrder)</td><td><span class="ok">✅ BEGIN/COMMIT</span></td><td><span class="ok">✅ FOR UPDATE on variants</span></td><td>orders, order_items, product_variants, inventory, inventory_logs, users, coupons, cart_items</td><td>stock &lt; quantity ordered; any DB error</td></tr>
<tr><td>Order Cancellation (cancelOrder)</td><td><span class="ok">✅ BEGIN/COMMIT</span></td><td><span class="err">❌ No row lock</span></td><td>orders, product_variants, inventory, inventory_logs, users</td><td>Order not in pending/confirmed status</td></tr>
<tr><td>Bulk Stock Update</td><td><span class="err">❌ No transaction</span></td><td><span class="err">❌ No row lock</span></td><td>inventory, product_variants, inventory_logs</td><td>None — partial failure possible</td></tr>
<tr><td>setVariantStock()</td><td><span class="warn">⚠️ Single client block</span></td><td><span class="err">❌ No explicit lock</span></td><td>product_variants, inventory (UPSERT), inventory_logs</td><td>Variant not found</td></tr>
<tr><td>adjustStock()</td><td><span class="warn">⚠️ Single client block</span></td><td><span class="err">❌ No explicit lock</span></td><td>inventory, product_variants, inventory_logs</td><td>Inventory item not found</td></tr>
<tr><td>Cart Add/Update</td><td><span class="err">❌ Single query</span></td><td><span class="err">❌ No lock</span></td><td>cart_items</td><td>Stock check is pre-flight only; no atomic reserve</td></tr>
<tr><td>Coupon Validation + Apply</td><td><span class="ok">✅ Inside fulfillOrder</span></td><td><span class="err">❌ No lock on coupon row</span></td><td>coupons (used_count)</td><td>TOCTOU risk under high concurrency on last use</td></tr>
<tr><td>Points Redemption Deduction</td><td><span class="err">❌ Outside fulfillOrder</span></td><td><span class="err">❌ No lock</span></td><td>users</td><td>None — race condition possible under concurrency</td></tr>
</table>

<!-- 3.5 -->
<h1 class="sec">3.5 Data Flow Diagrams</h1>

<h2 class="sub">Product Creation Flow</h2>
<div class="arch">
[Admin UI: /admin/products/new]
       │  POST /admin/products (multipart/form-data)
       ▼
[admin.routes.js: POST /products]
       │  authGuard → adminGuard → uploadImages (Multer)
       ▼
[createProduct(req.body)] ──────────────────────→ [DB: INSERT INTO products]
       │                                                      │
       │  req.files.forEach → addImage(productId, url)        │
       ▼                                                      ▼
[DB: INSERT INTO product_images]              [products row RETURNING *]
       │
       ▼
[Response: { success: true, data: product }]
       │
       ▼
[Admin UI: product appears in list]</div>

<h2 class="sub">Order Placement Flow (Razorpay)</h2>
<div class="arch">
[Customer: CheckoutPage.jsx]
       │  POST /payments/create-order {addressId, couponCode, usePoints, deliveryType}
       ▼
[payments.controller.js: createOrder()]
       │
       ├─ getAddresses(userId) → validate address ownership
       ├─ getCartByUser(userId) → load cart items
       ├─ pool.query(ANY($variantIds)) → batch stock pre-check
       ├─ validateCoupon(code, subtotal, userId) → discount
       ├─ findUserById(userId) → points balance → pointsDiscount cap 20%
       ├─ calcShipping(deliveryType, subtotal) → shipping amount
       └─ createRazorpayOrder(total, 'INR', receipt) → Razorpay API
              │
              ▼
       [Razorpay API] ──→ { id: rzp_order_id, amount, currency }
              │
              ▼
[Response: { razorpayOrderId, amount, keyId, subtotal, discount, shipping, total }]
       │
       ▼
[Customer: Razorpay Modal opens]
       │  Customer completes payment
       ▼
[POST /payments/verify {razorpayOrderId, paymentId, signature, ...totals}]
       │
       ├─ verifySignature(orderId, paymentId, signature) → HMAC-SHA256 ✅
       └─ fulfillOrder({userId, addressId, items, totals, deliveryType...})
              │
              ▼
       [BEGIN TRANSACTION]
              ├─ INSERT orders → order record
              ├─ INSERT order_items → line items
              ├─ FOR EACH variant: FOR UPDATE → validate → UPDATE stock
              ├─ UPDATE inventory (sync)
              ├─ INSERT inventory_logs
              ├─ UPDATE users (points)
              ├─ UPDATE coupons (used_count)
              └─ DELETE cart_items
       [COMMIT]
              │
              ▼
       [SMS: sendOrderConfirmation()] ← fire-and-forget
       [Notification: createNotification()] ← fire-and-forget
              │
              ▼
[Response: { success: true, data: { orderId } }]
       │
       ▼
[Customer: redirect to /order-success/:orderId]</div>

<h2 class="sub">Stock Sync Flow</h2>
<div class="arch">
Admin sets stock via Inventory Module:
[PUT /inventory/variants/:variantId/stock { stock_quantity: 50 }]
       │
       ▼
[inventory.controller.js: updateVariantStock()]
       │
       ▼
[setVariantStock(variantId, 50, threshold, adminId, notes)]
       │
       ├─ UPDATE product_variants SET stock = 50 WHERE id = $variantId
       │
       ├─ INSERT INTO inventory (variant_id, stock_quantity=50)
       │   ON CONFLICT (variant_id) DO UPDATE SET stock_quantity = 50
       │
       └─ INSERT INTO inventory_logs (action='variant_stock_set', qty=50)
              │
              ▼
[Both product_variants.stock AND inventory.stock_quantity = 50]

When order is placed (inside fulfillOrder transaction):
[UPDATE product_variants SET stock = stock - qty WHERE id = $variantId]
[UPDATE inventory SET stock_quantity = GREATEST(stock_quantity - qty, 0) WHERE variant_id = $variantId]
[INSERT INTO inventory_logs (action='order_deduction', qty=-qty)]

When order is cancelled (inside cancelOrder transaction):
[UPDATE product_variants SET stock = stock + qty WHERE id = $variantId]
[UPDATE inventory SET stock_quantity = stock_quantity + qty WHERE variant_id = $variantId]
[INSERT INTO inventory_logs (action='return_restock', qty=+qty)]</div>

</div>

<!-- ══════════ EXECUTIVE SUMMARY ══════════ -->
<div class="part-divider" style="page-break-before:always;">
  <div class="part-num">Executive Summary</div>
  <h2>ShopperHub — System Maturity Assessment</h2>
  <p>One-page summary for stakeholders and engineering leadership.</p>
</div>

<div class="content">
<div class="exec">
<h3>What the System Does</h3>
<p>ShopperHub is a complete fashion e-commerce platform with a React SPA frontend, Node.js/Express backend, and PostgreSQL database. It supports the full retail lifecycle: product catalogue management with hierarchical categories and variants, multi-step checkout with Razorpay online payment and COD, atomic order fulfillment with inventory synchronization, loyalty points, coupon engine, SMS notifications, and a comprehensive admin panel covering products, inventory, orders, banners, CMS pages, delivery configuration, and warehouse management.</p>

<div class="exec-grid">
<div class="exec-card green">
<h4>✅ Top 3 Strengths</h4>
<ul>
<li>Atomic order fulfillment: fulfillOrder() uses DB transactions with FOR UPDATE row locks — prevents overselling and data corruption under concurrent orders</li>
<li>Layered architecture: strict Routes → Controllers → Services → Queries separation makes the codebase navigable and extensible</li>
<li>Security fundamentals: Helmet CSP, JWT in httpOnly cookies, bcrypt passwords, HMAC payment verification, admin role guard — solid baseline</li>
</ul>
</div>
<div class="exec-card red">
<h4>❌ Top 3 Risks</h4>
<ul>
<li>Zero test coverage: no unit, integration, or E2E tests for any business logic — fulfillOrder(), verifySignature(), validateCoupon() are all untested. A regression in payment flow could go undetected.</li>
<li>Inventory gap: variant stock is NOT automatically registered in the Inventory module when a variant is added — admin must do this manually. Missed setup means warehouse tracking and low-stock alerts are silently disabled.</li>
<li>Exposed credentials in git history: Twilio SID + Fast2SMS API key were committed and need immediate rotation — anyone with repo access (including historical clones) has these credentials.</li>
</ul>
</div>
<div class="exec-card blue">
<h4>💡 Recommended Next Steps</h4>
<ul>
<li>Immediate (Week 1): Rotate all exposed API keys. Auto-create inventory row on variant add. Add Joi validation to checkout and auth endpoints.</li>
<li>Short-term (Month 1): Write tests for payment verification, order fulfillment, coupon validation. Add DB indexes (orders.user_id, cart_items.user_id, products.slug). Wrap bulk stock update in transaction.</li>
<li>Pre-production (Month 2): Migrate image storage to S3/Cloudflare R2. Add Redis for rate limiting and public endpoint caching. Add API versioning (/api/v1/). Set up CI/CD pipeline with test gate.</li>
</ul>
</div>
<div class="exec-card" style="border-color:#f59e0b;">
<h4 style="color:#92400e;">📊 Current Maturity: 5.9/10</h4>
<ul>
<li>Architecture: 7.5/10 — Clean, well-structured monolith</li>
<li>Security: 6.0/10 — Good foundations; missing input validation</li>
<li>Data Integrity: 7.0/10 — Transactions present; bulk update gap</li>
<li>Testing: 1.0/10 — No automated tests; critical blocker for production</li>
<li>Performance: 6.0/10 — No indexes documented; no caching layer</li>
<li><strong>Verdict: Strong MVP foundation. Not production-ready. Estimated 4–6 weeks of hardening required before launch.</strong></li>
</ul>
</div>
</div>
</div>
</div>

</body>
</html>`;

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.pdf({
  path: 'ShopperHub-Master-Technical-Document.pdf',
  format: 'A4',
  printBackground: true,
  margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
});
await browser.close();
console.log('PDF generated: ShopperHub-Master-Technical-Document.pdf');
