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
    sizeBytes: number;
    link: string;
    icon?: string;
}

export default function Dashboard() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadAbortRef = useRef<AbortController | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState({ fileName: '', percent: 0, eta: '' });

    const handleCancelUpload = () => {
        if (uploadAbortRef.current) {
            uploadAbortRef.current.abort();
            uploadAbortRef.current = null;
        }
    };

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

        if (file.size > 500 * 1024 * 1024) {
            alert('File too large! Max 500MB.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsUploading(true);
        setUploadProgress({ fileName: file.name, percent: 0, eta: 'Calculating...' });
        const abortController = new AbortController();
        uploadAbortRef.current = abortController;

        try {
            // Step 1: Start a resumable upload session
            const startRes = await fetch('/api/upload/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: file.name,
                    mimeType: file.type || 'application/octet-stream',
                    size: file.size,
                }),
                signal: abortController.signal,
            });

            const startData = await startRes.json();
            if (!startRes.ok) throw new Error(startData.error || 'Failed to start upload');

            const uploadUrl = startData.uploadUrl;

            // Step 2: Upload in chunks (3MB each)
            const CHUNK_SIZE = 3 * 1024 * 1024;
            const totalSize = file.size;
            let offset = 0;
            const uploadStartTime = Date.now();

            while (offset < totalSize) {
                const end = Math.min(offset + CHUNK_SIZE, totalSize);
                const chunk = file.slice(offset, end);

                const formData = new FormData();
                formData.append('chunk', chunk);
                formData.append('uploadUrl', uploadUrl);
                formData.append('start', String(offset));
                formData.append('end', String(end - 1));
                formData.append('total', String(totalSize));

                const chunkRes = await fetch('/api/upload/chunk', {
                    method: 'POST',
                    body: formData,
                    signal: abortController.signal,
                });

                const chunkData = await chunkRes.json();
                if (!chunkRes.ok) throw new Error(chunkData.error || 'Chunk upload failed');

                offset = end;

                // Calculate progress & ETA
                const percent = Math.round((offset / totalSize) * 100);
                const elapsed = (Date.now() - uploadStartTime) / 1000;
                const speed = offset / elapsed; // bytes per second
                const remaining = (totalSize - offset) / speed;
                const etaStr = remaining < 60
                    ? `${Math.ceil(remaining)}s left`
                    : `${Math.ceil(remaining / 60)}m left`;

                setUploadProgress({ fileName: file.name, percent, eta: percent >= 100 ? 'Finishing...' : etaStr });
            }

            alert('File uploaded successfully!');
            window.location.reload();

        } catch (error: any) {
            if (error.name === 'AbortError') {
                // User cancelled — do nothing
            } else if (error.message === 'Load failed' || error.message === 'Failed to fetch') {
                alert('Network Error: The upload was interrupted. Try again.');
            } else {
                alert(`Error: ${error.message}`);
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleNewFolder = async () => {
        const name = prompt('Enter folder name:');
        if (!name || !name.trim()) return;

        try {
            const res = await fetch('/api/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create folder');

            alert(`Folder "${data.name}" created!`);
            window.location.reload();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon size={18} />;
        if (type.includes('video')) return <Video size={18} />;
        if (type.includes('audio')) return <Music size={18} />;
        if (type.includes('pdf') || type.includes('document')) return <FileText size={18} />;
        return <FileIcon size={18} />;
    };

    // --- Compute real stats from files ---
    const TOTAL_STORAGE_BYTES = 15 * 1024 * 1024 * 1024; // 15GB

    const totalUsedBytes = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    const usedPercent = TOTAL_STORAGE_BYTES > 0 ? Math.min(Math.round((totalUsedBytes / TOTAL_STORAGE_BYTES) * 100), 100) : 0;

    const formatSize = (bytes: number): string => {
        if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return bytes + ' B';
    };

    // Categorize files by type
    const photosBytes = files.filter(f => f.type.includes('image')).reduce((a, f) => a + (f.sizeBytes || 0), 0);
    const videosBytes = files.filter(f => f.type.includes('video')).reduce((a, f) => a + (f.sizeBytes || 0), 0);
    const musicBytes = files.filter(f => f.type.includes('audio')).reduce((a, f) => a + (f.sizeBytes || 0), 0);
    const docsBytes = totalUsedBytes - photosBytes - videosBytes - musicBytes;

    const safePercent = (part: number) => totalUsedBytes > 0 ? Math.round((part / totalUsedBytes) * 100) : 0;
    const photosP = safePercent(photosBytes);
    const videosP = safePercent(videosBytes);
    const musicP = safePercent(musicBytes);
    const docsP = 100 - photosP - videosP - musicP;

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
                    <h1 className={styles.title}>My Drive Storage.</h1>
                    <p className={styles.subtitle}>
                        <span className={styles.highlight}>{usedPercent}%</span> storage used. Get more.
                    </p>
                </div>
                <div className={styles.actionButtons}>
                    <button className={styles.secondaryBtn} onClick={handleNewFolder}>
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
                        <span className={styles.statBadge}>GET MORE STORAGE</span>
                    </div>
                    <div className={styles.statValue}>15GB</div>
                    <div className={styles.statSmallText}>Get 2TB storage</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>USED STORAGE</span>
                        <span className={styles.statBadge} style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>{usedPercent}%</span>
                    </div>
                    <div className={styles.statValue}>{formatSize(totalUsedBytes)}</div>
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
                    <div className={styles.statValue}>{files.length}</div>
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
                        <div style={{ width: `${photosP}%`, background: '#6366f1' }}></div>
                        <div style={{ width: `${videosP}%`, background: '#a855f7' }}></div>
                        <div style={{ width: `${docsP}%`, background: '#f59e0b' }}></div>
                        <div style={{ width: `${musicP}%`, background: '#22c55e' }}></div>
                    </div>
                    <div className={styles.legend}>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{ background: '#6366f1' }}></span>
                            <span>PHOTOS ({photosP}%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{ background: '#a855f7' }}></span>
                            <span>VIDEOS ({videosP}%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{ background: '#f59e0b' }}></span>
                            <span>DOCUMENTS ({docsP}%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={styles.dot} style={{ background: '#22c55e' }}></span>
                            <span>MUSIC ({musicP}%)</span>
                        </div>
                    </div>
                    <div className={styles.categoryCards}>
                        <div className={styles.categoryCard}>
                            <ImageIcon size={24} color="#6366f1" />
                            <div>
                                <div className={styles.categoryName}>Photos</div>
                                <div className={styles.categorySize}>{formatSize(photosBytes)}</div>
                            </div>
                        </div>
                        <div className={styles.categoryCard}>
                            <Video size={24} color="#a855f7" />
                            <div>
                                <div className={styles.categoryName}>Videos</div>
                                <div className={styles.categorySize}>{formatSize(videosBytes)}</div>
                            </div>
                        </div>
                        <div className={styles.categoryCard}>
                            <FileText size={24} color="#f59e0b" />
                            <div>
                                <div className={styles.categoryName}>Documents</div>
                                <div className={styles.categorySize}>{formatSize(docsBytes)}</div>
                            </div>
                        </div>
                        <div className={styles.categoryCard}>
                            <Music size={24} color="#22c55e" />
                            <div>
                                <div className={styles.categoryName}>Music</div>
                                <div className={styles.categorySize}>{formatSize(musicBytes)}</div>
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

            {/* Upload Progress Popup */}
            {isUploading && (
                <div className={styles.uploadPopup}>
                    <div className={styles.uploadPopupHeader}>
                        <Upload size={16} />
                        <span>Uploading</span>
                        <button className={styles.uploadCancelBtn} onClick={handleCancelUpload}>Cancel</button>
                    </div>
                    <div className={styles.uploadFileName}>{uploadProgress.fileName}</div>
                    <div className={styles.uploadBarContainer}>
                        <div className={styles.uploadBar} style={{ width: `${uploadProgress.percent}%` }}></div>
                    </div>
                    <div className={styles.uploadMeta}>
                        <span>{uploadProgress.percent}%</span>
                        <span>{uploadProgress.eta}</span>
                    </div>
                </div>
            )}
        </main>
    );
}
