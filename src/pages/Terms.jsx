import AppShell from '../components/AppShell';
import Footer from '../components/Footer';
import '../styles/legal.css';

const sections = [
  {
    heading: '1. Using ReadyAdmit',
    body: [
      'ReadyAdmit provides planning tools, essay feedback, and admissions insights. You may use the service only for your own application process and in compliance with these terms.',
      'You must keep your account secure. If you believe your credentials were compromised, contact support immediately so we can help lock the account.'
    ],
  },
  {
    heading: '2. Student Content',
    body: [
      'You own the essays, activities, and other materials you upload. By submitting them you grant ReadyAdmit a limited license to store, analyze, and display that content to you for the purpose of providing guidance and AI-generated feedback.',
      'We do not sell or share student content with colleges or advertisers. Aggregated, anonymized insights may be used to improve our models and product experience.'
    ],
  },
  {
    heading: '3. AI Guidance',
    body: [
      'AI suggestions are drafts only. Always review and personalize any text before submission. ReadyAdmit does not guarantee admission outcomes or correctness of AI generated responses.',
      'If you see output that is incorrect, offensive, or appears to violate academic integrity policies, please report it to support.'
    ],
  },
  {
    heading: '4. Payments & Beta',
    body: [
      'During beta the platform is free to use. When paid plans launch we will provide advance notice and a chance to opt in. Continued use after a pricing change constitutes acceptance of the updated plan.',
      'Any promotional credits are non-transferable and may expire as specified in the offer details.'
    ],
  },
  {
    heading: '5. Prohibited Activities',
    body: [
      'You may not attempt to reverse engineer the service, interfere with normal operation, or use ReadyAdmit to generate plagiarized work for other students.',
      'Accounts used for bulk scraping, automated queries, or any unlawful purpose may be suspended without notice.'
    ],
  },
  {
    heading: '6. Disclaimers & Liability',
    body: [
      'ReadyAdmit is provided "as is" without warranties of any kind. We are not responsible for missed deadlines, admission decisions, or any damages arising from use of the service.',
      'To the fullest extent permitted by law our liability is limited to the amount you paid to ReadyAdmit in the twelve months preceding any claim (currently $0 while in beta).' 
    ],
  },
  {
    heading: '7. Contact',
    body: [
      'Questions about these terms can be sent to support@readyadmit.com. We may update these terms from time to time; the “Last updated” date will always reflect the newest version.'
    ],
  },
];

export default function Terms() {
  return (
    <AppShell>
      <div className="legal-page">
        <header className="legal-hero">
          <p className="legal-kicker">Terms of Service</p>
          <h1>ReadyAdmit Terms</h1>
          <p className="legal-meta">Last updated: {new Date().getFullYear()}</p>
          <p className="legal-summary">
            These terms explain how ReadyAdmit operates, what you can expect from us, and what we expect from you when using the platform.
          </p>
        </header>

        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </section>
        ))}

        <section>
          <h2>8. Governing Law</h2>
          <p>These terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law principles.</p>
        </section>

        <section className="legal-contact">
          <h2>Need help?</h2>
          <p>Email <a href="mailto:support@readyadmit.com">support@readyadmit.com</a> and we will respond within two business days.</p>
        </section>
      </div>
      <Footer />
    </AppShell>
  );
}
