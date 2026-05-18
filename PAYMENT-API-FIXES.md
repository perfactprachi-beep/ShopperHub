# Payment API - Bad Gateway & Authentication Fixes

## Issues Identified
1. **Bad Gateway Error** on `/api/payments/create-order`
2. **Authentication Failure** - Token not being validated properly

---

## Root Causes
- Backend server on port 5000 may not be running
- PostgreSQL database on port 5433 may not be accessible
- Authentication token not properly sent or verified
- Axios interceptor not properly handling token injection

---

## Troubleshooting Checklist

### **Step 1: Start Backend Server**
```bash
cd server
npm install  # Only if dependencies not installed
npm start
```

**Expected output:**
```
Server running on http://localhost:5000
DB connected at [timestamp]
```

If you see database connection errors:
- Verify PostgreSQL is running on port 5433
- Or update `.env` DATABASE_URL to use port 5432 if that's where PostgreSQL is running
- Default: `postgresql://postgres:Pr%40123456@localhost:5432/shoppersstop`

---

### **Step 2: Verify Client Configuration**

Check that `client/.env` contains:
```env
VITE_API_BASE=/api
VITE_RAZORPAY_KEY_ID=rzp_test_SqXVOX6L0S5Rdg
```

The `/api` path is correct - Vite will proxy it to `http://localhost:5000/api`

---

### **Step 3: Test Login & Token Storage**

1. Make sure you're **logged in** before attempting to call `/api/payments/create-order`
2. After login, check browser DevTools:
   - **Application → Storage → Local Storage**
   - Look for `auth` key
   - Verify `accessToken` is stored

---

### **Step 4: Check Console Logs**

#### **Backend Console** (while running server):
Look for logs like:
```
[authGuard] Token verified for user: 123
[createOrder] User ID: 123 Address ID: 1
```

#### **Browser Console** (DevTools):
Look for logs like:
```
[axios] Request to: /api/payments/create-order Token present: true
[axios] Error status: 401
```

If `Token present: false`, the token is not being stored or read correctly.

---

### **Step 5: Verify CORS & Credentials**

Your Vite config already has proxy setup:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  }
}
```

And axios is configured with:
```javascript
withCredentials: true,
```

This should handle CORS properly during development.

---

## Testing the Payment API

### **Using Browser DevTools (Network Tab)**

1. Open DevTools → Network tab
2. Filter by XHR requests
3. Click "Create Order" / "Checkout" button
4. Look for POST to `/api/payments/create-order`
5. Check:
   - **Request Headers** → Authorization header present?
   - **Response Status** → 200 (success) or 401 (auth failed)?
   - **Response Body** → Error message details?

### **Using cURL** (for testing without UI)

```bash
# First get an access token from login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Copy the accessToken from response

# Then test create-order with token
curl -X POST http://localhost:5000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "addressId": 1,
    "deliveryType": "standard"
  }'
```

---

## Debugging Checklist

- [ ] Backend server is running on port 5000
- [ ] Database is running on port 5433 (or update .env to correct port)
- [ ] User is logged in before calling payment API
- [ ] `accessToken` is stored in localStorage (check DevTools)
- [ ] Authorization header is sent in requests (check Network tab)
- [ ] Response doesn't return 401 Unauthorized
- [ ] Cart has items before creating order
- [ ] Address ID is valid for the user
- [ ] Check browser console for [axios] logs
- [ ] Check backend console for [authGuard] and [createOrder] logs

---

## Common Error Responses & Fixes

### **"No token provided" (401)**
- **Cause**: Not logged in or token not in localStorage
- **Fix**: Login first, verify token is stored in DevTools

### **"Invalid or expired token" (401)**
- **Cause**: Token is corrupted or JWT_SECRET changed
- **Fix**: Login again to get new token

### **"Bad Gateway" (502)**
- **Cause**: Backend server not running
- **Fix**: Run `npm start` in server folder

### **"Cart is empty"**
- **Cause**: No items in cart
- **Fix**: Add items to cart before checkout

### **"Invalid address"**
- **Cause**: Address doesn't belong to user
- **Fix**: Use correct addressId from user's saved addresses

---

## Recent Changes Made

✅ Enhanced authGuard middleware with better logging
✅ Added token validation logging to axios interceptor
✅ Added user authentication check in createOrder controller
✅ Improved error messages for debugging

These changes will help identify exactly where authentication is failing.

---

## Next Steps

1. **Run the backend server** with the fixes applied
2. **Monitor console logs** in both backend and browser
3. **Try to create an order** and check:
   - Backend logs for `[authGuard]` and `[createOrder]` messages
   - Browser console for `[axios]` messages
4. **Share console output** if issues persist
