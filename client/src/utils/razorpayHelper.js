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

  // ShoppersHub logo — shown in Razorpay popup left panel beside business name
  const logoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect width="36" height="36" rx="9" fill="#8B1A2F"/><path d="M13 16V13.5a5 5 0 0 1 10 0V16" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10 16h16l-1.2 11.2A1.5 1.5 0 0 1 23.3 28H12.7a1.5 1.5 0 0 1-1.5-1.3L10 16z" fill="white" fill-opacity="0.95"/><path d="M18 21v3M16.5 22.5h3" stroke="#8B1A2F" stroke-width="1.4" stroke-linecap="round"/></svg>';

  const options = {
    key:         keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount,
    currency,
    order_id:    orderId,
    name:        'ShoppersHub',
    description: 'Online Payment',
    image:       `data:image/svg+xml;base64,${btoa(logoSvg)}`,
    prefill: {
      name:    user?.full_name || '',
      email:   user?.email     || '',
      contact: user?.phone     || '',
    },
    theme: { color: '#8B1A2F' },
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
