import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const TypewriterText = ({ text, className = '', delay = 0 }: TypewriterTextProps) => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const words = text.split(' ');

  return (
    <motion.p ref={ref as any} className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: 0.3,
            delay: delay + index * 0.05,
            ease: 'easeOut'
          }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
};
