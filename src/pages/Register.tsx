import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiUserPlus, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { RegisterCredentials } from '../types/user';
import { AnimatedButton } from '../components/AnimatedButton';
import styles from './Register.module.css';

export function Register() {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (credentials.password !== credentials.confirmPassword) {
      showNotification({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      await register(credentials);
      showNotification({ message: 'Account created successfully!', type: 'success' });
      navigate('/dashboard');
    } catch (error) {
      showNotification({
        message: error instanceof Error ? error.message : 'Registration failed',
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
        className={styles.registerCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join us to start creating campaigns</p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          className={styles.form}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              <FiUser className={styles.labelIcon} />
              Full Name
            </label>
            <motion.input
              type="text"
              id="name"
              name="name"
              value={credentials.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your full name"
              whileFocus={{ scale: 1.01 }}
            />
          </div>

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
            <div className={styles.passwordWrapper}>
              <motion.input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                minLength={6}
                className={styles.input}
                placeholder="Create a password (min 6 characters)"
                whileFocus={{ scale: 1.01 }}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              <FiLock className={styles.labelIcon} />
              Confirm Password
            </label>
            <div className={styles.passwordWrapper}>
              <motion.input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={credentials.confirmPassword}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Confirm your password"
                whileFocus={{ scale: 1.01 }}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <AnimatedButton
            type="submit"
            disabled={isSubmitting}
            size="large"
          >
            <FiUserPlus className={styles.buttonIcon} />
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </AnimatedButton>
        </motion.form>

        <motion.div 
          className={styles.loginDivider}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span>Already have an account?</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/login" className={styles.loginLink}>
            <FiLogIn className={styles.buttonIcon} />
            Sign In
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}