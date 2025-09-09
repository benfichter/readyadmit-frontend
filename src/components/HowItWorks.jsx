// src/components/HowItWorks.jsx
import { AcademicCapIcon, PencilSquareIcon, CheckCircleIcon } from '@heroicons/react/24/solid'

const steps = [
  {
    id: 1,
    title: "Build Your Profile",
    desc: "Add your extracurriculars, awards, and interests. We’ll frame them in ways admissions officers love.",
    icon: AcademicCapIcon,
  },
  {
    id: 2,
    title: "Polish Your Essays",
    desc: "Paste in your draft and get instant highlights — what’s working and what needs work, sentence by sentence.",
    icon: PencilSquareIcon,
  },
  {
    id: 3,
    title: "Track Apps & Deadlines",
    desc: "Keep all your applications and supplementals in one place. Never miss a deadline again.",
    icon: CheckCircleIcon,
  },
]

export default function HowItWorks({ id }) {
  return (
    <section id={id} className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
            How It Works
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            We built ReadyAdmit to take the guesswork out of applications. Here’s the 3-step flow our students use.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {steps.map(step => (
            <div
              key={step.id}
              className="card text-center px-6 py-8 hover:shadow-md transition"
            >
              <div className="flex justify-center mb-4">
                <step.icon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-gray-600 text-sm leading-6">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
