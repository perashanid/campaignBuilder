import { motion } from 'framer-motion';
import { FiUserPlus, FiEdit3, FiShare2, FiTrendingUp } from 'react-icons/fi';
import styles from './HowItWorks.module.css';

const steps = [
  {
    icon: <FiUserPlus />,
    title: 'Sign Up',
    description: 'Create your free account in seconds and join our community'
  },
  {
    icon: <FiEdit3 />,
    title: 'Create Campaign',
    description: 'Set up your fundraising or blood donation campaign with our easy tools'
  },
  {
    icon: <FiShare2 />,
    title: 'Share & Promote',
    description: 'Spread the word through social media and reach your audience'
  },
  {
    icon: <FiTrendingUp />,
    title: 'Track Progress',
    description: 'Monitor real-time updates and engage with your supporters'
  }
];

export function HowItWorks() {
  return (
    <div className={styles.howItWorks}>
      <div className={styles.header}>
        <motion.h2 
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.h2>
        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Get started in four simple steps
        </motion.p>
      </div>

      <div className={styles.stepsContainer}>
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className={styles.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
          >
            <div className={styles.stepNumber}>{index + 1}</div>
            <div className={styles.stepIcon}>{step.icon}</div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepDescription}>{step.description}</p>
            {index < steps.length - 1 && (
              <div className={styles.connector}>
                <svg viewBox="0 0 100 100" className={styles.arrow}>
                  <path d="M 20 50 L 80 50" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M 70 40 L 80 50 L 70 60" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
