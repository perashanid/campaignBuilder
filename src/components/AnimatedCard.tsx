import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './AnimatedCard.module.css';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const AnimatedCard = ({ children, className = '', hover = true }: AnimatedCardProps) => {
  return (
    <motion.div
      className={`${styles.card} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' } : {}}
    >
      {children}
    </motion.div>
  );
};
