export default function ReturnsPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Returns</h1>
      <div className="mt-8 space-y-6 text-sm leading-6 text-gray-600">
        <p>
          Start a return from My Orders for eligible items. Keep the item unused, with original tags and packaging, so pickup and refund processing stay smooth.
        </p>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Return window</h2>
          <p className="mt-2">Most products can be returned within 7 days of delivery. Final sale and hygiene-sensitive items may not be returnable.</p>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Refunds</h2>
          <p className="mt-2">Refunds are initiated after quality checks and are credited back to the original payment method where possible.</p>
        </div>
      </div>
    </section>
  );
}
