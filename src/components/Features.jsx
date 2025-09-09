// src/components/Features.jsx
import { SparklesIcon, DocumentTextIcon, CalendarDaysIcon } from '@heroicons/react/24/solid'

const features = [
  {
    title: "AI Essay Insights",
    desc: "Get instant feedback on your writing — clarity, style, and impact — all highlighted sentence by sentence.",
    icon: DocumentTextIcon,
  },
  {
    title: "SmartFrame™ EC Builder",
    desc: "Turn your activities into powerful résumé lines that show initiative, scope, and measurable outcomes.",
    icon: SparklesIcon,
  },
  {
    title: "Deadline Tracking",
    desc: "Never miss a date. Applications, supplementals, and scholarships all in one clean calendar view.",
    icon: CalendarDaysIcon,
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            Features That Matter
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            We cut out the fluff. Everything here saves you time and makes your applications stronger.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="card p-6 text-center hover:shadow-md transition">
              <div className="flex justify-center mb-4">
                <f.icon className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-gray-600 text-sm leading-6">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
