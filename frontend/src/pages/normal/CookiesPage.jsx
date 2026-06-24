// src/pages/normal/CookiesPage.jsx

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Cookie Policy | Nairobi Jet House',
  description: 'Understand how Nairobi Jet House uses cookies to enhance your browsing experience and improve our services.',
  url: 'https://www.nairobijethouse.com/cookies',
};

export default function CookiesPage() {
  return (
    <>
      <Helmet>
        <title>Cookie Policy | Nairobi Jet House - How We Use Cookies</title>
        <meta name="description" content="Understand how Nairobi Jet House uses cookies to enhance your browsing experience, analyze website performance, and improve our private aviation services." />
        <meta name="keywords" content="cookie policy, Nairobi Jet House cookies, website cookies, privacy, tracking" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/cookies" />
        <meta property="og:title" content="Cookie Policy | Nairobi Jet House" />
        <meta property="og:description" content="Learn how we use cookies to improve your experience on our website." />
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
            <i className="bi bi-cookie"></i> Cookie Policy
          </span>
          <h1>How We Use <em style={{ color: 'var(--color-gold-light)' }}>Cookies</em></h1>
          <p>We use cookies to enhance your browsing experience and understand how you interact with our website.</p>
        </div>
      </div>

      {/* Content Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="legal-content">
            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-info-circle"></i>
                <h2>What Are Cookies?</h2>
              </div>
              <div className="legal-card__body">
                <p>Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, enhance user experience, and provide information to website owners.</p>
                <p>Cookies are not used to identify you personally but rather to remember your preferences and actions on our website.</p>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-list-task"></i>
                <h2>Types of Cookies We Use</h2>
              </div>
              <div className="legal-card__body">
                <p>We use the following types of cookies on our website:</p>

                <h4 style={{ color: 'var(--color-navy)', marginTop: '1rem', marginBottom: '0.5rem' }}>Essential Cookies</h4>
                <ul>
                  <li><strong>Purpose:</strong> Necessary for the basic functionality of our website.</li>
                  <li><strong>Examples:</strong> Session management, security, and load balancing.</li>
                  <li><strong>Duration:</strong> Session or persistent (limited duration).</li>
                  <li><strong>Consent Required:</strong> No (these are strictly necessary).</li>
                </ul>

                <h4 style={{ color: 'var(--color-navy)', marginTop: '1rem', marginBottom: '0.5rem' }}>Performance & Analytics Cookies</h4>
                <ul>
                  <li><strong>Purpose:</strong> Help us understand how visitors interact with our website.</li>
                  <li><strong>Examples:</strong> Google Analytics, page view tracking, user behavior analysis.</li>
                  <li><strong>Duration:</strong> Persistent (up to 24 months).</li>
                  <li><strong>Consent Required:</strong> Yes.</li>
                </ul>

                <h4 style={{ color: 'var(--color-navy)', marginTop: '1rem', marginBottom: '0.5rem' }}>Functional Cookies</h4>
                <ul>
                  <li><strong>Purpose:</strong> Remember your preferences and provide enhanced features.</li>
                  <li><strong>Examples:</strong> Language preferences, region selection, saved routes.</li>
                  <li><strong>Duration:</strong> Persistent (up to 12 months).</li>
                  <li><strong>Consent Required:</strong> Yes.</li>
                </ul>

                <h4 style={{ color: 'var(--color-navy)', marginTop: '1rem', marginBottom: '0.5rem' }}>Marketing & Advertising Cookies</h4>
                <ul>
                  <li><strong>Purpose:</strong> Deliver relevant advertisements and measure campaign effectiveness.</li>
                  <li><strong>Examples:</strong> Retargeting, social media pixels, ad tracking.</li>
                  <li><strong>Duration:</strong> Persistent (up to 24 months).</li>
                  <li><strong>Consent Required:</strong> Yes.</li>
                </ul>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-sliders"></i>
                <h2>Managing Your Cookie Preferences</h2>
              </div>
              <div className="legal-card__body">
                <p>You can manage your cookie preferences in several ways:</p>
                <ul>
                  <li><strong>Browser Settings:</strong> Most browsers allow you to control cookies through their settings. You can block or delete cookies at any time.</li>
                  <li><strong>Cookie Banner:</strong> When you first visit our website, you will see a cookie banner where you can choose your preferences.</li>
                  <li><strong>Opt-Out Tools:</strong> You can use tools like the Google Analytics Opt-Out Browser Add-On to prevent analytics tracking.</li>
                </ul>
                <p className="legal-note">Please note that blocking essential cookies may affect the functionality of our website.</p>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-info-square"></i>
                <h2>Third-Party Cookies</h2>
              </div>
              <div className="legal-card__body">
                <p>Some cookies are placed by third-party services we use to enhance our website:</p>
                <ul>
                  <li><strong>Google Analytics:</strong> Helps us understand website traffic and user behavior.</li>
                  <li><strong>Social Media Platforms:</strong> Allow you to share content and follow our social media channels.</li>
                  <li><strong>Payment Processors:</strong> Enable secure payment processing.</li>
                  <li><strong>Advertising Partners:</strong> Help us deliver relevant advertisements.</li>
                </ul>
                <p>These third-party services have their own privacy policies and cookie policies.</p>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-envelope"></i>
                <h2>Contact Us</h2>
              </div>
              <div className="legal-card__body">
                <p>If you have any questions about our use of cookies, please contact us:</p>
                <ul className="contact-list">
                  <li><i className="bi bi-envelope"></i> <a href="mailto:privacy@nairobijethouse.com">privacy@nairobijethouse.com</a></li>
                  <li><i className="bi bi-telephone"></i> <a href="tel:+254780729617">+254 724 878 136</a></li>
                  <li><i className="bi bi-geo-alt"></i> Nairobi, Kenya</li>
                </ul>
              </div>
            </div>

            <div className="legal-footer">
              <p><strong>Last Updated:</strong> June 2026</p>
              <p>We may update this Cookie Policy from time to time. Please check back periodically for changes.</p>
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
        .legal-card__body h4 {
          font-family: var(--font-heading);
          font-weight: 600;
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