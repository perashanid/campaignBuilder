import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiTrendingUp, FiEye, FiTarget } from 'react-icons/fi';
import styles from './AnalyticsPreview.module.css';

export function AnalyticsPreview() {
  return (
    <div className={styles.preview}>
      <div className={styles.previewInner}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.badge}>
            <FiBarChart2 /> Analytics
          </div>
          <h2 className={styles.title}>Get Detailed Insights & Reports</h2>
          <p className={styles.description}>
            Track your campaign performance with comprehensive analytics. Monitor views, 
            engagement, and funding progress in real-time to optimize your results.
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <FiEye className={styles.featureIcon} />
              <div>
                <h4>View Tracking</h4>
                <p>Monitor campaign visibility</p>
              </div>
            </div>
            <div className={styles.feature}>
              <FiTrendingUp className={styles.featureIcon} />
              <div>
                <h4>Progress Analytics</h4>
                <p>Track funding milestones</p>
              </div>
            </div>
            <div className={styles.feature}>
              <FiTarget className={styles.featureIcon} />
              <div>
                <h4>Optimization Tips</h4>
                <p>Get actionable recommendations</p>
              </div>
            </div>
          </div>

          <Link to="/analytics" className={styles.ctaButton}>
            View Analytics Dashboard
          </Link>
        </motion.div>

        <motion.div
          className={styles.visualization}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.chart}>
            <div className={styles.chartHeader}>
              <h4>Campaign Performance</h4>
              <span className={styles.chartPeriod}>Last 30 days</span>
            </div>
            <div className={styles.chartBars}>
              <motion.div 
                className={styles.bar} 
                style={{ height: '60%' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className={styles.barFill}></div>
                <span>Week 1</span>
              </motion.div>
              <motion.div 
                className={styles.bar} 
                style={{ height: '75%' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className={styles.barFill}></div>
                <span>Week 2</span>
              </motion.div>
              <motion.div 
                className={styles.bar} 
                style={{ height: '90%' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className={styles.barFill}></div>
                <span>Week 3</span>
              </motion.div>
              <motion.div 
                className={styles.bar} 
                style={{ height: '100%' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className={styles.barFill}></div>
                <span>Week 4</span>
              </motion.div>
            </div>
          </div>
          
          <div className={styles.statsGrid}>
            <motion.div 
              className={styles.stat}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <div className={styles.statValue}>2.5K</div>
              <div className={styles.statLabel}>Total Views</div>
            </motion.div>
            <motion.div 
              className={styles.stat}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <div className={styles.statValue}>85%</div>
              <div className={styles.statLabel}>Avg Progress</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
