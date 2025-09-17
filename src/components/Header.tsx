import { Link, useLocation } from 'react-router-dom';
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
    <header 
      className={`${styles.header} ${className}`}
      onMouseEnter={onMouseEnter}
    >
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <h1 className={styles.logoText}>Campaign Platform</h1>
        </Link>
        
        <nav className={styles.nav}>
          <Link to="/" className={getNavLinkClass('/')}>
            Home
          </Link>
          <Link to="/campaigns" className={getNavLinkClass('/campaigns')}>
            Campaigns
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={getNavLinkClass('/dashboard')}>
                Dashboard
              </Link>
              <Link to="/create" className={getNavLinkClass('/create')}>
                Create Campaign
              </Link>
            </>
          )}
        </nav>
        
        <div className={styles.actions}>
          <ThemeToggle />
          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>Hi, {user?.name}</span>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.loginButton}>
                Login
              </Link>
              <Link to="/register" className={styles.registerButton}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}