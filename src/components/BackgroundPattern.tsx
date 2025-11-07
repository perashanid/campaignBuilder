import styles from './BackgroundPattern.module.css';

export function BackgroundPattern() {
  return (
    <div className={styles.pattern}>
      <div className={styles.grid}></div>
      <div className={styles.gradient1}></div>
      <div className={styles.gradient2}></div>
    </div>
  );
}
