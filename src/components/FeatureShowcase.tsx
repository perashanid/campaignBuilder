import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import styles from './FeatureShowcase.module.css';

const features = [
  'Easy campaign creation in minutes',
  'Real-time progress tracking',
  'Social media integration',
  'Secure payment processing',
  'Mobile-responsive design',
  'Detailed analytics and insights',
  'Performance optimization reports',
  'Email notifications',
  '24/7 support'
];

export function FeatureShowcase() {
  return (
    <div className={styles.showcase}>
      <div className={styles.showcaseInner}>
        <motion.div
          className={styles.imageSection}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.imageWrapper}>
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop" 
              alt="Campaign dashboard and analytics"
              className={styles.showcaseImage}
            />
          </div>
        </motion.div>

        <motion.div
          className={styles.contentSection}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className={styles.title}>Everything You Need to Succeed</h3>
          <p className={styles.description}>
            Our platform provides all the tools and features you need to run successful campaigns
          </p>
          
          <div className={styles.featureList}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.featureItem}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <div className={styles.checkIcon}>
                  <FiCheck />
                </div>
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
