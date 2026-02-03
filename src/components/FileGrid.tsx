'use client';

import styles from './FileGrid.module.css';
import { Folder, FileText, Image, File, MoreVertical, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DriveFile {
    id: string;
    name: string;
    type: string;
    owner: string;
    modified: string;
    size: string;
    link: string;
    icon?: string;
}

export default function FileGrid() {
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

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('folder')) return <Folder size={20} fill="#5f6368" color="#5f6368" />;
        if (mimeType.includes('image')) return <Image size={20} color="#d93025" />;
        if (mimeType.includes('pdf')) return <FileText size={20} color="#ea4335" />;
        return <File size={20} color="#1a73e8" />;
    };

    return (
        <div className={styles.container}>
            <div className={styles.sectionTitle}>Files</div>

            <div className={`${styles.fileRow} ${styles.headerRow}`}>
                <div>Name</div>
                <div>Owner</div>
                <div>Last modified</div>
                <div>File size</div>
            </div>

            {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Loading your files...</div>}

            {!loading && files.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    No files found in this folder. Try uploading one!
                </div>
            )}

            {files.map((file) => (
                <a
                    key={file.id}
                    href={file.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fileRow}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    <div className={styles.fileName}>
                        {getFileIcon(file.type)}
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                            {file.name}
                        </span>
                    </div>
                    <div>{file.owner}</div>
                    <div>{file.modified}</div>
                    <div>{file.size}</div>
                </a>
            ))}
        </div>
    );
}
