import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './StatsCounter.module.css';

interface Stat {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}

const stats: Stat[] = [
  { value: 5000, label: 'Lives Saved', suffix: '+' },
  { value: 250, label: 'Active Campaigns', suffix: '+' },
  { value: 1000000, label: 'Funds Raised', prefix: '$', suffix: '+' },
  { value: 98, label: 'Success Rate', suffix: '%' }
];

function Counter({ value, duration = 2, prefix = '', suffix = '' }: { 
  value: number; 
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration, isInView]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  };

  return (
    <span ref={ref}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
}

export function StatsCounter() {
  return (
    <div className={styles.statsSection}>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className={styles.statCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className={styles.statValue}>
              <Counter 
                value={stat.value} 
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </div>
            <div className={styles.statLabel}>{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
