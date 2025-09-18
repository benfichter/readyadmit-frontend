// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <h3 className="footer-brand">ReadyAdmit</h3>
          <p className="footer-tagline">
            Helping students get into their dream schools with calm, opinionated guidance.
          </p>
        </div>
        <nav className="footer-links">
          <a href="/#how">How it Works</a>
          <a href="/#features">What You Get</a>
          <a href="/#demo">See it in Action</a>
          <a href="/#testimonials">Testimonials</a>
          <a href="/#pricing">Pricing</a>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
        </nav>
      </div>
      <div className="footer-bottom">(c) {new Date().getFullYear()} ReadyAdmit. All rights reserved.</div>
    </footer>
  );
}
