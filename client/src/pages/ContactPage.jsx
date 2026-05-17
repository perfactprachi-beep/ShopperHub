export default function ContactPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Contact</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900">Customer Support</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">Email support@shoppershub.com for help with orders, returns, refunds, and account questions.</p>
        </div>
        <div className="border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900">Store Assistance</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">Use Store Locator to find nearby stores, pickup points, and local service availability.</p>
        </div>
      </div>
    </section>
  );
}
