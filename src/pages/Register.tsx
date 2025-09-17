import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { RegisterCredentials } from '../types/user';

import styles from './Register.module.css';

export function Register() {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      <div className={styles.registerCard}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join us to start creating campaigns</p>



        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={credentials.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your full name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              minLength={6}
              className={styles.input}
              placeholder="Create a password (min 6 characters)"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={credentials.confirmPassword}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.loginDivider}>
          <span>Already have an account?</span>
        </div>

        <Link to="/login" className={styles.loginLink}>
          Sign In
        </Link>
      </div>
    </div>
  );
}