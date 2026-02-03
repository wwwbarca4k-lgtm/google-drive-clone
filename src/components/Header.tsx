'use client';

import styles from './Header.module.css';
import { Search, Settings, HelpCircle, AppWindow, CircleUser } from 'lucide-react';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo_%282020%29.svg" 
          alt="Drive Logo" 
          className={styles.logoIcon} 
        />
        <span>Drive</span>
      </div>
      
      <div className={styles.searchBar}>
        <Search color="#444746" />
        <input 
          type="text" 
          placeholder="Search in Drive" 
          className={styles.searchInput} 
        />
      </div>

      <div className={styles.actions}>
        <button><HelpCircle color="#444746" /></button>
        <button><Settings color="#444746" /></button>
        <button><AppWindow color="#444746" /></button>
        <button><CircleUser color="#444746" size={32} /></button>
      </div>
    </header>
  );
}
