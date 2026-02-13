'use client';

import styles from './Dashboard.module.css';
import { FolderPlus, Upload, FileText, Image as ImageIcon, Video, Music, File as FileIcon } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

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

export default function Dashboard() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
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

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

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

            alert('File uploaded successfully!');
            window.location.reload();

        } catch (error: any) {
            if (error.message === 'Load failed' || error.message === 'Failed to fetch') {
                alert('Network Error: The upload was interrupted.');
            } else {
                alert(`Error: ${error.message}`);
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon size={18} />;
        if (type.includes('video')) return <Video size={18} />;
        if (type.includes('audio')) return <Music size={18} />;
        if (type.includes('pdf') || type.includes('document')) return <FileText size={18} />;
        return <FileIcon size={18} />;
    };

    return (
        <main className={styles.dashboard}>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* Header Section */}
            <div className={styles.dashboardHeader}>
                <div>
                    <h1 className={styles.title}>My Cloud.</h1>
                    <p className={styles.subtitle}>
                        You have used <span className={styles.highlight}>70%</span> of your total storage. Manage your files efficiently.
                    </p>
                </div>
                <div className={styles.actionButtons}>
                    <button className={styles.secondaryBtn}>
                        <FolderPlus size={20} />
                        New Folder
                    </button>
                    <button className={styles.primaryBtn} onClick={handleUploadClick} disabled={isUploading}>
                        <Upload size={20} />
                        {isUploading ? 'Uploading...' : 'Upload Files'}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>STORAGE</span>
                        <span className={styles.statBadge}>MAX CAPACITY</span>
                    </div>
                    <div className={styles.statValue}>2TB</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>USED STORAGE</span>
                    </div>
                    <div className={styles.statValue}>1.4TB</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>SHARED FILES</span>
                        <span className={styles.statBadge} style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' }}>Active</span>
                    </div>
                    <div className={styles.statValue}>{files.length}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>DEVICES CONNECTED</span>
                        <span className={styles.statBadge} style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>Syncing</span>
                    </div>
                    <div className={styles.statValue}>4</div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className={styles.contentGrid}>
                {/* Storage Breakdown */}
                <div className={styles.storageBreakdown}>
                    <div className={styles.sectionHeader}>
                        <h3>Storage Usage Breakdown</h3>
                        <p>Detailed analysis of your file distribution</p>
                    </div>
                    <div className={styles.colorBar}>
                        <div style={{ width: '45%', background: '#6366f1' }}></div>
                        <div style={{ width: '25%', background: '#a855f7' }}></div>
                        <div style={{ width: '15%', background: '#f59e0b' }}></div>
                        <div style={{ width: '10%', background: '#22c55e' }}></div>
                        <div style={{ width: '5%', background: '#64748b' }}></div>
                    </div>
                    <div className={styles.legend}>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{ background: '#6366f1' }}></span>
                            <span>PHOTOS (45%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{ background: '#a855f7' }}></span>
                            <span>VIDEOS (25%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{ background: '#f59e0b' }}></span>
                            <span>DOCUMENTS (15%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{ background: '#22c55e' }}></span>
                            <span>MUSIC (10%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{ background: '#64748b' }}></span>
                            <span>OTHER (5%)</span>
                        </div>
                    </div>
                    <div className={styles.categoryCards}>
                        <div className={styles.categoryCard}>
                            <ImageIcon size={24} color="#6366f1" />
                            <div>
                                <div className={styles.categoryName}>Photos</div>
                                <div className={styles.categorySize}>630 GB</div>
                            </div>
                        </div>
                        <div className={styles.categoryCard}>
                            <Video size={24} color="#a855f7" />
                            <div>
                                <div className={styles.categoryName}>Videos</div>
                                <div className={styles.categorySize}>350 GB</div>
                            </div>
                        </div>
                        <div className={styles.categoryCard}>
                            <FileText size={24} color="#f59e0b" />
                            <div>
                                <div className={styles.categoryName}>Documents</div>
                                <div className={styles.categorySize}>210 GB</div>
                            </div>
                        </div>
                        <div className={styles.categoryCard}>
                            <Music size={24} color="#22c55e" />
                            <div>
                                <div className={styles.categoryName}>Music</div>
                                <div className={styles.categorySize}>140 GB</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className={styles.recentActivity}>
                    <div className={styles.sectionHeader}>
                        <h3>Recent Activity</h3>
                    </div>
                    <div className={styles.activityList}>
                        {files.slice(0, 3).map((file) => (
                            <div key={file.id} className={styles.activityItem}>
                                <div className={styles.activityIcon}>
                                    {getFileIcon(file.type)}
                                </div>
                                <div className={styles.activityDetails}>
                                    <div className={styles.activityName}>{file.name}</div>
                                    <div className={styles.activityTime}>{file.modified}</div>
                                </div>
                            </div>
                        ))}
                        {files.length === 0 && !loading && (
                            <div className={styles.emptyState}>No recent activity</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Files */}
            <div className={styles.recentFiles}>
                <div className={styles.sectionHeader}>
                    <h3>Recent Files</h3>
                    <button className={styles.viewAllBtn}>View All Files</button>
                </div>
                <div className={styles.filesList}>
                    {loading && <div className={styles.loading}>Loading files...</div>}
                    {!loading && files.length === 0 && (
                        <div className={styles.emptyState}>No files found. Try uploading one!</div>
                    )}
                    {files.slice(0, 4).map((file) => (
                        <a
                            key={file.id}
                            href={file.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.fileCard}
                        >
                            <div className={styles.fileIcon}>
                                {getFileIcon(file.type)}
                            </div>
                            <div className={styles.fileInfo}>
                                <div className={styles.fileName}>{file.name}</div>
                                <div className={styles.fileSize}>{file.size}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </main>
    );
}
