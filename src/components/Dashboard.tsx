'use client';

import styles from './Dashboard.module.css';
import { FolderPlus, Upload, FileText, Image as ImageIcon, Video, Music, File as FileIcon, ChevronDown, Folder, MoreVertical, Download, ExternalLink, Copy, Trash2 } from 'lucide-react';
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
    const folderInputRef = useRef<HTMLInputElement>(null);
    const uploadAbortRef = useRef<AbortController | null>(null);
    const uploadQueueRef = useRef<File[]>([]);
    const isProcessingRef = useRef(false);
    const completedRef = useRef(0);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadMenu, setShowUploadMenu] = useState(false);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState({ fileName: '', percent: 0, current: 0, total: 0 });
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [openFileMenu, setOpenFileMenu] = useState<string | null>(null);

    // Live countdown timer
    useEffect(() => {
        if (!isUploading || remainingSeconds <= 0) return;
        const interval = setInterval(() => setRemainingSeconds(s => Math.max(s - 1, 0)), 1000);
        return () => clearInterval(interval);
    }, [isUploading, remainingSeconds > 0]);

    const handleCancelUpload = () => {
        if (uploadAbortRef.current) {
            uploadAbortRef.current.abort();
            uploadAbortRef.current = null;
        }
        uploadQueueRef.current = [];
        completedRef.current = 0;
    };

    const fetchFiles = async () => {
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
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowUploadMenu(false);
            setOpenFileMenu(null);
        };
        if (showUploadMenu || openFileMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showUploadMenu, openFileMenu]);

    const handleUploadClick = () => {
        setShowUploadMenu(prev => !prev);
    };

    const handleUploadFiles = () => {
        setShowUploadMenu(false);
        fileInputRef.current?.click();
    };

    const handleUploadFolder = () => {
        setShowUploadMenu(false);
        folderInputRef.current?.click();
    };

    const uploadSingleFile = async (file: File, abortController: AbortController) => {
        setRemainingSeconds(0);

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

            const percent = Math.round((offset / totalSize) * 100);
            const elapsed = (Date.now() - uploadStartTime) / 1000;
            const speed = offset / elapsed;
            const remaining = Math.ceil((totalSize - offset) / speed);

            const currentNum = completedRef.current + 1;
            const totalNum = completedRef.current + uploadQueueRef.current.length;
            setUploadProgress({ fileName: file.name, percent, current: currentNum, total: totalNum });
            setRemainingSeconds(percent >= 100 ? 0 : remaining);
        }
    };

    const processQueue = async () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        const abortController = new AbortController();
        uploadAbortRef.current = abortController;
        setIsUploading(true);
        completedRef.current = 0;

        try {
            while (uploadQueueRef.current.length > 0) {
                const file = uploadQueueRef.current[0];
                const currentNum = completedRef.current + 1;
                const totalNum = completedRef.current + uploadQueueRef.current.length;
                setUploadProgress({ fileName: file.name, percent: 0, current: currentNum, total: totalNum });

                await uploadSingleFile(file, abortController);

                uploadQueueRef.current.shift();
                completedRef.current += 1;

                // Refresh file list in real-time after each file
                await fetchFiles();
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                // cancelled
            } else if (error.message === 'Load failed' || error.message === 'Failed to fetch') {
                alert('Network Error: The upload was interrupted. Try again.');
            } else {
                alert(`Error: ${error.message}`);
            }
        } finally {
            isProcessingRef.current = false;
            setIsUploading(false);
            completedRef.current = 0;
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        const fileList = Array.from(selectedFiles);
        const oversized = fileList.filter(f => f.size > 500 * 1024 * 1024);
        if (oversized.length > 0) {
            alert(`${oversized.length} file(s) exceed 500MB and will be skipped.`);
        }
        const validFiles = fileList.filter(f => f.size <= 500 * 1024 * 1024);
        if (validFiles.length === 0) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Add to queue
        uploadQueueRef.current.push(...validFiles);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Start processing if not already running
        processQueue();
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

    // Filter out folders for recent sections
    const recentFiles = files.filter(f => !f.type.includes('folder'));

    // File action handlers
    const handleOpenFile = (file: DriveFile) => {
        window.open(file.link, '_blank');
        setOpenFileMenu(null);
    };

    const handleDownloadFile = (file: DriveFile) => {
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;
        window.open(downloadUrl, '_blank');
        setOpenFileMenu(null);
    };

    const handleDuplicateFile = async (file: DriveFile) => {
        setOpenFileMenu(null);
        try {
            const res = await fetch(`/api/files/${file.id}`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to duplicate');
            await fetchFiles();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleTrashFile = async (file: DriveFile) => {
        setOpenFileMenu(null);
        if (!confirm(`Move "${file.name}" to trash?`)) return;
        try {
            const res = await fetch(`/api/files/${file.id}`, { method: 'PATCH' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to trash');
            await fetchFiles();
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
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
                multiple
            />
            <input
                type="file"
                ref={(el) => {
                    (folderInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                    if (el) el.setAttribute('webkitdirectory', '');
                }}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                multiple
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
                    <div className={styles.uploadWrapper}>
                        <button className={styles.primaryBtn} onClick={handleUploadClick}>
                            <Upload size={20} />
                            {isUploading ? 'Add More' : 'Upload'}
                            <ChevronDown size={16} />
                        </button>
                        {showUploadMenu && (
                            <div className={styles.uploadDropdown}>
                                <button className={styles.uploadDropdownItem} onClick={handleUploadFiles}>
                                    <FileIcon size={16} />
                                    Files
                                </button>
                                <button className={styles.uploadDropdownItem} onClick={handleUploadFolder}>
                                    <Folder size={16} />
                                    Folder
                                </button>
                            </div>
                        )}
                    </div>
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
                        {recentFiles.slice(0, 3).map((file) => (
                            <div key={file.id} className={styles.activityItem}>
                                <div className={styles.activityIcon}>
                                    {getFileIcon(file.type)}
                                </div>
                                <div className={styles.activityDetails}>
                                    <div className={styles.activityName}>{file.name}</div>
                                    <div className={styles.activityTime}>{file.modified}</div>
                                </div>
                                <div className={styles.fileMenuWrapper}>
                                    <button
                                        className={styles.fileMenuBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenFileMenu(openFileMenu === `activity-${file.id}` ? null : `activity-${file.id}`);
                                        }}
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {openFileMenu === `activity-${file.id}` && (
                                        <div className={styles.fileDropdown} onClick={(e) => e.stopPropagation()}>
                                            <button className={styles.fileDropdownItem} onClick={() => handleOpenFile(file)}>
                                                <ExternalLink size={14} /> Open
                                            </button>
                                            <button className={styles.fileDropdownItem} onClick={() => handleDownloadFile(file)}>
                                                <Download size={14} /> Download
                                            </button>
                                            <button className={styles.fileDropdownItem} onClick={() => handleDuplicateFile(file)}>
                                                <Copy size={14} /> Duplicate
                                            </button>
                                            <div className={styles.fileDropdownDivider} />
                                            <button className={`${styles.fileDropdownItem} ${styles.fileDropdownDanger}`} onClick={() => handleTrashFile(file)}>
                                                <Trash2 size={14} /> Move to Trash
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {recentFiles.length === 0 && !loading && (
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
                    {!loading && recentFiles.length === 0 && (
                        <div className={styles.emptyState}>No files found. Try uploading one!</div>
                    )}
                    {recentFiles.slice(0, 4).map((file) => (
                        <div key={file.id} className={styles.fileCard}>
                            <div className={styles.fileCardTop}>
                                <div className={styles.fileIcon}>
                                    {getFileIcon(file.type)}
                                </div>
                                <div className={styles.fileMenuWrapper}>
                                    <button
                                        className={styles.fileMenuBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenFileMenu(openFileMenu === file.id ? null : file.id);
                                        }}
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {openFileMenu === file.id && (
                                        <div className={styles.fileDropdown} onClick={(e) => e.stopPropagation()}>
                                            <button className={styles.fileDropdownItem} onClick={() => handleOpenFile(file)}>
                                                <ExternalLink size={14} /> Open
                                            </button>
                                            <button className={styles.fileDropdownItem} onClick={() => handleDownloadFile(file)}>
                                                <Download size={14} /> Download
                                            </button>
                                            <button className={styles.fileDropdownItem} onClick={() => handleDuplicateFile(file)}>
                                                <Copy size={14} /> Duplicate
                                            </button>
                                            <div className={styles.fileDropdownDivider} />
                                            <button className={`${styles.fileDropdownItem} ${styles.fileDropdownDanger}`} onClick={() => handleTrashFile(file)}>
                                                <Trash2 size={14} /> Move to Trash
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.fileInfo}>
                                <div className={styles.fileName}>{file.name}</div>
                                <div className={styles.fileSize}>{file.size}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upload Progress Popup */}
            {isUploading && (
                <div className={styles.uploadPopup}>
                    <div className={styles.uploadPopupHeader}>
                        <Upload size={16} />
                        <span>Uploading{uploadProgress.total > 1 ? ` (${uploadProgress.current}/${uploadProgress.total})` : ''}</span>
                        <button className={styles.uploadCancelBtn} onClick={handleCancelUpload}>Cancel</button>
                    </div>
                    <div className={styles.uploadFileName}>{uploadProgress.fileName}</div>
                    <div className={styles.uploadBarContainer}>
                        <div className={styles.uploadBar} style={{ width: `${uploadProgress.percent}%` }}></div>
                    </div>
                    <div className={styles.uploadMeta}>
                        <span>{uploadProgress.percent}%</span>
                        <span>{remainingSeconds <= 0 ? 'Finishing...' : remainingSeconds >= 60 ? `${Math.floor(remainingSeconds / 60)}m ${remainingSeconds % 60}s left` : `${remainingSeconds}s left`}</span>
                    </div>
                </div>
            )}
        </main>
    );
}
