'use client';

import styles from '../page.module.css';
import { Users, FileText, Image as ImageIcon, Video, Music, File as FileIcon, Folder } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DriveFile {
    id: string;
    name: string;
    type: string;
    owner: string;
    modified: string;
    size: string;
    link: string;
}

export default function SharedPage() {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFiles() {
            try {
                const res = await fetch('/api/files');
                const data = await res.json();
                if (data.files) {
                    setFiles(data.files);
                }
            } catch (error) {
                console.error('Failed to fetch files', error);
            } finally {
                setLoading(false);
            }
        }
        fetchFiles();
    }, []);

    const getFileIcon = (type: string) => {
        if (type.includes('folder')) return <Folder size={18} />;
        if (type.includes('image')) return <ImageIcon size={18} />;
        if (type.includes('video')) return <Video size={18} />;
        if (type.includes('audio')) return <Music size={18} />;
        if (type.includes('pdf') || type.includes('document')) return <FileText size={18} />;
        return <FileIcon size={18} />;
    };

    const getIconStyle = (type: string) => {
        if (type.includes('folder')) return styles.fileIconBlue;
        if (type.includes('image')) return styles.fileIconBlue;
        if (type.includes('video')) return styles.fileIconPurple;
        if (type.includes('audio')) return styles.fileIconGreen;
        return styles.fileIconYellow;
    };

    return (
        <main className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Shared</h1>
                <p className={styles.pageSubtitle}>Files shared with you by others</p>
            </div>

            <div className={styles.fileTable}>
                <div className={styles.tableHeader}>
                    <div>Name</div>
                    <div>Shared By</div>
                    <div>Date Shared</div>
                    <div>Size</div>
                </div>

                {loading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                        Loading files...
                    </div>
                )}

                {!loading && files.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <Users size={36} />
                        </div>
                        <div className={styles.emptyTitle}>No shared files</div>
                        <div className={styles.emptySubtitle}>Files shared with you will appear here</div>
                    </div>
                )}

                {files.map((file) => (
                    <a
                        key={file.id}
                        href={file.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.fileRow}
                    >
                        <div className={styles.fileName}>
                            <div className={`${styles.fileIcon} ${getIconStyle(file.type)}`}>
                                {getFileIcon(file.type)}
                            </div>
                            <span className={styles.nameText}>{file.name}</span>
                        </div>
                        <div className={styles.secondaryText}>{file.owner}</div>
                        <div className={styles.secondaryText}>{file.modified}</div>
                        <div className={styles.secondaryText}>{file.size}</div>
                    </a>
                ))}
            </div>
        </main>
    );
}
