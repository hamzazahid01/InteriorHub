import { Helmet } from "react-helmet-async";
import { pageMeta } from "../../utils/seo";
import styles from "./ContactPage.module.css";

export default function ContactPage() {
  const phoneDisplay = "+971503892838";
  const whatsappNumber = "971503892838";
  const whatsappMessage =
    "Hello, I would like to inquire about your products and services.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <div className="container">
      <Helmet>
        <title>{pageMeta("contact").title}</title>
        <meta name="description" content={pageMeta("contact").description} />
      </Helmet>

      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.lead}>
            InteriorHub is a professional interior solutions company serving clients across the
            entire UAE. We supply premium products throughout all Emirates with a focus on
            reliability, quality materials, and clear communication—supporting both residential
            and commercial projects.
          </p>
          <p className={styles.lead}>
            Our factory is located in Al-Sajja Industrial Area, Sharjah, enabling efficient
            production, customization, and dependable delivery. Trusted by clients across the
            UAE, we’re customer-focused from first inquiry to final handover.
          </p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Why Choose InteriorHub?</h2>
          <div className={styles.whyGrid}>
            {[
              "UAE-wide service coverage",
              "Direct factory pricing",
              "High quality materials",
              "Professional team",
              "On-time delivery",
              "Custom solutions available",
              "Customer satisfaction focused",
              "Reliable communication",
            ].map((t) => (
              <div key={t} className={styles.whyCard}>
                <div className={styles.whyDot} aria-hidden="true" />
                <div className={styles.whyText}>{t}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact Details</h2>

          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <div className={styles.contactLabel}>Phone Number</div>
              <a className={styles.contactValue} href={`tel:${phoneDisplay}`}>
                {phoneDisplay}
              </a>
              <div className={styles.contactHint}>Available across all Emirates.</div>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactLabel}>WhatsApp Number</div>
              <a className={styles.contactValue} href={whatsappUrl} target="_blank" rel="noreferrer">
                {phoneDisplay}
              </a>
              <div className={styles.contactHint}>Fast replies for products and services.</div>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <a className={styles.whatsappBtn} href={whatsappUrl} target="_blank" rel="noreferrer">
              Contact on WhatsApp
            </a>
            <div className={styles.ctaNote}>
              Prefilled message: “Hello, I would like to inquire about your products and
              services.”
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

