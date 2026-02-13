'use client';

import styles from './Sidebar.module.css';
import { Home, Clock, Users, Star, Trash2, Settings, HardDrive } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', icon: Home, label: 'Home' },
        { href: '/recent', icon: Clock, label: 'Recent' },
        { href: '/favourites', icon: Star, label: 'Favourites' },
        { href: '/trash', icon: Trash2, label: 'Trash' },
    ];

    return (
        <aside className={styles.sidebar}>
            {/* Logo */}
            <div className={styles.logo}>
                <HardDrive size={28} />
                <span>VANGUARD</span>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Settings at bottom */}
            <div className={styles.bottomSection}>
                <div className={styles.navItem}>
                    <Settings size={20} />
                    <span>Settings</span>
                </div>

                {/* Storage Usage */}
                <div className={styles.storageCard}>
                    <div className={styles.storageHeader}>
                        <span className={styles.storageLabel}>STORAGE USAGE</span>
                        <span className={styles.storagePercent}>70%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progress} style={{ width: '70%' }}></div>
                    </div>
                    <div className={styles.storageText}>1.4TB of 2TB</div>
                </div>
            </div>
        </aside>
    );
}
