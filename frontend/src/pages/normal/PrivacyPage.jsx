// src/pages/normal/PrivacyPage.jsx

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy | Nairobi Jet House',
  description: 'Learn how Nairobi Jet House collects, uses, and protects your personal information when you use our private aviation services.',
  url: 'https://www.nairobijethouse.com/privacy',
};

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Nairobi Jet House - Your Data Security Matters</title>
        <meta name="description" content="Learn how Nairobi Jet House collects, uses, and protects your personal information when you use our private aviation services. Your privacy and security are our priority." />
        <meta name="keywords" content="privacy policy, data protection, Nairobi Jet House privacy, secure travel, personal data" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/privacy" />
        <meta property="og:title" content="Privacy Policy | Nairobi Jet House" />
        <meta property="og:description" content="Your privacy matters to us. Read our privacy policy to understand how we protect your data." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section */}
      <div className="page-header" style={{
        backgroundImage: 'linear-gradient(140deg, var(--color-navy-dark) 0%, var(--color-navy) 55%, var(--color-navy-light) 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlend: 'overlay',
      }}>
        <div className="page-header__glow"></div>
        <div className="container page-header__inner">
          <span className="section-label">
            <i className="bi bi-shield-lock"></i> Privacy Policy
          </span>
          <h1>Your Privacy <em style={{ color: 'var(--color-gold-light)' }}>Matters</em> to Us</h1>
          <p>We are committed to protecting your personal data and being transparent about how we handle your information.</p>
        </div>
      </div>

      {/* Content Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="legal-content">
            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-info-circle"></i>
                <h2>Information We Collect</h2>
              </div>
              <div className="legal-card__body">
                <p>When you use Nairobi Jet House services, we may collect the following types of information:</p>
                <ul>
                  <li><strong>Personal Identification Information:</strong> Name, email address, phone number, company name, and travel preferences.</li>
                  <li><strong>Travel Information:</strong> Flight bookings, charter requests, travel itineraries, and special requests.</li>
                  <li><strong>Payment Information:</strong> Payment details for processing transactions (processed securely through our payment partners).</li>
                  <li><strong>Technical Information:</strong> IP address, browser type, device information, and usage data when you visit our website.</li>
                  <li><strong>Communication Records:</strong> Records of your communications with our team via email, phone, or our contact forms.</li>
                </ul>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-gear"></i>
                <h2>How We Use Your Information</h2>
              </div>
              <div className="legal-card__body">
                <p>We use your information to provide, maintain, and improve our services:</p>
                <ul>
                  <li><strong>Service Delivery:</strong> Process your flight and charter bookings, send confirmations, and provide travel updates.</li>
                  <li><strong>Customer Support:</strong> Respond to your inquiries, provide assistance, and resolve any issues.</li>
                  <li><strong>Personalization:</strong> Tailor our services to your preferences and provide personalized recommendations.</li>
                  <li><strong>Communication:</strong> Send you important updates, marketing communications (with your consent), and service-related notifications.</li>
                  <li><strong>Security & Compliance:</strong> Ensure the security of our platform, prevent fraud, and comply with legal obligations.</li>
                </ul>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-share"></i>
                <h2>Information Sharing & Disclosure</h2>
              </div>
              <div className="legal-card__body">
                <p>We take your privacy seriously and only share your information in the following circumstances:</p>
                <ul>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information.</li>
                  <li><strong>Service Providers:</strong> With trusted third-party partners who assist us in delivering our services (airlines, ground handling, catering).</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation.</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
                  <li><strong>Protection of Rights:</strong> To protect the rights, property, or safety of Nairobi Jet House, our clients, or others.</li>
                </ul>
                <p className="legal-note">We do not sell your personal information to third parties.</p>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-cookie"></i>
                <h2>Cookies & Tracking Technologies</h2>
              </div>
              <div className="legal-card__body">
                <p>We use cookies and similar tracking technologies to enhance your experience on our website:</p>
                <ul>
                  <li><strong>Essential Cookies:</strong> Necessary for the basic functionality of our website.</li>
                  <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website.</li>
                  <li><strong>Functional Cookies:</strong> Remember your preferences and provide enhanced features.</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements and measure campaign effectiveness.</li>
                </ul>
                <p>You can manage your cookie preferences through your browser settings. For more information, view our <Link to="/cookies" style={{ color: 'var(--color-gold)' }}>Cookie Policy</Link>.</p>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-shield-check"></i>
                <h2>Data Security</h2>
              </div>
              <div className="legal-card__body">
                <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
                <ul>
                  <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using SSL/TLS.</li>
                  <li><strong>Access Controls:</strong> Strict access controls ensure that only authorized personnel can access your information.</li>
                  <li><strong>Secure Storage:</strong> Your data is stored on secure servers with industry-standard security measures.</li>
                  <li><strong>Regular Audits:</strong> We regularly review our security practices to ensure they remain effective.</li>
                </ul>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-person-check"></i>
                <h2>Your Rights</h2>
              </div>
              <div className="legal-card__body">
                <p>You have the following rights regarding your personal information:</p>
                <ul>
                  <li><strong>Right to Access:</strong> Request a copy of the personal information we hold about you.</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete information.</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal information (subject to legal obligations).</li>
                  <li><strong>Right to Restrict Processing:</strong> Request limitation of how we process your data.</li>
                  <li><strong>Right to Data Portability:</strong> Request transfer of your data to another service provider.</li>
                  <li><strong>Right to Object:</strong> Object to certain processing activities, including marketing.</li>
                </ul>
                <p>To exercise any of these rights, please <Link to="/contact" style={{ color: 'var(--color-gold)' }}>contact us</Link>.</p>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-clock-history"></i>
                <h2>Data Retention</h2>
              </div>
              <div className="legal-card__body">
                <p>We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, including:</p>
                <ul>
                  <li><strong>Service Provision:</strong> As long as your account is active or as needed to provide you with services.</li>
                  <li><strong>Legal Compliance:</strong> To comply with legal obligations, tax requirements, and regulatory reporting.</li>
                  <li><strong>Legitimate Business Interests:</strong> For record-keeping, dispute resolution, and internal analysis.</li>
                </ul>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-envelope"></i>
                <h2>Contact Us</h2>
              </div>
              <div className="legal-card__body">
                <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                <ul className="contact-list">
                  <li><i className="bi bi-envelope"></i> <a href="mailto:privacy@nairobijethouse.com">privacy@nairobijethouse.com</a></li>
                  <li><i className="bi bi-telephone"></i> <a href="tel:+254780729617">+254 724 878 136</a></li>
                  <li><i className="bi bi-geo-alt"></i> Nairobi, Kenya</li>
                </ul>
              </div>
            </div>

            <div className="legal-footer">
              <p><strong>Last Updated:</strong> June 2026</p>
              <p>This Privacy Policy may be updated from time to time. Please check this page periodically for changes.</p>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        .legal-content {
          max-width: 860px;
          margin: 0 auto;
        }
        .legal-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          border-radius: var(--radius-md);
          margin-bottom: 2rem;
          overflow: hidden;
        }
        .legal-card__header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          background: var(--color-off-white);
          border-bottom: 1px solid var(--color-light-gray);
        }
        .legal-card__header i {
          font-size: 1.25rem;
          color: var(--color-gold);
        }
        .legal-card__header h2 {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-navy);
          margin: 0;
        }
        .legal-card__body {
          padding: 1.5rem;
        }
        .legal-card__body p {
          color: var(--color-dark-gray);
          line-height: 1.7;
          margin-bottom: 1rem;
        }
        .legal-card__body ul {
          margin: 0.5rem 0 1rem 0;
          padding-left: 1.5rem;
        }
        .legal-card__body li {
          color: var(--color-dark-gray);
          line-height: 1.7;
          margin-bottom: 0.5rem;
        }
        .legal-card__body li strong {
          color: var(--color-navy);
        }
        .legal-note {
          font-weight: 600;
          color: var(--color-gold-dark) !important;
          padding: 0.75rem;
          background: rgba(200, 164, 90, 0.08);
          border-radius: var(--radius-sm);
        }
        .contact-list {
          list-style: none !important;
          padding: 0 !important;
        }
        .contact-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .contact-list i {
          color: var(--color-gold);
          font-size: 1rem;
          width: 1.25rem;
        }
        .contact-list a {
          color: var(--color-navy);
          text-decoration: none;
        }
        .contact-list a:hover {
          color: var(--color-gold);
        }
        .legal-footer {
          text-align: center;
          padding: 2rem 0 0;
          color: var(--color-mid-gray);
          font-size: 0.85rem;
          border-top: 1px solid var(--color-light-gray);
        }
        .legal-footer p {
          margin: 0.3rem 0;
        }
      `}</style>
    </>
  );
}