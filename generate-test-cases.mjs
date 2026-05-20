import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
wb.creator = 'ShopperHub QA';
wb.created = new Date();

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  headerBg:   '1F3864',   // dark navy
  headerFg:   'FFFFFF',
  positive:   'E2EFDA',   // light green
  negative:   'FCE4D6',   // light red/orange
  edge:       'FFF2CC',   // light yellow
  validation: 'DAE8FC',   // light blue
  passText:   '375623',
  failText:   '9C0006',
  edgeText:   '7F6000',
  valText:    '1F4E79',
  sectionBg:  'D6E4F0',
  altRow:     'F2F2F2',
};

const STATUSES = { PASS: 'PASS', FAIL: 'FAIL' };

function typeColor(type) {
  switch (type) {
    case 'Positive':   return { bg: C.positive,   fg: C.passText };
    case 'Negative':   return { bg: C.negative,   fg: C.failText };
    case 'Edge Case':  return { bg: C.edge,        fg: C.edgeText };
    case 'Validation': return { bg: C.validation,  fg: C.valText };
    default:           return { bg: 'FFFFFF',      fg: '000000' };
  }
}

// ─── Sheet factory ────────────────────────────────────────────────────────────
function makeSheet(name, testCases) {
  const ws = wb.addWorksheet(name, {
    views: [{ state: 'frozen', ySplit: 2 }],
    pageSetup: { fitToPage: true, fitToWidth: 1, orientation: 'landscape' },
  });

  const cols = [
    { header: 'TC ID',           key: 'id',         width: 12 },
    { header: 'Module',          key: 'module',      width: 22 },
    { header: 'Feature',         key: 'feature',     width: 28 },
    { header: 'Test Case Title', key: 'title',       width: 42 },
    { header: 'Type',            key: 'type',        width: 13 },
    { header: 'Preconditions',   key: 'pre',         width: 34 },
    { header: 'Test Steps',      key: 'steps',       width: 55 },
    { header: 'Test Data',       key: 'data',        width: 38 },
    { header: 'Expected Result', key: 'expected',    width: 48 },
    { header: 'Priority',        key: 'priority',    width: 10 },
    { header: 'Status',          key: 'status',      width: 10 },
    { header: 'Remarks',         key: 'remarks',     width: 28 },
  ];

  ws.columns = cols;

  // Title row
  ws.mergeCells('A1:L1');
  const titleCell = ws.getCell('A1');
  titleCell.value = `ShopperHub — ${name} Test Cases`;
  titleCell.font   = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
  titleCell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  ws.getRow(1).height = 28;

  // Header row
  const hdr = ws.getRow(2);
  cols.forEach((col, i) => {
    const cell = hdr.getCell(i + 1);
    cell.value = col.header;
    cell.font  = { bold: true, color: { argb: C.headerFg } };
    cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFFFFF' } },
      bottom: { style: 'thin', color: { argb: 'FFFFFF' } },
      left: { style: 'thin', color: { argb: 'FFFFFF' } },
      right: { style: 'thin', color: { argb: 'FFFFFF' } },
    };
  });
  hdr.height = 22;

  // Data rows
  testCases.forEach((tc, idx) => {
    const row = ws.addRow([
      tc.id, tc.module, tc.feature, tc.title, tc.type,
      tc.pre, tc.steps, tc.data, tc.expected,
      tc.priority, '', tc.remarks || '',
    ]);
    row.height = 55;

    const { bg, fg } = typeColor(tc.type);
    const statusBg = tc.type === 'Positive' ? C.positive : tc.type === 'Negative' ? C.negative : 'FFFFFF';

    row.eachCell({ includeEmpty: true }, (cell, colNum) => {
      cell.alignment = { vertical: 'top', wrapText: true };
      cell.border = {
        top:    { style: 'thin', color: { argb: 'D0D0D0' } },
        bottom: { style: 'thin', color: { argb: 'D0D0D0' } },
        left:   { style: 'thin', color: { argb: 'D0D0D0' } },
        right:  { style: 'thin', color: { argb: 'D0D0D0' } },
      };
      // Type column coloring
      if (colNum === 5) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.font = { bold: true, color: { argb: fg }, size: 9 };
        cell.alignment = { horizontal: 'center', vertical: 'top', wrapText: true };
      }
      // Priority coloring
      if (colNum === 10) {
        const pBg = tc.priority === 'High' ? 'FFD7D7' : tc.priority === 'Medium' ? 'FFF2CC' : 'E2EFDA';
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: pBg } };
        cell.font = { bold: true, size: 9 };
        cell.alignment = { horizontal: 'center', vertical: 'top' };
      }
      // Alternating row shade
      if (colNum !== 5 && colNum !== 10 && idx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.altRow } };
      }
    });
  });

  // Auto-filter on header
  ws.autoFilter = { from: 'A2', to: 'L2' };

  return ws;
}

// ─── Test Data ────────────────────────────────────────────────────────────────

// ════════════════════════════════════════════════════════════════════════
//  SHEET 1 — WEBSITE (CUSTOMER-FACING)
// ════════════════════════════════════════════════════════════════════════
const websiteTCs = [

  // ── AUTH ─────────────────────────────────────────────────────────────
  { id:'WEB-001', module:'Authentication', feature:'User Registration', type:'Positive',
    title:'Register with valid email & password',
    pre:'User not already registered',
    steps:'1. Navigate to /register\n2. Enter valid email, password ≥8 chars, full name\n3. Click Register',
    data:'email: test@example.com\npassword: Test@1234\nfullName: Test User',
    expected:'Account created. JWT access token returned. User redirected to home.',
    priority:'High', remarks:'Core happy path' },

  { id:'WEB-002', module:'Authentication', feature:'User Registration', type:'Negative',
    title:'Register with already-existing email',
    pre:'Email already in DB',
    steps:'1. Navigate to /register\n2. Enter duplicate email\n3. Click Register',
    data:'email: existing@example.com\npassword: Test@1234',
    expected:'409 Conflict or validation error. Message: "Email already in use".',
    priority:'High' },

  { id:'WEB-003', module:'Authentication', feature:'User Registration', type:'Validation',
    title:'Register with password < 8 characters',
    pre:'None',
    steps:'1. Navigate to /register\n2. Enter valid email, password = "abc123"\n3. Click Register',
    data:'email: new@test.com\npassword: abc123',
    expected:'Form error shown: "Password must be at least 8 characters". No API call made.',
    priority:'High' },

  { id:'WEB-004', module:'Authentication', feature:'User Registration', type:'Validation',
    title:'Register with invalid email format',
    pre:'None',
    steps:'1. Navigate to /register\n2. Enter "notanemail" in email field\n3. Click Register',
    data:'email: notanemail\npassword: Test@1234',
    expected:'Inline validation error: "Enter a valid email address". Form not submitted.',
    priority:'High' },

  { id:'WEB-005', module:'Authentication', feature:'User Registration', type:'Edge Case',
    title:'Register with email at max length (254 chars)',
    pre:'None',
    steps:'1. Craft 254-char valid email\n2. Submit registration form',
    data:'email: a[243 chars]@b.com\npassword: Test@1234',
    expected:'Account created successfully OR clear length-limit error. No server crash.',
    priority:'Medium' },

  { id:'WEB-006', module:'Authentication', feature:'Login', type:'Positive',
    title:'Login with valid email and password',
    pre:'Registered user exists',
    steps:'1. Navigate to /login\n2. Enter valid email & password\n3. Click Login',
    data:'email: test@example.com\npassword: Test@1234',
    expected:'HTTP 200. Access token stored. User redirected to home page.',
    priority:'High' },

  { id:'WEB-007', module:'Authentication', feature:'Login', type:'Negative',
    title:'Login with wrong password',
    pre:'Registered user exists',
    steps:'1. Navigate to /login\n2. Enter correct email, wrong password\n3. Click Login',
    data:'email: test@example.com\npassword: WrongPass',
    expected:'HTTP 401. Error message: "Invalid credentials". Stay on login page.',
    priority:'High' },

  { id:'WEB-008', module:'Authentication', feature:'Login', type:'Negative',
    title:'Login with non-existent email',
    pre:'None',
    steps:'1. Enter email that has no account\n2. Enter any password\n3. Click Login',
    data:'email: ghost@nowhere.com\npassword: Test@1234',
    expected:'HTTP 401 or 404 with "User not found" message.',
    priority:'High' },

  { id:'WEB-009', module:'Authentication', feature:'Login', type:'Validation',
    title:'Login with empty fields',
    pre:'None',
    steps:'1. Leave email and password blank\n2. Click Login',
    data:'(empty)',
    expected:'Client-side validation fires. Error: "Email or phone required". No API call.',
    priority:'Medium' },

  { id:'WEB-010', module:'Authentication', feature:'Login', type:'Edge Case',
    title:'Login with phone number instead of email',
    pre:'User registered with phone',
    steps:'1. Enter registered phone number in email field\n2. Enter password\n3. Click Login',
    data:'phone: 9876543210\npassword: Test@1234',
    expected:'HTTP 200. Login succeeds via phone+password path.',
    priority:'Medium' },

  { id:'WEB-011', module:'Authentication', feature:'Logout', type:'Positive',
    title:'Logout clears session and tokens',
    pre:'User logged in',
    steps:'1. Click Logout\n2. Try to access /orders (protected route)',
    data:'Valid session token',
    expected:'Refresh token cookie cleared. Redirect to /login. Protected route returns 401.',
    priority:'High' },

  { id:'WEB-012', module:'Authentication', feature:'Token Refresh', type:'Positive',
    title:'Access token auto-refreshed using refresh token',
    pre:'User logged in; access token expired',
    steps:'1. Wait for access token to expire (or manipulate)\n2. Navigate to any protected page',
    data:'Expired access token; valid refresh token cookie',
    expected:'New access token silently obtained. Page loads without forcing re-login.',
    priority:'High' },

  { id:'WEB-013', module:'Authentication', feature:'Token Refresh', type:'Negative',
    title:'Expired refresh token forces re-login',
    pre:'Both tokens expired',
    steps:'1. Expire both tokens\n2. Navigate to protected route',
    data:'Expired tokens',
    expected:'User redirected to /login page.',
    priority:'High' },

  { id:'WEB-014', module:'Authentication', feature:'OTP Login', type:'Positive',
    title:'Mobile OTP check and verify',
    pre:'Registered mobile user',
    steps:'1. POST /auth/check-mobile with registered phone\n2. Receive OTP\n3. POST /auth/verify-otp',
    data:'phone: 9876543210\notp: 6-digit code',
    expected:'OTP sent. On verify: session created, access token returned.',
    priority:'Medium' },

  { id:'WEB-015', module:'Authentication', feature:'OTP Login', type:'Negative',
    title:'Wrong OTP rejected',
    pre:'OTP sent to phone',
    steps:'1. POST /auth/verify-otp with wrong 6-digit OTP',
    data:'phone: 9876543210\notp: 000000',
    expected:'HTTP 400. Error: "Invalid OTP".',
    priority:'High' },

  // ── PRODUCT BROWSING ──────────────────────────────────────────────────
  { id:'WEB-016', module:'Products', feature:'Product Listing', type:'Positive',
    title:'Browse all products on homepage',
    pre:'Active products in DB',
    steps:'1. Navigate to /\n2. Observe product grid',
    data:'No filters applied',
    expected:'Products displayed with image, title, price, brand. Pagination shown.',
    priority:'High' },

  { id:'WEB-017', module:'Products', feature:'Product Listing', type:'Positive',
    title:'Filter products by category',
    pre:'Products with different categories exist',
    steps:'1. Navigate to /category/men\n2. Observe results',
    data:'Category slug: men',
    expected:'Only Men + subcategory products shown (recursive CTE). Count updated.',
    priority:'High' },

  { id:'WEB-018', module:'Products', feature:'Product Listing', type:'Positive',
    title:'Filter products by brand',
    pre:'Multiple brands exist',
    steps:'1. Select brand from filter sidebar\n2. Observe results',
    data:'Brand slug: nike',
    expected:'Only Nike products shown. URL updated with ?brand=nike.',
    priority:'High' },

  { id:'WEB-019', module:'Products', feature:'Product Listing', type:'Positive',
    title:'Filter by price range',
    pre:'Products with varying prices',
    steps:'1. Set min price ₹500, max price ₹2000\n2. Apply filter',
    data:'minPrice: 500\nmaxPrice: 2000',
    expected:'Products with base_price 500–2000 returned only.',
    priority:'Medium' },

  { id:'WEB-020', module:'Products', feature:'Product Listing', type:'Positive',
    title:'Sort products by price ascending',
    pre:'Multiple products',
    steps:'1. Select "Price: Low to High" from sort dropdown',
    data:'sort: price_asc',
    expected:'Products ordered by price ascending. No duplicates.',
    priority:'Medium' },

  { id:'WEB-021', module:'Products', feature:'Product Listing', type:'Positive',
    title:'Sort products by discount',
    pre:'Products with various discounts',
    steps:'1. Select "Best Discount" from sort',
    data:'sort: discount',
    expected:'Highest discount_pct products appear first.',
    priority:'Medium' },

  { id:'WEB-022', module:'Products', feature:'Product Listing', type:'Edge Case',
    title:'Filter combination returns zero results',
    pre:'None',
    steps:'1. Apply brand=Nike AND category=Kids AND gender=Female\n2. No such products exist',
    data:'Mutually exclusive filters',
    expected:'"No products found" message displayed. No JS errors.',
    priority:'Medium' },

  { id:'WEB-023', module:'Products', feature:'Product Listing', type:'Edge Case',
    title:'Pagination — navigate to last page',
    pre:'≥21 active products',
    steps:'1. Browse to last page of product grid',
    data:'page: last, limit: 20',
    expected:'Remaining products shown. No "next page" button visible.',
    priority:'Medium' },

  { id:'WEB-024', module:'Products', feature:'Search', type:'Positive',
    title:'Search by product title keyword',
    pre:'Products in DB',
    steps:'1. Enter "shirt" in search bar\n2. Click search',
    data:'q: shirt',
    expected:'Products matching "shirt" in title returned. Ranked by relevance.',
    priority:'High' },

  { id:'WEB-025', module:'Products', feature:'Search', type:'Positive',
    title:'Search by brand name',
    pre:'Brand products in DB',
    steps:'1. Enter brand name "Nike"\n2. Submit search',
    data:'q: Nike',
    expected:'Nike-branded products appear in results.',
    priority:'High' },

  { id:'WEB-026', module:'Products', feature:'Search', type:'Negative',
    title:'Search with no results',
    pre:'None',
    steps:'1. Enter gibberish keyword\n2. Submit search',
    data:'q: xyzqwerty123abc',
    expected:'"No results found" state displayed. No errors.',
    priority:'Medium' },

  { id:'WEB-027', module:'Products', feature:'Search', type:'Edge Case',
    title:'Search with special characters',
    pre:'None',
    steps:'1. Enter "T-shirt & polo" in search',
    data:'q: T-shirt & polo',
    expected:'Search runs without SQL error. Results shown or empty state.',
    priority:'Medium' },

  { id:'WEB-028', module:'Products', feature:'Search', type:'Edge Case',
    title:'Search with empty string',
    pre:'None',
    steps:'1. Click search with empty input',
    data:'q: (empty)',
    expected:'Either all products or validation message shown. No 500 error.',
    priority:'Medium' },

  { id:'WEB-029', module:'Products', feature:'Product Detail', type:'Positive',
    title:'View product detail page',
    pre:'Active product exists',
    steps:'1. Click on a product card\n2. Navigate to /product/:slug',
    data:'slug: valid-product-slug',
    expected:'Title, images, price, description, variants, attributes all displayed.',
    priority:'High' },

  { id:'WEB-030', module:'Products', feature:'Product Detail', type:'Negative',
    title:'Access inactive product URL',
    pre:'Product with status=inactive',
    steps:'1. Navigate to /product/inactive-slug',
    data:'slug: inactive-product-slug',
    expected:'404 page shown or redirect to homepage.',
    priority:'Medium' },

  { id:'WEB-031', module:'Products', feature:'Product Detail', type:'Positive',
    title:'Size/variant selection updates price',
    pre:'Product with size variants having extra_price',
    steps:'1. Open product\n2. Select different size\n3. Observe price',
    data:'extra_price: 200',
    expected:'Price updates to base_price + extra_price.',
    priority:'High' },

  // ── CART ─────────────────────────────────────────────────────────────
  { id:'WEB-032', module:'Cart', feature:'Add to Cart', type:'Positive',
    title:'Add in-stock product to cart',
    pre:'User logged in; product in stock',
    steps:'1. Open product detail\n2. Select size\n3. Click "Add to Cart"',
    data:'productId: 1\nvariantId: 5\nquantity: 1',
    expected:'Cart count increments. Item appears in cart drawer. API returns 200.',
    priority:'High' },

  { id:'WEB-033', module:'Cart', feature:'Add to Cart', type:'Negative',
    title:'Add out-of-stock product to cart',
    pre:'Product variant stock = 0',
    steps:'1. Open product with zero stock\n2. Try to add to cart',
    data:'variantId with stock: 0',
    expected:'Button disabled OR error toast: "Out of Stock".',
    priority:'High' },

  { id:'WEB-034', module:'Cart', feature:'Add to Cart', type:'Edge Case',
    title:'Add quantity exceeding available stock',
    pre:'Variant stock = 2',
    steps:'1. Add product with qty=2 already in cart\n2. Try to add 1 more',
    data:'current qty: 2, stock: 2',
    expected:'API returns 409 or client blocks. Error: "Insufficient quantity".',
    priority:'High' },

  { id:'WEB-035', module:'Cart', feature:'Add to Cart', type:'Validation',
    title:'Add product without selecting size (when variants exist)',
    pre:'Product has multiple size variants',
    steps:'1. Click "Add to Cart" without choosing size',
    data:'No variantId selected',
    expected:'Client shows prompt: "Please select a size before adding to cart".',
    priority:'High' },

  { id:'WEB-036', module:'Cart', feature:'Update Cart', type:'Positive',
    title:'Increase quantity of cart item',
    pre:'Item in cart with stock > current qty',
    steps:'1. Open cart\n2. Click "+" on item',
    data:'itemId: 1\nquantity: 2',
    expected:'Quantity updated. Line total recalculated. API returns updated cart.',
    priority:'High' },

  { id:'WEB-037', module:'Cart', feature:'Update Cart', type:'Negative',
    title:'Set cart item quantity to zero',
    pre:'Item in cart',
    steps:'1. Open cart\n2. Set quantity to 0 or click "-" to zero',
    data:'quantity: 0',
    expected:'Item removed from cart OR validation prevents zero quantity.',
    priority:'Medium' },

  { id:'WEB-038', module:'Cart', feature:'Remove from Cart', type:'Positive',
    title:'Remove item from cart',
    pre:'Item in cart',
    steps:'1. Open cart\n2. Click delete/trash icon on item',
    data:'itemId: 1',
    expected:'Item removed. Cart total updates. If last item, empty cart state shown.',
    priority:'High' },

  { id:'WEB-039', module:'Cart', feature:'Cart Merge', type:'Positive',
    title:'Guest cart merged on login',
    pre:'Guest adds items; then logs in',
    steps:'1. Add products as guest\n2. Log in\n3. Observe cart',
    data:'Guest cart: [{productId:1,qty:2}]',
    expected:'Guest items merged with user cart. Duplicates combined. POST /cart/merge called.',
    priority:'High' },

  { id:'WEB-040', module:'Cart', feature:'Cart Persistence', type:'Positive',
    title:'Cart persists across sessions',
    pre:'User logged in with items in cart',
    steps:'1. Add items to cart\n2. Log out\n3. Log back in',
    data:'JWT auth',
    expected:'Cart items preserved from previous session.',
    priority:'Medium' },

  // ── WISHLIST ──────────────────────────────────────────────────────────
  { id:'WEB-041', module:'Wishlist', feature:'Wishlist Management', type:'Positive',
    title:'Add product to wishlist',
    pre:'User logged in',
    steps:'1. Click heart icon on product card',
    data:'productId: 1',
    expected:'Product added to wishlist. Heart icon filled. Wishlist count increments.',
    priority:'Medium' },

  { id:'WEB-042', module:'Wishlist', feature:'Wishlist Management', type:'Positive',
    title:'Remove product from wishlist',
    pre:'Product already in wishlist',
    steps:'1. Click heart icon again on wishlisted product',
    data:'productId: 1',
    expected:'Product removed. Heart unfilled. Wishlist count decrements.',
    priority:'Medium' },

  { id:'WEB-043', module:'Wishlist', feature:'Wishlist Management', type:'Negative',
    title:'Access wishlist without login',
    pre:'User not logged in',
    steps:'1. Navigate to /wishlist',
    data:'No auth token',
    expected:'Redirect to /login OR prompt to log in.',
    priority:'Medium' },

  { id:'WEB-044', module:'Wishlist', feature:'Wishlist to Cart', type:'Positive',
    title:'Move wishlist item to cart',
    pre:'Product in wishlist; in stock',
    steps:'1. Navigate to /wishlist\n2. Click "Move to Cart"',
    data:'productId: 1',
    expected:'Item added to cart. Item removed (or kept) in wishlist per UX flow.',
    priority:'Medium' },

  // ── CHECKOUT ──────────────────────────────────────────────────────────
  { id:'WEB-045', module:'Checkout', feature:'Checkout Flow', type:'Positive',
    title:'Standard checkout with saved address (Razorpay)',
    pre:'User logged in; cart has items; address saved',
    steps:'1. Go to cart\n2. Click Checkout\n3. Select address\n4. Choose Standard delivery\n5. Choose Razorpay payment\n6. Complete payment',
    data:'addressId: 1\ndeliveryType: standard\ncouponCode: (none)',
    expected:'Razorpay modal opens. On success, order created. Redirect to /order-success.',
    priority:'High' },

  { id:'WEB-046', module:'Checkout', feature:'Checkout Flow', type:'Positive',
    title:'Checkout with COD',
    pre:'User logged in; cart has items; address saved',
    steps:'1. Select address\n2. Choose Standard delivery\n3. Choose COD\n4. Place Order',
    data:'addressId: 1\npaymentMethod: cod',
    expected:'Order placed with payment_method=cod. Order ID returned. SMS sent.',
    priority:'High' },

  { id:'WEB-047', module:'Checkout', feature:'Checkout Flow', type:'Positive',
    title:'Apply valid coupon code at checkout',
    pre:'Active coupon in DB; meets min order value',
    steps:'1. At checkout enter coupon code\n2. Click Apply',
    data:'couponCode: SAVE100\nsubtotal: 1500',
    expected:'Discount applied. Total reduced. Breakdown shows discount line.',
    priority:'High' },

  { id:'WEB-048', module:'Checkout', feature:'Coupon', type:'Negative',
    title:'Apply expired coupon code',
    pre:'Coupon exists but expired',
    steps:'1. Enter expired coupon at checkout',
    data:'couponCode: EXPIREDCODE',
    expected:'Error: "Coupon has expired".',
    priority:'High' },

  { id:'WEB-049', module:'Checkout', feature:'Coupon', type:'Negative',
    title:'Apply coupon below minimum order value',
    pre:'Coupon requires min ₹2000; cart = ₹1000',
    steps:'1. Enter coupon code\n2. Apply',
    data:'couponCode: SAVE200\nsubtotal: 1000',
    expected:'Error: "Minimum order value not met".',
    priority:'High' },

  { id:'WEB-050', module:'Checkout', feature:'Coupon', type:'Edge Case',
    title:'Apply coupon at exact minimum order value',
    pre:'Coupon min_order = 1000; cart = exactly 1000',
    steps:'1. Build cart to exactly ₹1000\n2. Apply coupon',
    data:'couponCode: SAVE200\nsubtotal: 1000',
    expected:'Coupon applied successfully (boundary condition).',
    priority:'Medium' },

  { id:'WEB-051', module:'Checkout', feature:'Loyalty Points', type:'Positive',
    title:'Redeem loyalty points (First Citizen Points)',
    pre:'User has ≥100 points; order ≥₹500',
    steps:'1. At checkout toggle "Use Points"\n2. Proceed',
    data:'points: 200\nsubtotal: 1000',
    expected:'Max 20% deducted via points. Points balance updated after order.',
    priority:'High' },

  { id:'WEB-052', module:'Checkout', feature:'Loyalty Points', type:'Edge Case',
    title:'Points discount capped at 20% of post-coupon subtotal',
    pre:'User has 10000 points; subtotal ₹500 after coupon',
    steps:'1. Apply coupon\n2. Enable Use Points',
    data:'points: 10000\nsubtotal_after_coupon: 500',
    expected:'Points used = max ₹100 (20% of 500), not 10000.',
    priority:'High' },

  { id:'WEB-053', module:'Checkout', feature:'Delivery', type:'Positive',
    title:'Express delivery adds ₹199 shipping',
    pre:'Pincode eligible for express',
    steps:'1. Select Express delivery\n2. Observe total',
    data:'deliveryType: express',
    expected:'Shipping shows ₹199. Total = subtotal + 199.',
    priority:'High' },

  { id:'WEB-054', module:'Checkout', feature:'Delivery', type:'Positive',
    title:'Free standard shipping above ₹999',
    pre:'Cart subtotal ≥ ₹999',
    steps:'1. Select Standard delivery\n2. Subtotal = ₹1200',
    data:'subtotal: 1200',
    expected:'Shipping = ₹0. "Free shipping" badge shown.',
    priority:'High' },

  { id:'WEB-055', module:'Checkout', feature:'Delivery', type:'Positive',
    title:'Store pickup shows ₹0 shipping',
    pre:'Stores available',
    steps:'1. Select Store Pickup\n2. Choose store\n3. Observe shipping',
    data:'deliveryType: store_pickup',
    expected:'Shipping = ₹0. Store details shown.',
    priority:'High' },

  { id:'WEB-056', module:'Checkout', feature:'Checkout Flow', type:'Negative',
    title:'Checkout with empty cart',
    pre:'User logged in; empty cart',
    steps:'1. Navigate to /checkout',
    data:'Cart: empty',
    expected:'Redirect back to cart or error: "Your cart is empty".',
    priority:'High' },

  { id:'WEB-057', module:'Checkout', feature:'Checkout Flow', type:'Negative',
    title:'Checkout without selecting address',
    pre:'User has no saved addresses',
    steps:'1. Proceed to checkout without address',
    data:'addressId: null',
    expected:'Error: "Please add a delivery address". Cannot proceed.',
    priority:'High' },

  { id:'WEB-058', module:'Checkout', feature:'Payment', type:'Negative',
    title:'Payment verification fails (tampered signature)',
    pre:'Razorpay order created',
    steps:'1. Intercept verify payload\n2. Alter razorpaySignature\n3. POST /payments/verify',
    data:'razorpaySignature: tampered',
    expected:'HTTP 400. Error: "Payment verification failed". Order NOT created.',
    priority:'High' },

  // ── ORDERS ────────────────────────────────────────────────────────────
  { id:'WEB-059', module:'Orders', feature:'Order History', type:'Positive',
    title:'View order history',
    pre:'User has placed orders',
    steps:'1. Navigate to /orders',
    data:'Authenticated user',
    expected:'List of orders with ID, date, total, status shown.',
    priority:'High' },

  { id:'WEB-060', module:'Orders', feature:'Order Detail', type:'Positive',
    title:'View individual order details',
    pre:'Order exists for user',
    steps:'1. Click on order in history\n2. Navigate to /orders/:id',
    data:'orderId: 1',
    expected:'Items, pricing breakdown, delivery info, payment method all shown.',
    priority:'High' },

  { id:'WEB-061', module:'Orders', feature:'Order Cancellation', type:'Positive',
    title:'Cancel pending order',
    pre:'Order in "pending" status',
    steps:'1. Open order detail\n2. Click Cancel\n3. Confirm',
    data:'orderId: 1\nstatus: pending',
    expected:'Order status = cancelled. Stock restored. Loyalty points deducted.',
    priority:'High' },

  { id:'WEB-062', module:'Orders', feature:'Order Cancellation', type:'Negative',
    title:'Attempt to cancel delivered order',
    pre:'Order status = delivered',
    steps:'1. Open delivered order\n2. Click Cancel',
    data:'orderId: 1\nstatus: delivered',
    expected:'Cancel button hidden/disabled OR error: "Delivered orders cannot be cancelled".',
    priority:'High' },

  { id:'WEB-063', module:'Orders', feature:'Order Cancellation', type:'Negative',
    title:'Cancel another user\'s order',
    pre:'OrderId belongs to different user',
    steps:'1. Send POST /orders/:id/cancel with another user\'s orderId',
    data:'orderId: 999 (owned by userId: 2)\ncurrent userId: 1',
    expected:'HTTP 403 or 404. Order not cancelled.',
    priority:'High' },

  { id:'WEB-064', module:'Orders', feature:'Order Tracking', type:'Positive',
    title:'View order tracking status',
    pre:'Order in shipped/out-for-delivery state',
    steps:'1. Open order detail\n2. View tracking section',
    data:'status: shipped',
    expected:'Tracking timeline shows confirmed→shipped stages highlighted.',
    priority:'Medium' },

  // ── USER ACCOUNT ──────────────────────────────────────────────────────
  { id:'WEB-065', module:'Account', feature:'Address Management', type:'Positive',
    title:'Add new delivery address',
    pre:'User logged in',
    steps:'1. Go to /account/addresses\n2. Click Add Address\n3. Fill all fields\n4. Save',
    data:'name, phone, line1, city, state, pincode',
    expected:'Address saved. Appears in address list and checkout address picker.',
    priority:'High' },

  { id:'WEB-066', module:'Account', feature:'Address Management', type:'Positive',
    title:'Edit existing address',
    pre:'User has saved address',
    steps:'1. Click Edit on address\n2. Modify phone\n3. Save',
    data:'Updated phone: 9000011111',
    expected:'Address updated. Changes reflected in checkout.',
    priority:'Medium' },

  { id:'WEB-067', module:'Account', feature:'Address Management', type:'Negative',
    title:'Delete address currently linked to active order',
    pre:'Address used in active order',
    steps:'1. Try to delete address linked to active order',
    data:'addressId: linked to pending order',
    expected:'Address soft-deleted (is_deleted=true) OR error if hard-delete attempted.',
    priority:'Medium' },

  { id:'WEB-068', module:'Account', feature:'Profile', type:'Positive',
    title:'View loyalty points balance',
    pre:'User has earned points',
    steps:'1. Navigate to /account or /profile',
    data:'first_citizen_points: 450',
    expected:'Points balance displayed. Conversion note (1 pt = ₹1) shown.',
    priority:'Medium' },

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────
  { id:'WEB-069', module:'Notifications', feature:'Order Notifications', type:'Positive',
    title:'Order confirmation SMS received after checkout',
    pre:'User has valid phone number',
    steps:'1. Complete checkout\n2. Check phone for SMS',
    data:'phone: 9876543210',
    expected:'SMS received with order ID and estimated delivery.',
    priority:'Medium' },

  // ── CMS ───────────────────────────────────────────────────────────────
  { id:'WEB-070', module:'CMS', feature:'Static Pages', type:'Positive',
    title:'View CMS page by slug',
    pre:'CMS page created in admin',
    steps:'1. Navigate to /page/:slug',
    data:'slug: about-us',
    expected:'Page content rendered from DB. Title and body shown.',
    priority:'Low' },
];

// ════════════════════════════════════════════════════════════════════════
//  SHEET 2 — ADMIN PANEL
// ════════════════════════════════════════════════════════════════════════
const adminTCs = [

  // ── AUTH ─────────────────────────────────────────────────────────────
  { id:'ADM-001', module:'Admin Auth', feature:'Admin Login', type:'Positive',
    title:'Login with valid admin credentials',
    pre:'Admin account exists (role=admin)',
    steps:'1. Navigate to /admin/login\n2. Enter admin email & password\n3. Click Login',
    data:'email: admin@shoppers.com\npassword: Admin@123',
    expected:'HTTP 200. Redirected to /admin/dashboard.',
    priority:'High' },

  { id:'ADM-002', module:'Admin Auth', feature:'Admin Login', type:'Negative',
    title:'Login with non-admin (customer) credentials',
    pre:'Regular user account exists',
    steps:'1. Navigate to /admin/login\n2. Enter customer credentials',
    data:'role: customer',
    expected:'HTTP 403. Error: "Admin access required".',
    priority:'High' },

  { id:'ADM-003', module:'Admin Auth', feature:'Route Guard', type:'Negative',
    title:'Access admin route without auth token',
    pre:'No login',
    steps:'1. Call GET /api/admin/products without Authorization header',
    data:'No token',
    expected:'HTTP 401. Error: "No token provided".',
    priority:'High' },

  { id:'ADM-004', module:'Admin Auth', feature:'Route Guard', type:'Negative',
    title:'Access admin route with customer token',
    pre:'Customer logged in',
    steps:'1. Call GET /api/admin/products with customer JWT',
    data:'Customer Bearer token',
    expected:'HTTP 403. Error: "Admin access required".',
    priority:'High' },

  // ── DASHBOARD ─────────────────────────────────────────────────────────
  { id:'ADM-005', module:'Dashboard', feature:'Stats', type:'Positive',
    title:'Dashboard loads all KPI stats',
    pre:'Data exists in DB',
    steps:'1. Navigate to /admin/dashboard',
    data:'None',
    expected:'Total orders, revenue, users, products, low-stock count all displayed.',
    priority:'High' },

  { id:'ADM-006', module:'Dashboard', feature:'Stats', type:'Edge Case',
    title:'Dashboard with zero data (fresh install)',
    pre:'Empty database',
    steps:'1. Load dashboard on clean DB',
    data:'All counts = 0',
    expected:'All metrics show 0. No JS errors. Charts render with empty state.',
    priority:'Medium' },

  // ── PRODUCTS ──────────────────────────────────────────────────────────
  { id:'ADM-007', module:'Products', feature:'Product List', type:'Positive',
    title:'List all products with pagination',
    pre:'Products exist in DB',
    steps:'1. Navigate to /admin/products',
    data:'page:1, limit:20',
    expected:'Products table shown with title, brand, category, stock, status columns.',
    priority:'High' },

  { id:'ADM-008', module:'Products', feature:'Product Search', type:'Positive',
    title:'Search products by title in admin',
    pre:'Products exist',
    steps:'1. Enter "shirt" in admin product search',
    data:'search: shirt',
    expected:'Filtered results. Only matching products shown.',
    priority:'High' },

  { id:'ADM-009', module:'Products', feature:'Create Product', type:'Positive',
    title:'Create new product with all fields',
    pre:'Brands and categories exist',
    steps:'1. Click Add Product\n2. Fill title, brand, category, price, stock, gender\n3. Upload image\n4. Save',
    data:'title: Test Shirt\nbrand_id: 1\ncategory_id: 2\nbase_price: 999\nstock: 50',
    expected:'Product created with status=active. Appears in list. Image stored.',
    priority:'High' },

  { id:'ADM-010', module:'Products', feature:'Create Product', type:'Validation',
    title:'Create product without required title',
    pre:'None',
    steps:'1. Submit product form with empty title',
    data:'title: (empty)',
    expected:'DB constraint error or client validation: "Title is required".',
    priority:'High' },

  { id:'ADM-011', module:'Products', feature:'Create Product', type:'Validation',
    title:'Create product with negative base price',
    pre:'None',
    steps:'1. Set base_price = -100\n2. Submit',
    data:'base_price: -100',
    expected:'Validation error: "Price must be positive".',
    priority:'Medium' },

  { id:'ADM-012', module:'Products', feature:'Create Product', type:'Validation',
    title:'Create product with discount_pct > 100',
    pre:'None',
    steps:'1. Set discount_pct = 150\n2. Submit',
    data:'discount_pct: 150',
    expected:'Validation error: "Discount cannot exceed 100%".',
    priority:'Medium' },

  { id:'ADM-013', module:'Products', feature:'Edit Product', type:'Positive',
    title:'Update product price',
    pre:'Product exists',
    steps:'1. Click Edit on product\n2. Change base_price to 1499\n3. Save',
    data:'base_price: 1499',
    expected:'Product updated. New price reflected on frontend.',
    priority:'High' },

  { id:'ADM-014', module:'Products', feature:'Deactivate Product', type:'Positive',
    title:'Deactivate product (soft delete)',
    pre:'Active product exists',
    steps:'1. Click Delete/Deactivate on product',
    data:'productId: 1',
    expected:'Product status = inactive. No longer visible on customer frontend.',
    priority:'High' },

  { id:'ADM-015', module:'Products', feature:'Deactivate Product', type:'Edge Case',
    title:'Deactivate product that is in active orders',
    pre:'Product in pending order',
    steps:'1. Deactivate product\n2. Check pending order',
    data:'productId: in active order',
    expected:'Product deactivated. Existing order items unaffected (already captured).',
    priority:'Medium' },

  // ── VARIANTS ──────────────────────────────────────────────────────────
  { id:'ADM-016', module:'Products', feature:'Variants', type:'Positive',
    title:'Add size variant to product',
    pre:'Product exists',
    steps:'1. Open product\n2. Click Add Variant\n3. Set size=L, stock=20, sku=SKU001',
    data:'size: L\nstock: 20\nextra_price: 0',
    expected:'Variant saved. Variant appears in list. Product total stock updated.',
    priority:'High' },

  { id:'ADM-017', module:'Products', feature:'Variants', type:'Positive',
    title:'Update variant stock',
    pre:'Variant exists',
    steps:'1. Click edit on variant\n2. Change stock to 50\n3. Save',
    data:'variantId: 1\nstock: 50',
    expected:'Variant stock updated. Inventory table also updated.',
    priority:'High' },

  { id:'ADM-018', module:'Products', feature:'Variants', type:'Negative',
    title:'Delete variant that is in active cart',
    pre:'Variant referenced in cart_items',
    steps:'1. Delete variant with active cart references',
    data:'variantId: in cart',
    expected:'Deletion succeeds (DB cascade) OR error shown. No orphaned cart items crash.',
    priority:'Medium' },

  // ── IMAGES ────────────────────────────────────────────────────────────
  { id:'ADM-019', module:'Products', feature:'Product Images', type:'Positive',
    title:'Upload product image',
    pre:'Product exists',
    steps:'1. Open product images tab\n2. Upload JPEG image',
    data:'File: test.jpg (< 5MB)',
    expected:'Image uploaded to /uploads/. Filename stored in product_images.',
    priority:'High' },

  { id:'ADM-020', module:'Products', feature:'Product Images', type:'Negative',
    title:'Upload non-image file as product image',
    pre:'Product exists',
    steps:'1. Try to upload .pdf or .exe as product image',
    data:'File: document.pdf',
    expected:'HTTP 400 or Multer error: "Only image files allowed".',
    priority:'High' },

  { id:'ADM-021', module:'Products', feature:'Product Images', type:'Edge Case',
    title:'Upload image > 5MB',
    pre:'Product exists',
    steps:'1. Upload a 10MB image file',
    data:'File: 10mb.jpg',
    expected:'HTTP 400. Error: "File too large".',
    priority:'Medium' },

  { id:'ADM-022', module:'Products', feature:'Product Images', type:'Positive',
    title:'Set primary image',
    pre:'Product has multiple images',
    steps:'1. Click "Set Primary" on second image',
    data:'imageId: 2\nproductId: 1',
    expected:'Image 2 is_primary=true. Other images is_primary=false.',
    priority:'Medium' },

  { id:'ADM-023', module:'Products', feature:'Product Images', type:'Positive',
    title:'Add image via URL',
    pre:'Product exists',
    steps:'1. Click "Add via URL"\n2. Paste image URL\n3. Save',
    data:'url: https://example.com/image.jpg',
    expected:'URL saved to product_images. Image preview shown.',
    priority:'Medium' },

  // ── CATEGORIES ────────────────────────────────────────────────────────
  { id:'ADM-024', module:'Categories', feature:'Category CRUD', type:'Positive',
    title:'Create parent category',
    pre:'None',
    steps:'1. Go to Admin Categories\n2. Add category\n3. Name=Men, Slug=men, no parent',
    data:'name: Men\nslug: men\nparent_id: null',
    expected:'Category created. Appears in category tree.',
    priority:'High' },

  { id:'ADM-025', module:'Categories', feature:'Category CRUD', type:'Positive',
    title:'Create subcategory under parent',
    pre:'Parent category Men exists',
    steps:'1. Add category\n2. Name=Shirts, parent_id=Men.id',
    data:'name: Shirts\nparent_id: 1',
    expected:'Subcategory created under Men. Products in Shirts appear in /category/men.',
    priority:'High' },

  { id:'ADM-026', module:'Categories', feature:'Category CRUD', type:'Negative',
    title:'Create category with duplicate slug',
    pre:'Category "men" already exists',
    steps:'1. Create another category with slug=men',
    data:'slug: men',
    expected:'DB unique constraint error. HTTP 409 or 500 with helpful message.',
    priority:'Medium' },

  { id:'ADM-027', module:'Categories', feature:'Category CRUD', type:'Negative',
    title:'Delete category with active products',
    pre:'Category has linked products',
    steps:'1. Click Delete on category with products',
    data:'categoryId: 1 (has products)',
    expected:'Error: "Category has products — cannot delete" OR cascade handled safely.',
    priority:'High' },

  // ── BRANDS ────────────────────────────────────────────────────────────
  { id:'ADM-028', module:'Brands', feature:'Brand CRUD', type:'Positive',
    title:'Create brand with logo',
    pre:'None',
    steps:'1. Add Brand\n2. Name=Nike, Slug=nike\n3. Upload logo PNG\n4. Save',
    data:'name: Nike\nslug: nike\nFile: nike-logo.png',
    expected:'Brand created. Logo stored in /uploads/.',
    priority:'High' },

  { id:'ADM-029', module:'Brands', feature:'Brand CRUD', type:'Negative',
    title:'Create brand with duplicate slug',
    pre:'Brand "nike" exists',
    steps:'1. Create brand with slug=nike',
    data:'slug: nike',
    expected:'Unique constraint error. Brand not duplicated.',
    priority:'Medium' },

  // ── ORDERS ────────────────────────────────────────────────────────────
  { id:'ADM-030', module:'Orders', feature:'Order Management', type:'Positive',
    title:'View all orders in admin',
    pre:'Orders in DB',
    steps:'1. Navigate to Admin Orders',
    data:'page:1',
    expected:'Order list with ID, user, total, status, date.',
    priority:'High' },

  { id:'ADM-031', module:'Orders', feature:'Order Status Update', type:'Positive',
    title:'Update order status from pending to confirmed',
    pre:'Order in pending status',
    steps:'1. Open order\n2. Change status to "confirmed"\n3. Save',
    data:'orderId: 1\nstatus: confirmed',
    expected:'Status updated. User notification created. HTTP 200.',
    priority:'High' },

  { id:'ADM-032', module:'Orders', feature:'Order Status Update', type:'Positive',
    title:'Update order status to shipped',
    pre:'Order in confirmed state',
    steps:'1. Change status to shipped',
    data:'orderId: 1\nstatus: shipped',
    expected:'Status = shipped. Notification: "Your order #ORD-1 has been shipped".',
    priority:'High' },

  { id:'ADM-033', module:'Orders', feature:'Order Status Update', type:'Negative',
    title:'Update non-existent order status',
    pre:'None',
    steps:'1. PUT /admin/orders/99999/status with status=confirmed',
    data:'orderId: 99999',
    expected:'HTTP 404. Error: "Order not found".',
    priority:'Medium' },

  { id:'ADM-034', module:'Orders', feature:'Pickup Status', type:'Positive',
    title:'Update store pickup status to ready',
    pre:'Store pickup order exists',
    steps:'1. Open store pickup order\n2. Set pickup_status=ready',
    data:'orderId: 1\nstatus: ready',
    expected:'pickup_status updated to ready. Customer notified.',
    priority:'High' },

  { id:'ADM-035', module:'Orders', feature:'Pickup Status', type:'Validation',
    title:'Set invalid pickup status',
    pre:'Store pickup order exists',
    steps:'1. PUT /admin/orders/:id/pickup-status with status=wrong',
    data:'status: wrong',
    expected:'HTTP 400. Error: "Invalid pickup status".',
    priority:'Medium' },

  // ── COUPONS ───────────────────────────────────────────────────────────
  { id:'ADM-036', module:'Coupons', feature:'Coupon CRUD', type:'Positive',
    title:'Create flat-discount coupon',
    pre:'None',
    steps:'1. Go to Admin Coupons\n2. Create coupon: code=SAVE100, type=flat, value=100, min_order=500',
    data:'code: SAVE100\ntype: flat\nvalue: 100\nmin_order: 500\nexpiry: future date',
    expected:'Coupon created. Usable at checkout.',
    priority:'High' },

  { id:'ADM-037', module:'Coupons', feature:'Coupon CRUD', type:'Positive',
    title:'Create percentage coupon with cap',
    pre:'None',
    steps:'1. Create coupon: type=percent, value=20, max_discount=500',
    data:'type: percent\nvalue: 20\nmax_discount: 500',
    expected:'20% off applied, capped at ₹500.',
    priority:'High' },

  { id:'ADM-038', module:'Coupons', feature:'Coupon CRUD', type:'Negative',
    title:'Create coupon with past expiry date',
    pre:'None',
    steps:'1. Set expiry to yesterday\n2. Save coupon',
    data:'expires_at: 2020-01-01',
    expected:'Validation error: "Expiry date must be in the future" OR coupon created but immediately flagged expired.',
    priority:'Medium' },

  { id:'ADM-039', module:'Coupons', feature:'Coupon CRUD', type:'Edge Case',
    title:'Create coupon with usage_limit = 1 (single-use)',
    pre:'None',
    steps:'1. Create coupon with usage_limit=1\n2. User 1 applies it\n3. User 2 tries to apply',
    data:'usage_limit: 1',
    expected:'Coupon applied for user 1. Error for user 2: "Coupon limit reached".',
    priority:'High' },

  // ── BANNERS ───────────────────────────────────────────────────────────
  { id:'ADM-040', module:'Banners', feature:'Banner CRUD', type:'Positive',
    title:'Create banner with image upload',
    pre:'None',
    steps:'1. Go to Admin Banners\n2. Create: title, link_url, upload image\n3. Save',
    data:'title: Summer Sale\nlink_url: /sale\nFile: banner.jpg',
    expected:'Banner created. Visible on homepage.',
    priority:'Medium' },

  { id:'ADM-041', module:'Banners', feature:'Banner CRUD', type:'Positive',
    title:'Create banner via image URL',
    pre:'None',
    steps:'1. Create banner providing image URL instead of uploading',
    data:'image_url: https://cdn.example.com/banner.jpg',
    expected:'Banner created with URL stored.',
    priority:'Medium' },

  // ── INVENTORY ─────────────────────────────────────────────────────────
  { id:'ADM-042', module:'Inventory', feature:'Stock Update', type:'Positive',
    title:'Update variant stock via inventory module',
    pre:'Variant exists',
    steps:'1. Go to Admin Inventory\n2. Find variant\n3. Set stock to 100\n4. Save',
    data:'variantId: 1\nnew_stock: 100',
    expected:'product_variants.stock=100. inventory.stock_quantity=100. Log entry created.',
    priority:'High' },

  { id:'ADM-043', module:'Inventory', feature:'Stock Update', type:'Validation',
    title:'Set stock to negative value',
    pre:'Variant exists',
    steps:'1. Set stock to -5\n2. Save',
    data:'stock: -5',
    expected:'Validation error: "Stock cannot be negative".',
    priority:'High' },

  { id:'ADM-044', module:'Inventory', feature:'Low Stock Alert', type:'Positive',
    title:'Low stock report shows variants below threshold',
    pre:'Variants with stock < 5',
    steps:'1. Navigate to Admin Inventory → Low Stock',
    data:'threshold: 5',
    expected:'All variants with stock < 5 listed.',
    priority:'Medium' },

  { id:'ADM-045', module:'Inventory', feature:'Inventory Logs', type:'Positive',
    title:'Inventory log records every stock change',
    pre:'Stock updated at least once',
    steps:'1. Update variant stock\n2. View inventory logs',
    data:'variantId: 1',
    expected:'Log entry with old_qty, new_qty, reason, timestamp.',
    priority:'Medium' },

  // ── DELIVERY ──────────────────────────────────────────────────────────
  { id:'ADM-046', module:'Delivery', feature:'Store Management', type:'Positive',
    title:'Add pickup store',
    pre:'None',
    steps:'1. Admin → Delivery → Stores\n2. Add store: name, city, state, address, pincode',
    data:'name: Main Store\ncity: Mumbai\nstate: MH\naddress: 123 Main St\npincode: 400001',
    expected:'Store added. Appears in store list. Available at checkout.',
    priority:'High' },

  { id:'ADM-047', module:'Delivery', feature:'Store Management', type:'Validation',
    title:'Add store without required fields',
    pre:'None',
    steps:'1. Submit store form with missing name',
    data:'name: (empty)',
    expected:'HTTP 400. Error: "name, city, state, address, pincode are required".',
    priority:'Medium' },

  { id:'ADM-048', module:'Delivery', feature:'Pincode Management', type:'Positive',
    title:'Add express-eligible pincode',
    pre:'None',
    steps:'1. Admin → Delivery → Pincodes\n2. Add pincode: 400001, city Mumbai, is_express=true',
    data:'pincode: 400001\ncity: Mumbai\nis_express: true\ndelivery_hrs: 24',
    expected:'Pincode added. Express option available for this pincode at checkout.',
    priority:'High' },

  { id:'ADM-049', module:'Delivery', feature:'Pincode Management', type:'Validation',
    title:'Add pincode with invalid format (non-6-digit)',
    pre:'None',
    steps:'1. Enter pincode "12345" (5 digits)',
    data:'pincode: 12345',
    expected:'HTTP 400. Error: "Enter a valid 6-digit pincode".',
    priority:'High' },

  { id:'ADM-050', module:'Delivery', feature:'Pincode Management', type:'Validation',
    title:'Add pincode with alphabets',
    pre:'None',
    steps:'1. Enter pincode "ABCDEF"',
    data:'pincode: ABCDEF',
    expected:'HTTP 400. Error: "Enter a valid 6-digit pincode".',
    priority:'Medium' },

  // ── USERS ─────────────────────────────────────────────────────────────
  { id:'ADM-051', module:'Users', feature:'User Management', type:'Positive',
    title:'List all users in admin',
    pre:'Users exist',
    steps:'1. Navigate to Admin → Users',
    data:'page: 1',
    expected:'User list with name, email, phone, status, points, registration date.',
    priority:'Medium' },

  { id:'ADM-052', module:'Users', feature:'User Management', type:'Positive',
    title:'Deactivate customer account',
    pre:'Active customer exists',
    steps:'1. Click deactivate/toggle on user\n2. Confirm',
    data:'userId: 2\nis_active: false',
    expected:'User is_active=false. User cannot log in.',
    priority:'High' },

  { id:'ADM-053', module:'Users', feature:'User Management', type:'Negative',
    title:'Attempt to deactivate admin account',
    pre:'Admin account exists',
    steps:'1. PATCH /admin/users/:adminId/status with is_active=false',
    data:'userId: admin user',
    expected:'HTTP 404 or 403. Error: "Cannot modify admin accounts".',
    priority:'High' },

  { id:'ADM-054', module:'Users', feature:'User Management', type:'Validation',
    title:'PATCH user status with non-boolean is_active',
    pre:'User exists',
    steps:'1. PATCH /admin/users/:id/status with is_active="yes"',
    data:'is_active: "yes"',
    expected:'HTTP 400. Error: "is_active must be a boolean".',
    priority:'Medium' },

  // ── PAYMENT METHODS ────────────────────────────────────────────────────
  { id:'ADM-055', module:'Payment Methods', feature:'Payment Config', type:'Positive',
    title:'Add new payment method',
    pre:'None',
    steps:'1. Admin → Payment Methods\n2. Add: name=UPI, code=upi, is_active=true',
    data:'name: UPI\ncode: upi\nis_active: true',
    expected:'Payment method created. Appears at checkout.',
    priority:'Medium' },

  { id:'ADM-056', module:'Payment Methods', feature:'Payment Config', type:'Positive',
    title:'Disable payment method',
    pre:'Active payment method exists',
    steps:'1. Toggle off a payment method',
    data:'is_active: false',
    expected:'Method hidden from /api/payments/methods. Not selectable at checkout.',
    priority:'High' },

  // ── CMS PAGES ─────────────────────────────────────────────────────────
  { id:'ADM-057', module:'CMS', feature:'Page Management', type:'Positive',
    title:'Create CMS page',
    pre:'None',
    steps:'1. Admin → Pages\n2. Create: title=About Us, slug=about-us, content=HTML',
    data:'title: About Us\nslug: about-us\ncontent: <p>Our story...</p>',
    expected:'Page created. Accessible at /page/about-us on frontend.',
    priority:'Medium' },

  { id:'ADM-058', module:'CMS', feature:'Page Management', type:'Negative',
    title:'Delete non-existent CMS page',
    pre:'None',
    steps:'1. DELETE /admin/pages/99999',
    data:'pageId: 99999',
    expected:'HTTP 404. Error: "Page not found".',
    priority:'Low' },
];

// ════════════════════════════════════════════════════════════════════════
//  SHEET 3 — API TEST CASES
// ════════════════════════════════════════════════════════════════════════
const apiTCs = [

  // ── AUTH API ──────────────────────────────────────────────────────────
  { id:'API-001', module:'Auth API', feature:'POST /auth/register', type:'Positive',
    title:'Register returns 201 with user object',
    pre:'None',
    steps:'POST /api/auth/register\nBody: {email, password, fullName}',
    data:'{"email":"new@test.com","password":"Test@1234","fullName":"Jane Doe"}',
    expected:'HTTP 201. Body: {success:true, data:{accessToken, user:{id,email,role}}}',
    priority:'High' },

  { id:'API-002', module:'Auth API', feature:'POST /auth/register', type:'Validation',
    title:'Register with missing password returns 400',
    pre:'None',
    steps:'POST /api/auth/register without password field',
    data:'{"email":"new@test.com"}',
    expected:'HTTP 400. Body: {success:false, message: Joi validation error}',
    priority:'High' },

  { id:'API-003', module:'Auth API', feature:'POST /auth/login', type:'Positive',
    title:'Login returns access token and sets refresh cookie',
    pre:'User registered',
    steps:'POST /api/auth/login with valid credentials',
    data:'{"email":"test@example.com","password":"Test@1234"}',
    expected:'HTTP 200. Body: {accessToken}. Set-Cookie header with refreshToken (httpOnly).',
    priority:'High' },

  { id:'API-004', module:'Auth API', feature:'POST /auth/refresh', type:'Positive',
    title:'Refresh token returns new access token',
    pre:'Valid refreshToken cookie present',
    steps:'POST /api/auth/refresh (cookie auto-sent)',
    data:'Cookie: refreshToken=valid_jwt',
    expected:'HTTP 200. New accessToken in response body.',
    priority:'High' },

  { id:'API-005', module:'Auth API', feature:'POST /auth/refresh', type:'Negative',
    title:'Refresh with missing/invalid cookie returns 401',
    pre:'No cookie',
    steps:'POST /api/auth/refresh with no cookie',
    data:'No cookie',
    expected:'HTTP 401. Error: "No refresh token".',
    priority:'High' },

  { id:'API-006', module:'Auth API', feature:'POST /auth/logout', type:'Positive',
    title:'Logout clears refresh token cookie',
    pre:'User logged in',
    steps:'POST /api/auth/logout',
    data:'Cookie: refreshToken=valid',
    expected:'HTTP 200. Set-Cookie clears refreshToken. DB token removed.',
    priority:'High' },

  { id:'API-007', module:'Auth API', feature:'POST /auth/verify-otp', type:'Validation',
    title:'OTP must be exactly 6 digits',
    pre:'OTP sent',
    steps:'POST /api/auth/verify-otp with otp="12345" (5 digits)',
    data:'{"phone":"9876543210","otp":"12345"}',
    expected:'HTTP 400. Joi error: "otp length must be 6 characters".',
    priority:'Medium' },

  // ── PRODUCTS API ──────────────────────────────────────────────────────
  { id:'API-008', module:'Products API', feature:'GET /products', type:'Positive',
    title:'Get paginated product list',
    pre:'Active products exist',
    steps:'GET /api/products?page=1&limit=10',
    data:'page=1&limit=10',
    expected:'HTTP 200. Array of max 10 products. Each has: id,title,slug,base_price,image_url,total_count.',
    priority:'High' },

  { id:'API-009', module:'Products API', feature:'GET /products', type:'Positive',
    title:'Filter by gender returns correct products',
    pre:'Products with gender=Women',
    steps:'GET /api/products?gender=Women',
    data:'gender=Women',
    expected:'All returned products have gender=Women.',
    priority:'High' },

  { id:'API-010', module:'Products API', feature:'GET /products', type:'Positive',
    title:'Category filter uses recursive CTE (includes subcategories)',
    pre:'Men category with Shirts subcategory',
    steps:'GET /api/products?category=men',
    data:'category=men',
    expected:'Products from Men AND all subcategories (Shirts, Trousers, etc.) returned.',
    priority:'High' },

  { id:'API-011', module:'Products API', feature:'GET /products/:slug', type:'Positive',
    title:'Get product detail by slug',
    pre:'Active product with slug=blue-shirt',
    steps:'GET /api/products/blue-shirt',
    data:'slug: blue-shirt',
    expected:'HTTP 200. Product with images[], variants[], attributes[] arrays.',
    priority:'High' },

  { id:'API-012', module:'Products API', feature:'GET /products/:slug', type:'Negative',
    title:'Non-existent slug returns 404',
    pre:'None',
    steps:'GET /api/products/non-existent-slug',
    data:'slug: non-existent-slug',
    expected:'HTTP 404. {success:false, message:"Product not found"}.',
    priority:'High' },

  { id:'API-013', module:'Products API', feature:'GET /products/search', type:'Positive',
    title:'Search products returns ranked results',
    pre:'Products with title "Blue Shirt"',
    steps:'GET /api/products/search?q=blue+shirt',
    data:'q=blue shirt',
    expected:'HTTP 200. Results ordered by ts_rank DESC. Each has rank field.',
    priority:'High' },

  { id:'API-014', module:'Products API', feature:'GET /products/search', type:'Edge Case',
    title:'SQL injection attempt in search query',
    pre:'None',
    steps:'GET /api/products/search?q=\' OR 1=1 --',
    data:'q: \' OR 1=1 --',
    expected:'HTTP 200 with empty/safe results. NO SQL execution. Parameterized query protects.',
    priority:'High' },

  // ── CART API ──────────────────────────────────────────────────────────
  { id:'API-015', module:'Cart API', feature:'GET /cart', type:'Positive',
    title:'Get authenticated user cart',
    pre:'User logged in; cart has items',
    steps:'GET /api/cart with valid Bearer token',
    data:'Authorization: Bearer <token>',
    expected:'HTTP 200. Array of cart items with productId,variantId,quantity,unitPrice,lineTotal.',
    priority:'High' },

  { id:'API-016', module:'Cart API', feature:'GET /cart', type:'Negative',
    title:'Get cart without auth token returns 401',
    pre:'No token',
    steps:'GET /api/cart without Authorization header',
    data:'No token',
    expected:'HTTP 401. {success:false, message:"No token provided"}.',
    priority:'High' },

  { id:'API-017', module:'Cart API', feature:'POST /cart', type:'Positive',
    title:'Add item to cart',
    pre:'User logged in; in-stock product',
    steps:'POST /api/cart with productId, variantId, quantity',
    data:'{"productId":1,"variantId":5,"quantity":1}',
    expected:'HTTP 200 or 201. Cart item created. Stock not yet deducted.',
    priority:'High' },

  { id:'API-018', module:'Cart API', feature:'POST /cart', type:'Negative',
    title:'Add item with insufficient stock',
    pre:'Variant stock = 1; request qty = 5',
    steps:'POST /api/cart with quantity=5',
    data:'{"productId":1,"variantId":5,"quantity":5}',
    expected:'HTTP 409. Error: "Insufficient stock".',
    priority:'High' },

  { id:'API-019', module:'Cart API', feature:'PUT /cart/:itemId', type:'Positive',
    title:'Update cart item quantity',
    pre:'Item in cart',
    steps:'PUT /api/cart/1 with {quantity:3}',
    data:'{"quantity":3}',
    expected:'HTTP 200. Line total recalculated. Updated cart item returned.',
    priority:'High' },

  { id:'API-020', module:'Cart API', feature:'DELETE /cart/:itemId', type:'Positive',
    title:'Remove item from cart',
    pre:'Item in cart',
    steps:'DELETE /api/cart/1',
    data:'itemId: 1',
    expected:'HTTP 200. Item removed. Cart total updated.',
    priority:'High' },

  { id:'API-021', module:'Cart API', feature:'DELETE /cart/:itemId', type:'Negative',
    title:'Delete another user\'s cart item',
    pre:'Cart item belongs to user 2',
    steps:'DELETE /api/cart/99 as user 1',
    data:'itemId: 99 (owned by user 2)',
    expected:'HTTP 404 or 403. Item not deleted.',
    priority:'High' },

  // ── PAYMENTS API ──────────────────────────────────────────────────────
  { id:'API-022', module:'Payments API', feature:'GET /payments/methods', type:'Positive',
    title:'Get active payment methods (public endpoint)',
    pre:'Active payment methods in DB',
    steps:'GET /api/payments/methods (no auth)',
    data:'No auth required',
    expected:'HTTP 200. Array of active payment methods.',
    priority:'Medium' },

  { id:'API-023', module:'Payments API', feature:'POST /payments/create-order', type:'Positive',
    title:'Create Razorpay order',
    pre:'User logged in; non-empty cart; valid address',
    steps:'POST /api/payments/create-order with addressId',
    data:'{"addressId":1,"deliveryType":"standard"}',
    expected:'HTTP 200. {razorpayOrderId, amount, currency, keyId, subtotal, shipping, total}.',
    priority:'High' },

  { id:'API-024', module:'Payments API', feature:'POST /payments/create-order', type:'Negative',
    title:'Create order with empty cart',
    pre:'User logged in; empty cart',
    steps:'POST /api/payments/create-order',
    data:'{"addressId":1}',
    expected:'HTTP 400. Error: "Cart is empty".',
    priority:'High' },

  { id:'API-025', module:'Payments API', feature:'POST /payments/create-order', type:'Negative',
    title:'Create order with invalid addressId',
    pre:'User logged in',
    steps:'POST /api/payments/create-order with addressId not owned by user',
    data:'{"addressId":9999}',
    expected:'HTTP 400. Error: "Invalid address".',
    priority:'High' },

  { id:'API-026', module:'Payments API', feature:'POST /payments/create-order', type:'Edge Case',
    title:'Create order when variant goes out of stock mid-flow',
    pre:'Stock = 1; concurrent requests',
    steps:'1. Simultaneous checkout by 2 users for last item',
    data:'variantId stock: 1',
    expected:'First succeeds. Second gets HTTP 409: "Out of stock".',
    priority:'High' },

  { id:'API-027', module:'Payments API', feature:'POST /payments/verify', type:'Positive',
    title:'Verify valid Razorpay payment',
    pre:'Razorpay order created; valid payment completed',
    steps:'POST /api/payments/verify with valid signature',
    data:'{"razorpayOrderId":"order_xxx","razorpayPaymentId":"pay_xxx","razorpaySignature":"valid_hmac","addressId":1,...}',
    expected:'HTTP 200. Order created in DB. Cart cleared. Stock deducted. SMS sent.',
    priority:'High' },

  { id:'API-028', module:'Payments API', feature:'POST /payments/verify', type:'Negative',
    title:'Verify payment with wrong signature',
    pre:'None',
    steps:'POST /api/payments/verify with tampered razorpaySignature',
    data:'{"razorpaySignature":"wrong"}',
    expected:'HTTP 400. Error: "Payment verification failed". No order created.',
    priority:'High' },

  { id:'API-029', module:'Payments API', feature:'POST /payments/create-cod-order', type:'Positive',
    title:'Place COD order successfully',
    pre:'User logged in; non-empty cart; address',
    steps:'POST /api/payments/create-cod-order',
    data:'{"addressId":1,"deliveryType":"standard"}',
    expected:'HTTP 200. Order created with payment_method=cod. {orderId} returned.',
    priority:'High' },

  { id:'API-030', module:'Payments API', feature:'POST /payments/create-cod-order', type:'Edge Case',
    title:'COD order with loyalty points reduces total',
    pre:'User has 500 points; subtotal ₹1000',
    steps:'POST /api/payments/create-cod-order with usePoints=true',
    data:'{"addressId":1,"usePoints":true}',
    expected:'Points up to 20% (₹200) deducted from total. User points decremented.',
    priority:'High' },

  // ── ORDERS API ────────────────────────────────────────────────────────
  { id:'API-031', module:'Orders API', feature:'GET /orders', type:'Positive',
    title:'List user orders',
    pre:'User has placed orders',
    steps:'GET /api/orders with valid token',
    data:'Authorization: Bearer <token>',
    expected:'HTTP 200. Array of user\'s own orders only.',
    priority:'High' },

  { id:'API-032', module:'Orders API', feature:'GET /orders/:id', type:'Negative',
    title:'Fetch order belonging to another user',
    pre:'OrderId owned by user 2',
    steps:'GET /api/orders/:id as user 1',
    data:'orderId: other user\'s order',
    expected:'HTTP 404. Order not returned (user isolation enforced).',
    priority:'High' },

  { id:'API-033', module:'Orders API', feature:'POST /orders/:id/cancel', type:'Positive',
    title:'Cancel pending order restores stock',
    pre:'Pending order with variant qty=2',
    steps:'POST /api/orders/:id/cancel',
    data:'orderId: pending order',
    expected:'Order status=cancelled. product_variants.stock +2. inventory updated.',
    priority:'High' },

  { id:'API-034', module:'Orders API', feature:'POST /orders/:id/cancel', type:'Negative',
    title:'Cancel already-cancelled order',
    pre:'Order already cancelled',
    steps:'POST /api/orders/:id/cancel again',
    data:'orderId: cancelled order',
    expected:'HTTP 400 or 409. Error: "Order already cancelled".',
    priority:'Medium' },

  // ── COUPON API ────────────────────────────────────────────────────────
  { id:'API-035', module:'Coupons API', feature:'POST /coupons/validate', type:'Positive',
    title:'Validate active coupon',
    pre:'Coupon SAVE100 active; min_order met',
    steps:'POST /api/coupons/validate',
    data:'{"code":"SAVE100","subtotal":1500}',
    expected:'HTTP 200. {valid:true, discount:100, couponId:1}.',
    priority:'High' },

  { id:'API-036', module:'Coupons API', feature:'POST /coupons/validate', type:'Negative',
    title:'Validate coupon user already used (per_user_limit=1)',
    pre:'User already used coupon once',
    steps:'POST /api/coupons/validate same coupon again',
    data:'{"code":"ONCE","subtotal":2000}',
    expected:'HTTP 200 with {valid:false, reason:"You have already used this coupon"}.',
    priority:'High' },

  { id:'API-037', module:'Coupons API', feature:'POST /coupons/validate', type:'Edge Case',
    title:'Validate coupon with global limit exactly reached',
    pre:'Coupon usage_limit=100; used_count=100',
    steps:'POST /api/coupons/validate',
    data:'{"code":"LIMITREACHED"}',
    expected:'{valid:false, reason:"Coupon limit reached"}.',
    priority:'High' },

  // ── ACCOUNT/ADDRESSES API ─────────────────────────────────────────────
  { id:'API-038', module:'Account API', feature:'GET /account/addresses', type:'Positive',
    title:'Get user addresses',
    pre:'User has 2 addresses',
    steps:'GET /api/account/addresses',
    data:'Bearer token',
    expected:'HTTP 200. Array of 2 active (non-deleted) addresses.',
    priority:'Medium' },

  { id:'API-039', module:'Account API', feature:'POST /account/addresses', type:'Validation',
    title:'Add address with missing pincode',
    pre:'User logged in',
    steps:'POST /api/account/addresses without pincode',
    data:'{"name":"John","phone":"9876543210","line1":"123 Main"}',
    expected:'HTTP 400. Error: "Pincode is required".',
    priority:'Medium' },

  // ── INVENTORY API ─────────────────────────────────────────────────────
  { id:'API-040', module:'Inventory API', feature:'PUT /inventory/variants/:id/stock', type:'Positive',
    title:'Set variant stock via inventory module',
    pre:'Admin logged in; variant exists',
    steps:'PUT /api/inventory/variants/1/stock with {stock:50, reason:"restock"}',
    data:'{"stock":50,"reason":"restock"}',
    expected:'HTTP 200. product_variants.stock=50. inventory.stock_quantity=50. Log created.',
    priority:'High' },

  { id:'API-041', module:'Inventory API', feature:'GET /inventory/low-stock', type:'Positive',
    title:'Get low-stock variants',
    pre:'Admin; variants with stock < threshold',
    steps:'GET /api/inventory/low-stock?threshold=5',
    data:'threshold=5',
    expected:'HTTP 200. Array of variants with stock ≤ 5.',
    priority:'Medium' },

  { id:'API-042', module:'Inventory API', feature:'POST /inventory/bulk-update', type:'Positive',
    title:'Bulk update multiple variant stocks',
    pre:'Admin; multiple variants',
    steps:'POST /api/inventory/bulk-update with array of {variantId, stock}',
    data:'[{"variantId":1,"stock":100},{"variantId":2,"stock":50}]',
    expected:'HTTP 200. All variants updated. Logs created for each.',
    priority:'Medium' },

  // ── SECURITY ─────────────────────────────────────────────────────────
  { id:'API-043', module:'Security', feature:'Rate Limiting', type:'Negative',
    title:'Auth endpoint rate limit (10 req/min)',
    pre:'None',
    steps:'Send 11 POST /auth/login in under 1 minute',
    data:'11 rapid requests',
    expected:'11th request returns HTTP 429. "Too many requests".',
    priority:'High' },

  { id:'API-044', module:'Security', feature:'Rate Limiting', type:'Negative',
    title:'Global rate limit (1000 req/15min)',
    pre:'None',
    steps:'Send 1001 requests in 15 minutes',
    data:'1001 rapid requests',
    expected:'1001st request returns HTTP 429.',
    priority:'Medium' },

  { id:'API-045', module:'Security', feature:'CORS', type:'Negative',
    title:'Request from unauthorized origin blocked',
    pre:'CORS configured to allow only CLIENT_URL',
    steps:'Send request with Origin: http://evil.com',
    data:'Origin: http://evil.com',
    expected:'CORS error. No Access-Control-Allow-Origin header returned.',
    priority:'High' },

  { id:'API-046', module:'Security', feature:'SQL Injection', type:'Negative',
    title:'SQL injection in product filter params',
    pre:'None',
    steps:'GET /api/products?brand=1\'; DROP TABLE products; --',
    data:'brand: 1\'; DROP TABLE products; --',
    expected:'Query runs safely (parameterized). No DB modification. Empty/normal result.',
    priority:'High' },

  { id:'API-047', module:'Security', feature:'Auth Header', type:'Negative',
    title:'Malformed Bearer token rejected',
    pre:'None',
    steps:'Send request with Authorization: Bearer invalid.token.here',
    data:'Authorization: Bearer garbage',
    expected:'HTTP 401. Error: "Invalid or expired token".',
    priority:'High' },

  { id:'API-048', module:'Security', feature:'CSP/Helmet', type:'Positive',
    title:'Response headers include security headers',
    pre:'Server running',
    steps:'GET any /api endpoint; inspect response headers',
    data:'None',
    expected:'Headers present: X-Content-Type-Options, X-Frame-Options, Content-Security-Policy.',
    priority:'Medium' },

  // ── WISHLIST API ──────────────────────────────────────────────────────
  { id:'API-049', module:'Wishlist API', feature:'POST /wishlist', type:'Positive',
    title:'Add product to wishlist',
    pre:'User logged in; product exists',
    steps:'POST /api/wishlist with {productId:1}',
    data:'{"productId":1}',
    expected:'HTTP 200 or 201. Product in wishlist.',
    priority:'Medium' },

  { id:'API-050', module:'Wishlist API', feature:'POST /wishlist', type:'Edge Case',
    title:'Add same product to wishlist twice',
    pre:'Product already in wishlist',
    steps:'POST /api/wishlist with same productId again',
    data:'{"productId":1}',
    expected:'Idempotent — no duplicate. HTTP 200 or upsert behavior.',
    priority:'Medium' },
];

// ─── Build the workbook ───────────────────────────────────────────────────────
makeSheet('Website Tests', websiteTCs);
makeSheet('Admin Panel Tests', adminTCs);
makeSheet('API Tests', apiTCs);

// ── Summary Sheet ─────────────────────────────────────────────────────────────
const sumWs = wb.addWorksheet('Summary', { tabColor: { argb: '1F3864' } });
sumWs.columns = [
  { key: 'a', width: 30 },
  { key: 'b', width: 16 },
  { key: 'c', width: 16 },
];

const addSumRow = (label, val, bold = false, bg = null) => {
  const row = sumWs.addRow([label, val]);
  row.getCell(1).font = { bold };
  row.getCell(2).font = { bold };
  if (bg) {
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
    row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
  }
  row.getCell(2).alignment = { horizontal: 'center' };
};

sumWs.mergeCells('A1:B1');
const sh = sumWs.getCell('A1');
sh.value = 'ShopperHub — Test Coverage Summary';
sh.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
sh.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } };
sh.alignment = { horizontal: 'center', vertical: 'middle' };
sumWs.getRow(1).height = 28;

sumWs.addRow(['', '']);
addSumRow('Sheet', 'Test Count', true, 'D6E4F0');
addSumRow('Website Tests',      websiteTCs.length, false, 'E2EFDA');
addSumRow('Admin Panel Tests',  adminTCs.length,   false, 'E2EFDA');
addSumRow('API Tests',          apiTCs.length,     false, 'E2EFDA');
addSumRow('TOTAL', websiteTCs.length + adminTCs.length + apiTCs.length, true, 'BDD7EE');

sumWs.addRow(['', '']);
addSumRow('Breakdown by Type', 'Count', true, 'D6E4F0');

const allTCs = [...websiteTCs, ...adminTCs, ...apiTCs];
const byType = {};
allTCs.forEach(tc => { byType[tc.type] = (byType[tc.type] || 0) + 1; });
Object.entries(byType).forEach(([type, count]) => {
  const { bg } = typeColor(type);
  addSumRow(type, count, false, bg);
});

sumWs.addRow(['', '']);
addSumRow('Breakdown by Priority', 'Count', true, 'D6E4F0');
const byPri = {};
allTCs.forEach(tc => { byPri[tc.priority] = (byPri[tc.priority] || 0) + 1; });
Object.entries(byPri).forEach(([pri, count]) => {
  const bg = pri === 'High' ? 'FFD7D7' : pri === 'Medium' ? 'FFF2CC' : 'E2EFDA';
  addSumRow(pri, count, false, bg);
});

sumWs.addRow(['', '']);
addSumRow('Generated', new Date().toLocaleString('en-IN'), false);
addSumRow('Project', 'ShopperHub v1.0', false);
addSumRow('QA Engineer', 'Senior QA — Auto-generated', false);

// ─── Save ─────────────────────────────────────────────────────────────────────
const outPath = 'ShopperHub-TestCases.xlsx';
await wb.xlsx.writeFile(outPath);
console.log(`✓ Excel generated: ${outPath}`);
console.log(`  Website:  ${websiteTCs.length} test cases`);
console.log(`  Admin:    ${adminTCs.length} test cases`);
console.log(`  API:      ${apiTCs.length} test cases`);
console.log(`  TOTAL:    ${allTCs.length} test cases`);
