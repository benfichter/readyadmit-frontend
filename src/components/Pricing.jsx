// src/components/Pricing.jsx
const tiers = [
  {
    name: "Free",
    price: "$0",
    desc: "Get started with the basics. Perfect for exploring.",
    features: ["1 essay preview / day", "Up to 3 extracurriculars", "Basic dashboard"],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9 / mo",
    desc: "For students who want full power with unlimited previews.",
    features: ["Unlimited essay scoring", "Unlimited extracurriculars", "Deadline tracking", "Priority AI"],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Counselor",
    price: "Contact Us",
    desc: "For schools & counselors supporting multiple students.",
    features: ["Multi-student dashboards", "Bulk essay reviews", "Dedicated support"],
    cta: "Talk to Us",
    popular: false,
  },
]

export default function Pricing() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Simple Pricing
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Start free, upgrade when you’re ready. No hidden fees.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {tiers.map((t, i) => (
            <div
              key={i}
              className={`card p-6 flex flex-col ${t.popular ? 'ring-2 ring-blue-600' : ''}`}
            >
              <div className="text-sm font-medium text-gray-500">{t.name}</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{t.price}</div>
              <p className="mt-2 text-sm text-gray-600 flex-1">{t.desc}</p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {t.features.map((f, j) => (
                  <li key={j}>• {f}</li>
                ))}
              </ul>
              <button className={`mt-6 btn ${t.popular ? 'btn-primary' : 'btn-outline'}`}>
                {t.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
