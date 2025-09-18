// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-semibold">ReadyAdmit</h3>
          <p className="mt-2 text-sm text-gray-400">
            Helping students get into their dream schools with AI-powered guidance.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm">Product</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li><a href="/#how" className="hover:text-white">How it Works</a></li>
            <li><a href="/#features" className="hover:text-white">Features</a></li>
            <li><a href="/#pricing" className="hover:text-white">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm">Company</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li><a href="/about" className="hover:text-white">About</a></li>
            <li><a href="/contact" className="hover:text-white">Contact</a></li>
            <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
            <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">
        (c) {new Date().getFullYear()} ReadyAdmit. All rights reserved.
      </div>
    </footer>
  )
}
