import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { LoginCredentials } from '../types/user';
import { AnimatedButton } from '../components/AnimatedButton';
import styles from './Login.module.css';

export function Login() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(credentials);
      showNotification({ message: 'Login successful!', type: 'success' });
      navigate(from, { replace: true });
    } catch (error) {
      showNotification({
        message: error instanceof Error ? error.message : 'Login failed',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.loginCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to manage your campaigns</p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          className={styles.form}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              <FiMail className={styles.labelIcon} />
              Email Address
            </label>
            <motion.input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your email"
              whileFocus={{ scale: 1.01 }}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              <FiLock className={styles.labelIcon} />
              Password
            </label>
            <motion.input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your password"
              whileFocus={{ scale: 1.01 }}
            />
          </div>

          <AnimatedButton
            type="submit"
            disabled={isSubmitting}
            size="large"
          >
            <FiLogIn className={styles.buttonIcon} />
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </AnimatedButton>
        </motion.form>

        <motion.div 
          className={styles.registerDivider}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span>Don't have an account?</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/register" className={styles.registerLink}>
            <FiUserPlus className={styles.buttonIcon} />
            Create Account
          </Link>
        </motion.div>

        <motion.div 
          className={styles.demoInfo}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>Demo credentials:</p>
          <p>Email: demo@example.com</p>
          <p>Password: demo123</p>
        </motion.div>
      </motion.div>
    </div>
  );
}