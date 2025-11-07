import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiGrid, FiLayout, FiPlusCircle, FiBarChart2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import styles from './Header.module.css';

interface HeaderProps {
  className?: string;
  onMouseEnter?: () => void;
}

export function Header({ className = '', onMouseEnter }: HeaderProps) {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const getNavLinkClass = (path: string) => {
    return `${styles.navLink} ${location.pathname === path ? styles.active : ''}`;
  };

  const handleLogout = () => {
    logout();
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
        <Link to="/" className={styles.logo}>
          <motion.h1 
            className={styles.logoText}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Campaign Platform
          </motion.h1>
        </Link>
        
        <nav className={styles.nav}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className={getNavLinkClass('/')}>
              <FiHome className={styles.navIcon} />
              <span>Home</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/campaigns" className={getNavLinkClass('/campaigns')}>
              <FiGrid className={styles.navIcon} />
              <span>Campaigns</span>
            </Link>
          </motion.div>
          {isAuthenticated && (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/dashboard" className={getNavLinkClass('/dashboard')}>
                  <FiLayout className={styles.navIcon} />
                  <span>Dashboard</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/analytics" className={getNavLinkClass('/analytics')}>
                  <FiBarChart2 className={styles.navIcon} />
                  <span>Analytics</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/create" className={getNavLinkClass('/create')}>
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
                <Link to="/login" className={styles.loginButton}>
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className={styles.registerButton}>
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