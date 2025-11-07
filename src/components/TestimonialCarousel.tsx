import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './TestimonialCarousel.module.css';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Community Organizer',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    content: 'This platform made organizing our blood donation drive incredibly easy. We reached our goal in just 2 weeks!',
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Nonprofit Director',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    content: 'The fundraising tools are powerful yet simple. We raised 150% of our target thanks to this amazing platform.',
    rating: 5
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Healthcare Worker',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    content: 'Real-time updates kept our donors engaged. The transparency features built trust with our community.',
    rating: 5
  },
  {
    id: 4,
    name: 'David Thompson',
    role: 'Volunteer Coordinator',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    content: 'User-friendly interface and excellent support. Our team was up and running in minutes!',
    rating: 5
  }
];

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [current]);

  const handleNext = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselContainer}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className={styles.testimonialCard}
          >
            <div className={styles.testimonialContent}>
              <div className={styles.imageWrapper}>
                <img 
                  src={testimonials[current].image} 
                  alt={testimonials[current].name}
                  className={styles.testimonialImage}
                />
                <div className={styles.imageGlow}></div>
              </div>
              
              <div className={styles.stars}>
                {[...Array(testimonials[current].rating)].map((_, i) => (
                  <span key={i} className={styles.star}>★</span>
                ))}
              </div>
              
              <p className={styles.quote}>"{testimonials[current].content}"</p>
              
              <div className={styles.author}>
                <h4 className={styles.name}>{testimonials[current].name}</h4>
                <p className={styles.role}>{testimonials[current].role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button 
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={handlePrev}
          aria-label="Previous testimonial"
        >
          <FiChevronLeft />
        </button>
        
        <button 
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={handleNext}
          aria-label="Next testimonial"
        >
          <FiChevronRight />
        </button>
      </div>

      <div className={styles.indicators}>
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === current ? styles.active : ''}`}
            onClick={() => {
              setDirection(index > current ? 1 : -1);
              setCurrent(index);
            }}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
