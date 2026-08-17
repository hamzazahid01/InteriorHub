import React from "react";
import styles from "./FloatingContact.module.css";
import { getWhatsappUrl, getTelLink, phoneDisplay } from "../../utils/contact";

export default function FloatingContact() {
  const whatsappUrl = getWhatsappUrl();
  const telLink = getTelLink();

  return (
    <div className={styles.wrapper} aria-hidden={false}>
      <a
        className={styles.button}
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open WhatsApp chat with ${phoneDisplay}`}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
          <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 .02 5.28.02 11.79c0 2.08.54 4.02 1.48 5.74L0 24l6.73-1.77A11.84 11.84 0 0012 23.58c6.63 0 11.98-5.28 11.98-11.79 0-3.16-1.22-6.12-3.46-8.31zM12 21.5c-1.5 0-2.96-.39-4.27-1.13l-.31-.18-3.99 1.05 1.07-3.88-.19-.32A8.62 8.62 0 013.4 11.79C3.4 7.08 7.31 3.5 12 3.5c4.69 0 8.6 3.58 8.6 8.29 0 4.71-3.91 8.29-8.6 8.29z" />
        </svg>
      </a>

      <a
        className={styles.call}
        href={telLink}
        aria-label={`Call ${phoneDisplay}`}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
          <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 01.95-.27 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h2.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.27.95l-2.18 2.28z" />
        </svg>
      </a>
    </div>
  );
}
