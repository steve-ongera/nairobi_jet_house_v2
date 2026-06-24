// src/pages/normal/EmergencyPage.jsx

import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Emergency Assistance | Nairobi Jet House',
  description: '24/7 emergency support for Nairobi Jet House clients. Immediate assistance for travel emergencies, medical incidents, and urgent flight changes.',
  url: 'https://www.nairobijethouse.com/emergency',
};

const EMERGENCY_CONTACTS = [
  {
    icon: 'bi-telephone-fill',
    title: '24/7 Emergency Hotline',
    description: 'For immediate assistance with flight emergencies, medical incidents, or urgent travel changes.',
    contact: '+254 724 878 136',
    type: 'phone',
  },
  {
    icon: 'bi-envelope-fill',
    title: 'Emergency Email',
    description: 'For non-urgent emergencies or when phone lines are congested. We respond within 5 minutes.',
    contact: 'nairobijethouse@gmail.com',
    type: 'email',
  },
  {
    icon: 'bi-whatsapp',
    title: 'WhatsApp Emergency',
    description: 'Send us a WhatsApp message for immediate assistance. Our team is available 24/7.',
    contact: '+254 724 878 136',
    type: 'whatsapp',
  },
];

const EMERGENCY_GUIDES = [
  {
    icon: 'bi-heart-pulse',
    title: 'Medical Emergency',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
    items: [
      'Call our emergency hotline immediately',
      'Our team will coordinate with local medical facilities',
      'We arrange medical evacuation if required',
      'Medication assistance and medical advice available',
    ],
  },
  {
    icon: 'bi-airplane',
    title: 'Flight Emergency',
    image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=400&q=80',
    items: [
      'Flight delays and cancellations assistance',
      'Alternative routing and rebooking support',
      'AOG (Aircraft on Ground) support',
      'Direct line to our operations center',
    ],
  },
  {
    icon: 'bi-shield-lock',
    title: 'Security Incident',
    image: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=400&q=80',
    items: [
      '24/7 security coordination',
      'Emergency ground transport arrangement',
      'Diplomatic and embassy contact support',
      'Travel advisory assistance',
    ],
  },
  {
    icon: 'bi-geo-alt',
    title: 'Travel Disruption',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80',
    items: [
      'Lost passport/document assistance',
      'Hotel accommodation arrangement',
      'Emergency cash assistance',
      'Local ground support coordination',
    ],
  },
];

export default function EmergencyPage() {
  return (
    <>
      <Helmet>
        <title>Emergency Assistance | Nairobi Jet House - 24/7 Support</title>
        <meta name="description" content="24/7 emergency support for Nairobi Jet House clients. Immediate assistance for travel emergencies, medical incidents, flight changes, and urgent situations." />
        <meta name="keywords" content="emergency assistance, 24/7 support, medical emergency, flight emergency, travel help, Nairobi Jet House" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/emergency" />
        <meta property="og:title" content="Emergency Assistance | Nairobi Jet House" />
        <meta property="og:description" content="24/7 emergency support for Nairobi Jet House clients. Immediate assistance for travel emergencies, medical incidents, and urgent flight changes." />
        <meta property="og:image" content="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      {/* Hero Section with Background Image */}
      <div className="page-header" style={{
        backgroundImage: 'linear-gradient(140deg, #7f1d1d 0%, #991b1b 55%, #b91c1c 100%), url(https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=1600&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundBlend: 'overlay',
      }}>
        <div className="page-header__glow"></div>
        <div className="container page-header__inner">
          <span className="section-label" style={{ color: '#fca5a5' }}>
            <i className="bi bi-exclamation-triangle-fill"></i> 24/7 Emergency Support
          </span>
          <h1>We're Here When You <em style={{ color: '#fca5a5' }}>Need Us Most</em></h1>
          <p>Immediate assistance for medical emergencies, flight disruptions, security incidents, and urgent travel needs.</p>
          <div className="hero-contact">
            <a href="tel:+254780729617" className="btn-emergency">
              <i className="bi bi-telephone-fill"></i> +254 724 878 136
            </a>
          </div>
        </div>
      </div>

      {/* Emergency Contacts Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="section-header centered">
            <div className="section-label" style={{ color: '#dc2626' }}>
              <i className="bi bi-sos"></i> Emergency Contacts
            </div>
            <h2 className="section-title">Reach Us <em style={{ color: '#dc2626' }}>Anytime, Anywhere</em></h2>
            <div className="gold-divider center"></div>
            <p className="section-subtitle">Our emergency response team is available 24/7 to assist you with any urgent situation.</p>
          </div>
          <div className="emergency-contacts-grid">
            {EMERGENCY_CONTACTS.map((item) => (
              <div key={item.title} className="emergency-contact-card">
                <div className="emergency-contact-icon">
                  <i className={`bi ${item.icon}`}></i>
                </div>
                <h3 className="emergency-contact-title">{item.title}</h3>
                <p className="emergency-contact-desc">{item.description}</p>
                <div className="emergency-contact-link">
                  {item.type === 'phone' && (
                    <a href={`tel:${item.contact.replace(/\s/g, '')}`} className="btn-emergency-outline">
                      <i className="bi bi-telephone-fill"></i> {item.contact}
                    </a>
                  )}
                  {item.type === 'email' && (
                    <a href={`mailto:${item.contact}`} className="btn-emergency-outline">
                      <i className="bi bi-envelope-fill"></i> {item.contact}
                    </a>
                  )}
                  {item.type === 'whatsapp' && (
                    <a href={`https://wa.me/${item.contact.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-emergency-outline whatsapp">
                      <i className="bi bi-whatsapp"></i> {item.contact}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Guides Section with Images */}
      <section className="section-padding" style={{ background: 'var(--color-white)' }}>
        <div className="container">
          <div className="section-header centered">
            <div className="section-label">Emergency Guidelines</div>
            <h2 className="section-title">What To Do In An <em style={{ color: 'var(--color-gold)' }}>Emergency</em></h2>
            <div className="gold-divider center"></div>
            <p className="section-subtitle">Quick reference guides for common emergency situations when traveling with us.</p>
          </div>
          <div className="emergency-guides-grid">
            {EMERGENCY_GUIDES.map((guide) => (
              <div key={guide.title} className="emergency-guide-card">
                <div className="emergency-guide-image">
                  <img src={guide.image} alt={guide.title} loading="lazy" />
                  <div className="emergency-guide-overlay">
                    <div className="emergency-guide-icon">
                      <i className={`bi ${guide.icon}`}></i>
                    </div>
                  </div>
                </div>
                <h4 className="emergency-guide-title">{guide.title}</h4>
                <ul className="emergency-guide-list">
                  {guide.items.map((item, idx) => (
                    <li key={idx}>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Information Section */}
      <section className="section-padding" style={{ background: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="emergency-important">
            <div className="emergency-important-icon">
              <i className="bi bi-info-circle-fill"></i>
            </div>
            <div className="emergency-important-content">
              <h3>Important Information</h3>
              <ul>
                <li>Have your booking reference number ready when you call.</li>
                <li>For medical emergencies, please call local emergency services first (999 in Kenya), then contact us.</li>
                <li>We maintain relationships with medical facilities across all our operating regions.</li>
                <li>Our operations center is staffed 24/7 with multilingual support.</li>
                <li>For non-emergency inquiries, please use our <Link to="/contact" style={{ color: 'var(--color-gold)' }}>regular contact channels</Link>.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />

      <style>{`
        /* Emergency Hero */
        .btn-emergency {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: #dc2626;
          color: white;
          padding: 0.75rem 2rem;
          border-radius: var(--radius-sm);
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all var(--transition-base);
          animation: pulse-emergency 2s infinite;
        }
        .btn-emergency:hover {
          background: #b91c1c;
          transform: translateY(-2px);
          color: white;
        }
        @keyframes pulse-emergency {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }

        /* Emergency Contacts Grid */
        .emergency-contacts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }
        .emergency-contact-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 2rem;
          text-align: center;
          transition: all var(--transition-base);
        }
        .emergency-contact-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-4px);
        }
        .emergency-contact-icon {
          width: 64px;
          height: 64px;
          background: rgba(220, 38, 38, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .emergency-contact-icon i {
          font-size: 1.8rem;
          color: #dc2626;
        }
        .emergency-contact-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.5rem;
        }
        .emergency-contact-desc {
          font-size: 0.85rem;
          color: var(--color-mid-gray);
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }
        .btn-emergency-outline {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border: 2px solid #dc2626;
          color: #dc2626;
          border-radius: var(--radius-sm);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all var(--transition-base);
        }
        .btn-emergency-outline:hover {
          background: #dc2626;
          color: white;
        }
        .btn-emergency-outline.whatsapp {
          border-color: #25D366;
          color: #25D366;
        }
        .btn-emergency-outline.whatsapp:hover {
          background: #25D366;
          color: white;
        }

        /* Emergency Guides Grid with Images */
        .emergency-guides-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }
        .emergency-guide-card {
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          overflow: hidden;
          transition: all var(--transition-base);
        }
        .emergency-guide-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-4px);
        }
        .emergency-guide-image {
          position: relative;
          height: 180px;
          overflow: hidden;
        }
        .emergency-guide-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .emergency-guide-card:hover .emergency-guide-image img {
          transform: scale(1.05);
        }
        .emergency-guide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(11, 28, 54, 0.7) 0%, rgba(11, 28, 54, 0.3) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .emergency-guide-icon {
          width: 56px;
          height: 56px;
          background: rgba(200, 164, 90, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .emergency-guide-icon i {
          font-size: 1.6rem;
          color: var(--color-navy);
        }
        .emergency-guide-title {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-navy);
          padding: 1rem 1.25rem 0.5rem 1.25rem;
          margin: 0;
        }
        .emergency-guide-list {
          list-style: none;
          padding: 0 1.25rem 1.25rem 1.25rem;
          margin: 0;
        }
        .emergency-guide-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--color-dark-gray);
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }
        .emergency-guide-list li i {
          color: var(--color-gold);
          font-size: 0.7rem;
          margin-top: 0.2rem;
          flex-shrink: 0;
        }

        /* Important Info */
        .emergency-important {
          display: flex;
          gap: 1.5rem;
          background: var(--color-white);
          border: 1px solid var(--color-light-gray);
          padding: 2rem;
          max-width: 860px;
          margin: 0 auto;
          transition: all var(--transition-base);
        }
        .emergency-important:hover {
          box-shadow: var(--shadow-md);
        }
        .emergency-important-icon {
          flex-shrink: 0;
        }
        .emergency-important-icon i {
          font-size: 2.5rem;
          color: var(--color-gold);
        }
        .emergency-important-content h3 {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-navy);
          margin-bottom: 0.75rem;
        }
        .emergency-important-content ul {
          margin: 0;
          padding-left: 1.25rem;
        }
        .emergency-important-content li {
          color: var(--color-dark-gray);
          line-height: 1.7;
          margin-bottom: 0.4rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .emergency-contacts-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .emergency-guides-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .emergency-contacts-grid {
            grid-template-columns: 1fr;
          }
          .emergency-guides-grid {
            grid-template-columns: 1fr;
          }
          .emergency-important {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }
          .emergency-important-icon i {
            font-size: 2rem;
          }
          .emergency-important-content ul {
            text-align: left;
          }
          .emergency-guide-image {
            height: 150px;
          }
        }
        @media (max-width: 480px) {
          .btn-emergency {
            font-size: 0.95rem;
            padding: 0.6rem 1.5rem;
          }
          .emergency-contact-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}