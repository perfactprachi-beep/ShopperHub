export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayModal({ orderId, amount, currency, keyId, user, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure?.('Failed to load Razorpay SDK. Check your connection.');
    return;
  }

  const options = {
    key:         keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount,
    currency,
    order_id:    orderId,
    name:        'ShoppersHub',
    description: 'Order Payment',
    prefill: {
      name:  user?.full_name || '',
      email: user?.email     || '',
      contact: user?.phone   || '',
    },
    theme: { color: '#b91c1c' },
    handler: (response) => {
      onSuccess?.({
        razorpayOrderId:   response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: () => onFailure?.('Payment cancelled'),
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (response) => {
    onFailure?.(response.error?.description || 'Payment failed');
  });
  rzp.open();
}
