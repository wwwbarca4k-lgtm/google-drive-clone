'use client';

import styles from './Sidebar.module.css';
import { Plus, HardDrive, Monitor, Users, Clock, Star, Trash2, Cloud } from 'lucide-react';
import { useRef, useState } from 'react';

export default function Sidebar() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleNewClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Vercel Free Tier & Next.js Limit: ~4.5MB
        // We set limit to 4MB to be safe
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

            // Handle non-JSON responses (e.g. 504 Timeout, 413 Payload Too Large)
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
                // Check closely for the "Missing Auth" error
                if (data.error && data.error.includes('Missing Google Auth')) {
                    throw new Error('Server secrets are missing! Did you add the Environment Variables in Vercel?');
                }
                throw new Error(data.message || data.error || 'Upload failed');
            }

            alert('File uploaded successfully! Check your Google Drive.');
            // Refresh the page automatically to show the new file
            window.location.reload();

        } catch (error: any) {
            // Show friendlier message for network errors
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

            <button className={styles.newButton} onClick={handleNewClick} disabled={isUploading}>
                <Plus size={24} color="#1f1f1f" />
                <span>{isUploading ? 'Uploading...' : 'New'}</span>
            </button>

            <nav>
                <div className={`${styles.menuItem} ${styles.active}`}>
                    <HardDrive size={20} />
                    <span>My Drive</span>
                </div>
                <div className={styles.menuItem}>
                    <Monitor size={20} />
                    <span>Computers</span>
                </div>
                <div className={styles.menuItem}>
                    <Users size={20} />
                    <span>Shared with me</span>
                </div>
                <div className={styles.menuItem}>
                    <Clock size={20} />
                    <span>Recent</span>
                </div>
                <div className={styles.menuItem}>
                    <Star size={20} />
                    <span>Starred</span>
                </div>
                <div className={styles.menuItem}>
                    <Trash2 size={20} />
                    <span>Trash</span>
                </div>
            </nav>

            <div className={styles.storageInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cloud size={18} />
                    <span>Storage</span>
                </div>
                <div className={styles.progressBar}>
                    <div className={styles.progress}></div>
                </div>
                <span>5.4 GB of 2 TB used</span>
                <button className={styles.subscribeButton}>Get more storage</button>
            </div>
        </aside>
    );
}
