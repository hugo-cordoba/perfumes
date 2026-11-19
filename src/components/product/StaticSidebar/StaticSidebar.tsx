import type { ReactNode } from 'react';
import styles from './StaticSidebar.module.css';

export default function StaticSidebar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className={styles.inner}>{children}</div>
    </div>
  );
}