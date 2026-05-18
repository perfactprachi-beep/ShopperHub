async function sendViaTwilio(phone, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone  = process.env.TWILIO_PHONE;

  if (!accountSid || !authToken || !fromPhone) {
    console.warn('[Twilio] Credentials not configured');
    console.log(`[SMS-DEV] To: ${phone}\n${message}\n`);
    return false;
  }

  try {
    const { default: twilio } = await import('twilio');
    const client = twilio(accountSid, authToken);
    const sms = await client.messages.create({ body: message, from: fromPhone, to: phone });
    console.log(`[Twilio] ✓ SMS sent to ${phone} — SID: ${sms.sid}`);
    return true;
  } catch (err) {
    console.error('[Twilio] Error:', err.message);
    return false;
  }
}

// Generic SMS sender
// otpValue: when provided (OTP flow), Fast2SMS route=otp uses it as variables_values
async function sendSms(phone, message, otpValue = null) {
  // Indian numbers → try Fast2SMS first, fall back to Twilio
  if (phone.startsWith('+91')) {
    const apiKey = process.env.FAST2SMS_API_KEY;
    if (apiKey) {
      const number = phone.slice(3); // strip +91
      // Fast2SMS OTP route: variables_values must be the numeric OTP only, not full text
      const variablesValues = otpValue ?? encodeURIComponent(message);
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&variables_values=${variablesValues}&route=otp&numbers=${number}`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.return) {
          console.log(`[Fast2SMS] ✓ SMS sent to ${phone}`);
          return true;
        }
        console.warn('[Fast2SMS] ✗ Failed:', JSON.stringify(json), '— falling back to Twilio');
      } catch (err) {
        console.warn('[Fast2SMS] Error:', err.message, '— falling back to Twilio');
      }
    } else {
      console.warn('[Fast2SMS] API key not configured — falling back to Twilio');
    }
    // Fallback: Twilio for Indian numbers
    return sendViaTwilio(phone, message);
  }

  // International numbers → Twilio
  return sendViaTwilio(phone, message);
}

export async function sendOtp(phone, otp) {
  console.log(`\n[OTP] Phone: ${phone}  →  Code: ${otp}\n`);
  const message = `${otp} is your ShoppersHub OTP. Valid for 10 minutes. Do not share with anyone.`;
  return sendSms(phone, message, otp); // pass raw OTP for Fast2SMS variables_values
}

export async function sendOrderConfirmation(phone, orderId, total, estimatedDelivery) {
  const days = estimatedDelivery || '5-7';
  const message = `Order confirmed! Order ID: #ORD-${orderId}. Amount: ₹${total}. Estimated delivery: ${days} days. Track: shoppersh.ub/track/${orderId}`;
  console.log(`[SMS] Order confirmation for ${phone}`);
  return sendSms(phone, message);
}

export async function sendShipmentNotification(phone, orderId, trackingId) {
  const message = `Your order #ORD-${orderId} has been shipped! Tracking ID: ${trackingId}. Check status: shoppersh.ub/orders`;
  console.log(`[SMS] Shipment notification for ${phone}`);
  return sendSms(phone, message);
}

export async function sendDeliveryNotification(phone, orderId) {
  const message = `Great! Your order #ORD-${orderId} has been delivered. Thank you for shopping at ShoppersHub!`;
  console.log(`[SMS] Delivery notification for ${phone}`);
  return sendSms(phone, message);
}

export async function sendReturnApprovedNotification(phone, orderId) {
  const message = `Return approved for order #ORD-${orderId}. Please arrange pickup within 5 days. Support: shoppersh.ub/contact`;
  console.log(`[SMS] Return approval notification for ${phone}`);
  return sendSms(phone, message);
}

export async function sendRefundNotification(phone, orderId, refundAmount) {
  const message = `Refund of ₹${refundAmount} processed for order #ORD-${orderId}. You'll receive it within 3-5 business days.`;
  console.log(`[SMS] Refund notification for ${phone}`);
  return sendSms(phone, message);
}
