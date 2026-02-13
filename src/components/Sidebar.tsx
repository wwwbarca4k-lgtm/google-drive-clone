'use client';

import styles from './Sidebar.module.css';
import { Home, Clock, Users, Star, Trash2, Settings, HardDrive } from 'lucide-react';
import { useRef, useState } from 'react';

export default function Sidebar() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            alert('File too large! This demo allows files under 4MB.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/files', {
                method: 'POST',
                body: formData,
            });

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                if (!response.ok) {
                    throw new Error(`Server Error: ${response.status} ${response.statusText}`);
                }
                throw new Error('Invalid server response');
            }

            if (!response.ok) {
                if (data.error && data.error.includes('Missing Google Auth')) {
                    throw new Error('Server secrets are missing! Did you add the Environment Variables in Vercel?');
                }
                throw new Error(data.message || data.error || 'Upload failed');
            }

            alert('File uploaded successfully! Check your Google Drive.');
            window.location.reload();

        } catch (error: any) {
            if (error.message === 'Load failed' || error.message === 'Failed to fetch') {
                alert('Network Error: The upload was interrupted. The file might be too large or the connection is slow.');
            } else {
                alert(`Error: ${error.message}`);
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <aside className={styles.sidebar}>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Logo */}
            <div className={styles.logo}>
                <HardDrive size={28} />
                <span>VANGUARD</span>
            </div>

            {/* Navigation */}
            <nav className={styles.nav}>
                <div className={`${styles.navItem} ${styles.active}`}>
                    <Home size={20} />
                    <span>Home</span>
                </div>
                <div className={styles.navItem}>
                    <Clock size={20} />
                    <span>Recent</span>
                </div>
                <div className={styles.navItem}>
                    <Users size={20} />
                    <span>Shared</span>
                </div>
                <div className={styles.navItem}>
                    <Star size={20} />
                    <span>Favourites</span>
                </div>
                <div className={styles.navItem}>
                    <Trash2 size={20} />
                    <span>Trash</span>
                </div>
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
