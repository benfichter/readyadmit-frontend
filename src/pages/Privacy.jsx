import AppShell from '../components/AppShell';
import Footer from '../components/Footer';
import '../styles/legal.css';

const sections = [
  {
    heading: '1. Information We Collect',
    items: [
      'Account details such as your name, email address, and profile photo.',
      'Application materials you add to ReadyAdmit (activities, honors, essays, notes, deadlines).',
      'Usage data including feature engagement, device type, and diagnostic logs used to keep the product reliable.'
    ],
  },
  {
    heading: '2. How We Use Data',
    items: [
      'Provide personalized planning tools, AI feedback, and recommendations.',
      'Securely store your essays, activities, and progress so you can access them across devices.',
      'Improve ReadyAdmit by analyzing anonymous trends, testing new features, and preventing abuse.',
      'Communicate product updates, onboarding tips, or support responses. You may opt out of non-essential emails.'
    ],
  },
  {
    heading: '3. Sharing & Disclosure',
    items: [
      'We do not sell personal data or student essays.',
      'Service providers that power infrastructure (hosting, analytics, support) may process data under strict confidentiality agreements.',
      'We may disclose information if required by law, to protect ReadyAdmit users, or to investigate abuse.'
    ],
  },
  {
    heading: '4. Data Retention',
    items: [
      'Your content stays in your account until you delete it or request removal.',
      'Backups may persist for up to 30 days. After that period data is purged from active systems and archives.'
    ],
  },
  {
    heading: '5. Your Choices',
    items: [
      'Update or delete your profile and content from the Settings page.',
      'Export essays or activities by copying them from the workspace or contacting support for a structured export.',
      'Request full deletion by emailing support@readyadmit.com. We typically complete deletion within 14 days.'
    ],
  },
  {
    heading: '6. Children’s Privacy',
    items: [
      'ReadyAdmit is designed for students 13 and older. If we learn a younger child has created an account we will close it and delete associated data.'
    ],
  },
  {
    heading: '7. Security',
    items: [
      'We use encrypted connections, access controls, and monitoring to safeguard data. No system is perfectly secure, so please use a strong password and enable multi-factor authentication where available.'
    ],
  },
];

export default function Privacy() {
  return (
    <AppShell>
      <div className="legal-page">
        <header className="legal-hero">
          <p className="legal-kicker">Privacy Notice</p>
          <h1>ReadyAdmit Privacy Policy</h1>
          <p className="legal-meta">Last updated: {new Date().getFullYear()}</p>
          <p className="legal-summary">
            This policy explains what information we collect, how we use it, and the choices you have for managing your ReadyAdmit data.
          </p>
        </header>

        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <ul>
              {section.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        <section>
          <h2>8. Contact Us</h2>
          <p>Reach out to <a href="mailto:privacy@readyadmit.com">privacy@readyadmit.com</a> for privacy questions or data requests.</p>
        </section>
      </div>
      <Footer />
    </AppShell>
  );
}
