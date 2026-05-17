import { Link } from 'react-router-dom';

const HELP_MENU = [
  { label: "Help/Faq's", href: '#faqs' },
  { label: 'Track order', to: '/orders' },
  { label: 'Size Guide', href: '#size-guide' },
  { label: 'Buying Guide', href: '#buying-guide' },
  { label: 'How do I shop?', href: '#shopping' },
  { label: 'How do I pay?', href: '#payment' },
  { label: 'Find places we deliver', to: '/stores' },
];

const FAQ_GROUPS = [
  {
    id: 'general',
    title: 'General Questions',
    items: [
      {
        question: 'Who can shop on ShoppersHub?',
        answer: 'Anyone aged 18 or above with a valid payment method can place orders on ShoppersHub.',
      },
      {
        question: 'Are online prices the same as store prices?',
        answer: 'Most product prices are aligned across online and store channels, though app, web, store, or bank offers may vary.',
      },
      {
        question: 'Are there any shipping charges?',
        answer: 'Shipping charges, if applicable, are shown clearly at checkout before you place the order.',
      },
      {
        question: 'Is express delivery available for every order?',
        answer: 'Express delivery depends on your pincode, product availability, and selected payment mode.',
      },
    ],
  },
  {
    id: 'orders',
    title: 'Cancellation, Returns & Refunds',
    items: [
      {
        question: 'What happens if an item goes out of stock?',
        answer: 'If an item becomes unavailable before checkout, you will be asked to remove it. If it becomes unavailable after order confirmation, we will notify you and reverse the related charge.',
      },
      {
        question: 'Can I return or exchange a product?',
        answer: 'Eligible products can be returned or exchanged from My Orders. Items should be unused, saleable, and include original tags, invoice, and packaging.',
      },
      {
        question: 'How do I return a product if pickup is not available?',
        answer: 'Contact support and we will guide you through courier return options where service is available.',
      },
      {
        question: 'How will I receive my refund?',
        answer: 'Refunds are usually sent back to the original payment method after the returned product clears quality checks.',
      },
      {
        question: 'Who pays return shipment charges?',
        answer: 'For approved pickup returns arranged by ShoppersHub, return courier charges are not collected from you. Original shipping fees may be non-refundable.',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery Queries',
    items: [
      {
        question: 'Can I request late evening delivery?',
        answer: 'Deliveries are handled during courier business hours. Available delivery options are shown at checkout and in your order tracking updates.',
      },
      {
        question: 'What if my package arrives damaged?',
        answer: 'If the package looks damaged before delivery, do not accept it. If you notice damage after receiving it, contact support with photos as soon as possible.',
      },
      {
        question: 'What if I receive a wrong product?',
        answer: 'Raise a support request from the order detail page with product images so the team can verify and resolve it quickly.',
      },
      {
        question: 'Why is my pincode not serviceable?',
        answer: 'Courier coverage changes by location and product type. Recheck the pincode and try again later, or use Store Locator for nearby options.',
      },
      {
        question: 'How do I track an order in transit?',
        answer: 'Open My Orders to see shipment status. When courier tracking is available, the tracking link is shown in your order details.',
      },
    ],
  },
  {
    id: 'shopping',
    title: 'Shopping & Payment',
    items: [
      {
        question: 'How do I add products to my bag?',
        answer: 'Choose your size or variant on the product page, select Add to Bag, and review items before checkout.',
      },
      {
        question: 'Which payment modes can I use?',
        answer: 'You can pay using supported cards, UPI, wallets, and other secure options displayed during checkout.',
      },
      {
        question: 'Is it safe to pay online?',
        answer: 'Payments are processed through secure payment partners. ShoppersHub will never ask for your card PIN, OTP, or account password by call or email.',
      },
    ],
  },
];

function MenuLink({ item }) {
  const className = 'block border-b border-gray-200 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#8B1A2F] transition-colors';

  if (item.to) {
    return (
      <Link to={item.to} className={className}>
        {item.label}
      </Link>
    );
  }

  return (
    <a href={item.href} className={className}>
      {item.label}
    </a>
  );
}

export default function FaqsPage() {
  return (
    <section className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-gray-200 bg-white">
              <h2 className="border-b border-gray-200 px-4 py-4 text-lg font-semibold text-gray-900">Need help?</h2>
              <nav aria-label="Help topics">
                {HELP_MENU.map((item) => (
                  <MenuLink key={item.label} item={item} />
                ))}
              </nav>
            </div>

            <div className="mt-6 border border-gray-200 bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">ShoppersHub Ltd.</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Umang Tower, Mindspace, Malad West, Mumbai, Maharashtra 400064
              </p>
              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-gray-900">For queries</h3>
              <a href="mailto:support@shoppershub.com" className="mt-3 block text-sm font-medium text-[#8B1A2F] hover:underline">
                support@shoppershub.com
              </a>
            </div>
          </aside>

          <div id="faqs" className="border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#8B1A2F]">Help</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                Find quick answers for shopping, payment, delivery, cancellations, returns, refunds, and order tracking.
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {FAQ_GROUPS.map((group) => (
                <section key={group.id} id={group.id} className="px-5 py-6 sm:px-8">
                  <h2 className="text-xl font-semibold text-gray-900">{group.title}</h2>
                  <div className="mt-5 divide-y divide-gray-200 border-y border-gray-200">
                    {group.items.map(({ question, answer }) => (
                      <details key={question} className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold text-gray-900">
                          <span>{question}</span>
                          <span className="text-xl leading-none text-gray-400 group-open:rotate-45 transition-transform">+</span>
                        </summary>
                        <p className="pb-5 text-sm leading-6 text-gray-600">{answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              ))}

              <section id="size-guide" className="px-5 py-6 sm:px-8">
                <h2 className="text-xl font-semibold text-gray-900">Size Guide</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Check the size chart on each product page before buying. Fit may vary by brand, category, and style.
                </p>
              </section>

              <section id="buying-guide" className="px-5 py-6 sm:px-8">
                <h2 className="text-xl font-semibold text-gray-900">Buying Guide</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Review product images, size, material, delivery promise, return eligibility, and available offers before placing an order.
                </p>
              </section>

              <section id="payment" className="px-5 py-6 sm:px-8">
                <h2 className="text-xl font-semibold text-gray-900">How do I pay?</h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Select your preferred payment option at checkout and complete the secure payment flow. Never share OTPs or passwords with anyone.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
