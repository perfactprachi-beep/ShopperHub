/** v3
 * SMS service — uses Twilio when credentials are set, falls back to console.
 * Setup: sign up at twilio.com → get Account SID, Auth Token, and a phone number.
 * Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE to server/.env
 */
export async function sendOtp(phone, otp) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone  = process.env.TWILIO_PHONE;

  // Always log to console as fallback
  console.log(`\n[OTP] Phone: ${phone}  →  Code: ${otp}\n`);

  if (!accountSid || !authToken || !fromPhone) {
    console.warn('[Twilio] Credentials not set — OTP only logged to console.');
    return;
  }

  try {
    const { default: twilio } = await import('twilio');
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: `${otp} is your ShoppersHub OTP. Valid for 10 minutes. Do not share with anyone.`,
      from: fromPhone,
      to: phone,
    });

    console.log(`[Twilio] SMS sent to ${phone} — SID: ${message.sid}`);
  } catch (err) {
    console.error('[Twilio] Failed to send SMS:', err.message);
  }
}
