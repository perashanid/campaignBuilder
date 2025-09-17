
import styles from './Footer.module.css';

interface FooterProps {
  className?: string;
  onMouseEnter?: () => void;
}

export function Footer({ className, onMouseEnter }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className={`${styles.footer} ${className || ''}`}
      onMouseEnter={onMouseEnter}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.title}>Campaign Platform</h3>
            <p className={styles.description}>
              Create and share campaigns for blood donation and fundraising.
            </p>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              <li><a href="/" className={styles.link}>Home</a></li>
              <li><a href="/create" className={styles.link}>Create Campaign</a></li>
            </ul>
          </div>
          
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Support</h4>
            <ul className={styles.linkList}>
              <li><a href="#" className={styles.link}>Help Center</a></li>
              <li><a href="#" className={styles.link}>Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} Campaign Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}