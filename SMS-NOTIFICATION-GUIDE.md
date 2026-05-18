# SMS Notification System - Complete Guide

## What's Now Fixed ✅

### 1. **New SMS Functions Added** 
- `sendOrderConfirmation()` - Sent when order is placed
- `sendShipmentNotification()` - For shipment updates  
- `sendDeliveryNotification()` - When order arrives
- `sendReturnApprovedNotification()` - When return is approved
- `sendRefundNotification()` - When refund is processed

### 2. **Auto SMS on Order Creation**
✅ Razorpay Payment Orders - SMS sent after payment verification  
✅ COD Orders - SMS sent immediately after order placement

### 3. **SMS Configuration**
- **Indian Numbers (+91)**: Uses Fast2SMS API
  - API Key: `REDACTED`
  - Already configured in `.env`

- **International Numbers**: Uses Twilio
  - Account: `REDACTED`
  - Already configured in `.env`

### 4. **Debug Mode**
If SMS APIs fail or aren't configured, messages are logged to console with `[SMS-DEV]` prefix for testing without real SMS.

---

## How SMS is Triggered Now

### **After Payment Verification (Razorpay)**
```
User places order with Razorpay payment
                    ↓
Payment verified on backend
                    ↓
SMS sent: "Order confirmed! Order ID: #ORD-123. Amount: ₹5000. 
           Estimated delivery: 5-7 days. Track: shoppersh.ub/track/123"
```

### **After COD Order Placement**
```
User places COD order
        ↓
Order created in database
        ↓
SMS sent immediately with same order confirmation details
```

### **Delivery Type-Based SMS**
- Express (1-2 days): `"Estimated delivery: 1-2 days"`
- Store Pickup (instant): `"Estimated delivery: 0 days"`
- Standard (5-7 days): `"Estimated delivery: 5-7 days"`

---

## Testing SMS

### **Test 1: Check OTP SMS (Login)**
1. Go to login page
2. Click "Login with OTP"
3. Enter phone number
4. Check backend console for:
   ```
   [OTP] Phone: +91XXXXXXXXXX → Code: 123456
   [Fast2SMS] ✓ SMS sent to +91XXXXXXXXXX
   ```

### **Test 2: Check Order Confirmation SMS**
1. Add items to cart
2. Go to checkout
3. Place order (Razorpay or COD)
4. Check backend console for:
   ```
   [SMS] Order confirmation for +91XXXXXXXXXX
   [Fast2SMS] ✓ SMS sent to +91XXXXXXXXXX
   ```

### **Monitor Backend Logs**
```bash
# In server terminal, watch for SMS logs:
[SMS] Order confirmation for +91XXXXXXXXXX
[OTP] Phone: +91XXXXXXXXXX → Code: 123456
[Fast2SMS] ✓ SMS sent to +91XXXXXXXXXX
[Twilio] ✓ SMS sent to +1XXXXXXXXXX — SID: SMxxxxxxxxx
```

---

## SMS Message Templates

| Event | Message |
|-------|---------|
| **OTP** | `{OTP} is your ShoppersHub OTP. Valid for 10 minutes. Do not share with anyone.` |
| **Order Confirmation** | `Order confirmed! Order ID: #ORD-{id}. Amount: ₹{total}. Estimated delivery: {days} days. Track: shoppersh.ub/track/{id}` |
| **Shipment** | `Your order #ORD-{id} has been shipped! Tracking ID: {trackingId}. Check status: shoppersh.ub/orders` |
| **Delivery** | `Great! Your order #ORD-{id} has been delivered. Thank you for shopping at ShoppersHub!` |
| **Return Approved** | `Return approved for order #ORD-{id}. Please arrange pickup within 5 days. Support: shoppersh.ub/contact` |
| **Refund** | `Refund of ₹{amount} processed for order #ORD-{id}. You'll receive it within 3-5 business days.` |

---

## Next Steps (Future Implementation)

To fully automate SMS for all statuses, we need to:

1. **Add Admin Dashboard** to mark orders as:
   - Shipped (triggers `sendShipmentNotification`)
   - Delivered (triggers `sendDeliveryNotification`)

2. **Add Returns Module** to process returns and:
   - Approve returns (triggers `sendReturnApprovedNotification`)
   - Process refunds (triggers `sendRefundNotification`)

3. **Add Scheduled Tasks** for:
   - Delivery reminders (1 day before)
   - Order follow-ups (5 days after delivery)

---

## Troubleshooting SMS Issues

### SMS Not Sending?

1. **Check .env is configured**
   ```bash
   echo $FAST2SMS_API_KEY  # Should print API key, not empty
   ```

2. **Check backend logs** for errors:
   ```
   [Fast2SMS] Error: Network timeout
   [Twilio] Error: Invalid credentials
   ```

3. **Verify phone number format**
   - Indian: `+919876543210`
   - US: `+12125551234`
   - Must have country code

4. **Check API quotas**
   - Fast2SMS: Verify API key has credits
   - Twilio: Verify account has balance

5. **Enable Debug Mode**
   - If APIs fail, messages are logged as `[SMS-DEV]` to console
   - This lets you test without real SMS

---

## Files Modified

✅ `server/src/services/sms.service.js` - Added new SMS functions  
✅ `server/src/controllers/payments.controller.js` - Send SMS on order creation  
✅ `server/src/controllers/orders.controller.js` - Import SMS service

---

## Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| OTP SMS | ✅ Working | Fires on `/auth/check-mobile` |
| Order Confirmation SMS | ✅ Working | Auto-fires after order creation |
| Shipment SMS | 🔧 Ready | Needs admin dashboard integration |
| Delivery SMS | 🔧 Ready | Needs admin dashboard integration |
| Return Approved SMS | 🔧 Ready | Needs returns module |
| Refund SMS | 🔧 Ready | Needs returns module |

---

## Quick Start

Just place an order and check the backend console - SMS should fire automatically! 🚀
