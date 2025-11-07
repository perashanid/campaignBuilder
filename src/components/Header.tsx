import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiLayout, FiPlusCircle, FiBarChart2, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  className?: string;
  onMouseEnter?: () => void;
}

export function Header({ className = '', onMouseEnter }: HeaderProps) {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavLinkClass = (path: string) => {
    return `${styles.navLink} ${location.pathname === path ? styles.active : ''}`;
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <motion.header 
      className={`${styles.header} ${className}`}
      onMouseEnter={onMouseEnter}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={closeMobileMenu}>
          <motion.h1 
            className={styles.logoText}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Campaign Platform
          </motion.h1>
        </Link>
        
        <button 
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
        
        <nav className={`${styles.nav} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/campaigns" className={getNavLinkClass('/campaigns')} onClick={closeMobileMenu}>
              <FiGrid className={styles.navIcon} />
              <span>Campaigns</span>
            </Link>
          </motion.div>
          {isAuthenticated && (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/dashboard" className={getNavLinkClass('/dashboard')} onClick={closeMobileMenu}>
                  <FiLayout className={styles.navIcon} />
                  <span>Dashboard</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/analytics" className={getNavLinkClass('/analytics')} onClick={closeMobileMenu}>
                  <FiBarChart2 className={styles.navIcon} />
                  <span>Analytics</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/create" className={getNavLinkClass('/create')} onClick={closeMobileMenu}>
                  <FiPlusCircle className={styles.navIcon} />
                  <span>Create</span>
                </Link>
              </motion.div>
            </>
          )}
        </nav>
        
        <div className={styles.actions}>
          <ThemeToggle />
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>Hi, {user?.name}</span>
              <motion.button 
                onClick={handleLogout} 
                className={styles.logoutButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className={styles.loginButton} onClick={closeMobileMenu}>
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className={styles.registerButton} onClick={closeMobileMenu}>
                  Sign Up
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}