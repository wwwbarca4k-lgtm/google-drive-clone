'use client';

import styles from './Header.module.css';
import { Search, Bell, User } from 'lucide-react';

export default function Header() {
  return (
    <header className={styles.header}>
      {/* Search Bar */}
      <div className={styles.searchBar}>
        <Search size={20} />
        <input
          type="text"
          placeholder="Search files, folders, or people..."
          className={styles.searchInput}
        />
      </div>

      {/* Right Actions */}
      <div className={styles.actions}>
        <button className={styles.iconButton}>
          <Bell size={20} />
        </button>
        <div className={styles.userProfile}>
          <User size={20} />
        </div>
      </div>
    </header>
  );
}
