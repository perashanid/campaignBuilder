import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiMail, FiGithub, FiTwitter, FiLinkedin, FiFacebook, FiInstagram } from 'react-icons/fi';
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
          <motion.div 
            className={styles.section}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className={styles.title}>Campaign Platform</h3>
            <p className={styles.description}>
              Empowering communities through blood donation and fundraising campaigns. 
              Together, we can make a difference and save lives.
            </p>
            <div className={styles.socialLinks}>
              <motion.a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="GitHub"
              >
                <FiGithub />
              </motion.a>
              <motion.a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Twitter"
              >
                <FiTwitter />
              </motion.a>
              <motion.a 
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="LinkedIn"
              >
                <FiLinkedin />
              </motion.a>
              <motion.a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Facebook"
              >
                <FiFacebook />
              </motion.a>
              <motion.a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Instagram"
              >
                <FiInstagram />
              </motion.a>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.section}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className={styles.sectionTitle}>Platform</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/" className={styles.link}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/campaigns" className={styles.link}>
                  Browse Campaigns
                </Link>
              </li>
              <li>
                <Link to="/create" className={styles.link}>
                  Create Campaign
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className={styles.link}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className={styles.link}>
                  How It Works
                </Link>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            className={styles.section}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className={styles.sectionTitle}>Resources</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/about" className={styles.link}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className={styles.link}>
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className={styles.link}>
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/faq" className={styles.link}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className={styles.link}>
                  Campaign Guidelines
                </Link>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            className={styles.section}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className={styles.sectionTitle}>Support</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/help" className={styles.link}>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className={styles.link}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/safety" className={styles.link}>
                  Safety & Trust
                </Link>
              </li>
              <li>
                <Link to="/report" className={styles.link}>
                  Report Issue
                </Link>
              </li>
              <li>
                <a href="mailto:support@campaignplatform.com" className={styles.link}>
                  <FiMail style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Email Support
                </a>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            className={styles.section}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h4 className={styles.sectionTitle}>Legal</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/terms" className={styles.link}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={styles.link}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className={styles.link}>
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className={styles.link}>
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/accessibility" className={styles.link}>
                  Accessibility
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <motion.div 
          className={styles.bottom}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className={styles.bottomContent}>
            <p className={styles.copyright}>
              © {currentYear} Campaign Platform. Made with <FiHeart className={styles.heartIcon} /> for a better world.
            </p>
            <div className={styles.bottomLinks}>
              <Link to="/sitemap" className={styles.bottomLink}>Sitemap</Link>
              <span className={styles.separator}>•</span>
              <Link to="/status" className={styles.bottomLink}>Status</Link>
              <span className={styles.separator}>•</span>
              <Link to="/careers" className={styles.bottomLink}>Careers</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}