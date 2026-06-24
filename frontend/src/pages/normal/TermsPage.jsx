// src/pages/normal/TermsPage.jsx

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms & Conditions | Nairobi Jet House',
  description: 'Read the terms and conditions governing the use of Nairobi Jet House private aviation services and website.',
  url: 'https://www.nairobijethouse.com/terms',
};

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | Nairobi Jet House Private Aviation</title>
        <meta name="description" content="Read the terms and conditions governing the use of Nairobi Jet House private aviation services and website. Know your rights and obligations when flying with us." />
        <meta name="keywords" content="terms and conditions, Nairobi Jet House, private aviation, charter terms, legal" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/terms" />
        <meta property="og:title" content="Terms & Conditions | Nairobi Jet House" />
        <meta property="og:description" content="Understand the terms and conditions that govern your use of Nairobi Jet House services." />
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
            <i className="bi bi-file-earmark-text"></i> Terms & Conditions
          </span>
          <h1>Our Commitment to <em style={{ color: 'var(--color-gold-light)' }}>Excellence</em></h1>
          <p>Please read these terms carefully before using our private aviation services or website.</p>
        </div>
      </div>

      {/* Content Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="legal-content">
            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-check-circle"></i>
                <h2>Acceptance of Terms</h2>
              </div>
              <div className="legal-card__body">
                <p>By using the Nairobi Jet House website and services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.</p>
                <p className="legal-note">These terms constitute a legally binding agreement between you and Nairobi Jet House.</p>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-airplane"></i>
                <h2>Booking & Charter Services</h2>
              </div>
              <div className="legal-card__body">
                <p>All charter bookings are subject to the following conditions:</p>
                <ul>
                  <li><strong>Booking Confirmation:</strong> A booking is confirmed only after we have received all required information and payment/deposit.</li>
                  <li><strong>Quotes & Pricing:</strong> All quotes are subject to change based on availability, fuel prices, and operational requirements.</li>
                  <li><strong>Flight Changes:</strong> Schedule changes requested by the client may incur additional costs.</li>
                  <li><strong>Cancellations:</strong> Cancellation fees apply based on the notice period provided. Please refer to our cancellation policy.</li>
                  <li><strong>Passenger Responsibility:</strong> Passengers are responsible for ensuring they have valid travel documents and visas.</li>
                </ul>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-cash"></i>
                <h2>Payment Terms</h2>
              </div>
              <div className="legal-card__body">
                <p>Payment for services is subject to the following terms:</p>
                <ul>
                  <li><strong>Deposit:</strong> A deposit of up to 50% may be required to confirm a booking.</li>
                  <li><strong>Balance Payment:</strong> Full payment is due before departure, unless otherwise agreed.</li>
                  <li><strong>Payment Methods:</strong> We accept bank transfers, credit cards, and other payment methods as specified.</li>
                  <li><strong>Currency:</strong> All prices are quoted in USD unless otherwise stated.</li>
                  <li><strong>Late Payments:</strong> Late payments may incur interest charges and result in booking cancellation.</li>
                </ul>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-shield"></i>
                <h2>Liability & Insurance</h2>
              </div>
              <div className="legal-card__body">
                <p>Our liability is limited as follows:</p>
                <ul>
                  <li><strong>Aviation Insurance:</strong> All flights are operated by licensed operators with appropriate aviation insurance.</li>
                  <li><strong>Passenger Liability:</strong> Our liability is limited to the terms of the applicable aviation insurance policies.</li>
                  <li><strong>Force Majeure:</strong> We are not liable for delays or cancellations due to weather, air traffic control, or other circumstances beyond our control.</li>
                  <li><strong>Personal Belongings:</strong> We are not responsible for loss or damage to personal belongings.</li>
                  <li><strong>Third-Party Services:</strong> We are not liable for services provided by third-party partners.</li>
                </ul>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-person-badge"></i>
                <h2>User Responsibilities</h2>
              </div>
              <div className="legal-card__body">
                <p>Users of our services agree to:</p>
                <ul>
                  <li>Provide accurate and complete information when making bookings.</li>
                  <li>Ensure all passengers have valid travel documents and meet entry requirements.</li>
                  <li>Comply with all applicable laws and regulations during travel.</li>
                  <li>Not use our services for any illegal or unlawful purposes.</li>
                  <li>Respect the safety instructions and policies of our operators and crew.</li>
                </ul>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-laptop"></i>
                <h2>Website & Intellectual Property</h2>
              </div>
              <div className="legal-card__body">
                <p>Use of our website is subject to the following terms:</p>
                <ul>
                  <li><strong>Content:</strong> All content on this website is the property of Nairobi Jet House and protected by copyright.</li>
                  <li><strong>Use:</strong> You may not copy, reproduce, or distribute content without our prior written consent.</li>
                  <li><strong>Trademarks:</strong> Nairobi Jet House and associated logos are registered trademarks.</li>
                  <li><strong>Accuracy:</strong> We strive to ensure all information on our website is accurate but do not guarantee its completeness.</li>
                </ul>
              </div>
            </div>

            <div className="legal-card">
              <div className="legal-card__header">
                <i className="bi bi-envelope"></i>
                <h2>Contact Information</h2>
              </div>
              <div className="legal-card__body">
                <p>For questions about these terms, please contact us:</p>
                <ul className="contact-list">
                  <li><i className="bi bi-envelope"></i> <a href="mailto:legal@nairobijethouse.com">legal@nairobijethouse.com</a></li>
                  <li><i className="bi bi-telephone"></i> <a href="tel:+254780729617">+254 724 878 136</a></li>
                  <li><i className="bi bi-geo-alt"></i> Nairobi, Kenya</li>
                </ul>
              </div>
            </div>

            <div className="legal-footer">
              <p><strong>Last Updated:</strong> June 2026</p>
              <p>These terms may be updated periodically. Please review them regularly.</p>
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