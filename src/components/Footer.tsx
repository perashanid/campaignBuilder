import { motion } from 'framer-motion';
import { FiHeart, FiMail, FiGithub, FiTwitter } from 'react-icons/fi';
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
              Create and share campaigns for blood donation and fundraising.
            </p>
            <div className={styles.socialLinks}>
              <motion.a 
                href="#" 
                className={styles.socialLink}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiGithub />
              </motion.a>
              <motion.a 
                href="#" 
                className={styles.socialLink}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiTwitter />
              </motion.a>
              <motion.a 
                href="#" 
                className={styles.socialLink}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiMail />
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
            <h4 className={styles.sectionTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              <li>
                <motion.a 
                  href="/" 
                  className={styles.link}
                  whileHover={{ x: 5 }}
                >
                  Home
                </motion.a>
              </li>
              <li>
                <motion.a 
                  href="/create" 
                  className={styles.link}
                  whileHover={{ x: 5 }}
                >
                  Create Campaign
                </motion.a>
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
            <h4 className={styles.sectionTitle}>Support</h4>
            <ul className={styles.linkList}>
              <li>
                <motion.a 
                  href="#" 
                  className={styles.link}
                  whileHover={{ x: 5 }}
                >
                  Help Center
                </motion.a>
              </li>
              <li>
                <motion.a 
                  href="#" 
                  className={styles.link}
                  whileHover={{ x: 5 }}
                >
                  Contact Us
                </motion.a>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <motion.div 
          className={styles.bottom}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className={styles.copyright}>
            © {currentYear} Campaign Platform. Made with <FiHeart className={styles.heartIcon} /> for a better world.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}