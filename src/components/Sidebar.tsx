'use client';

import styles from './Sidebar.module.css';
import { Home, Clock, Star, Trash2, Settings, HardDrive } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const [usedBytes, setUsedBytes] = useState(0);

    const TOTAL_BYTES = 15 * 1024 * 1024 * 1024; // 15GB

    useEffect(() => {
        async function fetchUsage() {
            try {
                const res = await fetch('/api/files');
                const data = await res.json();
                if (data.files) {
                    const total = data.files.reduce((acc: number, f: any) => acc + (f.sizeBytes || 0), 0);
                    setUsedBytes(total);
                }
            } catch (e) {
                console.error('Failed to fetch storage usage', e);
            }
        }
        fetchUsage();
    }, []);

    const usedPercent = TOTAL_BYTES > 0 ? Math.min(Math.round((usedBytes / TOTAL_BYTES) * 100), 100) : 0;

    const formatSize = (bytes: number): string => {
        if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return bytes + ' B';
    };

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
                        <span className={styles.storagePercent}>{usedPercent}%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progress} style={{ width: `${usedPercent}%` }}></div>
                    </div>
                    <div className={styles.storageText}>{formatSize(usedBytes)} of 15 GB</div>
                </div>
            </div>
        </aside>
    );
}
