'use client';

import styles from '../page.module.css';
import { Clock, FileText, Image as ImageIcon, Video, Music, File as FileIcon, MoreVertical, ExternalLink, Download, Copy, Trash2, Folder } from 'lucide-react';
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

export default function RecentPage() {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [openFileMenu, setOpenFileMenu] = useState<string | null>(null);

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

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenFileMenu(null);
        if (openFileMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [openFileMenu]);

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

    return (
        <main className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Recent</h1>
                <p className={styles.pageSubtitle}>Your recently accessed and modified files</p>
            </div>

            <div className={styles.fileTable}>
                <div className={styles.tableHeader}>
                    <div>Name</div>
                    <div>Owner</div>
                    <div>Last Modified</div>
                    <div>Size</div>
                    <div></div>
                </div>

                {loading && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                        Loading files...
                    </div>
                )}

                {!loading && files.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <Clock size={36} />
                        </div>
                        <div className={styles.emptyTitle}>No recent files</div>
                        <div className={styles.emptySubtitle}>Files you open or modify will appear here</div>
                    </div>
                )}

                {files.map((file) => (
                    <div key={file.id} className={styles.fileRow}>
                        <div className={styles.fileName}>
                            <div className={`${styles.fileIcon} ${getIconStyle(file.type)}`}>
                                {getFileIcon(file.type)}
                            </div>
                            <span className={styles.nameText}>{file.name}</span>
                        </div>
                        <div className={styles.secondaryText}>{file.owner}</div>
                        <div className={styles.secondaryText}>{file.modified}</div>
                        <div className={styles.secondaryText}>{file.size}</div>
                        <div className={styles.rowMenuWrapper}>
                            <button
                                className={styles.rowMenuBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenFileMenu(openFileMenu === file.id ? null : file.id);
                                }}
                            >
                                <MoreVertical size={16} />
                            </button>
                            {openFileMenu === file.id && (
                                <div className={styles.rowDropdown} onClick={(e) => e.stopPropagation()}>
                                    <button className={styles.rowDropdownItem} onClick={() => handleOpenFile(file)}>
                                        <ExternalLink size={14} /> Open
                                    </button>
                                    <button className={styles.rowDropdownItem} onClick={() => handleDownloadFile(file)}>
                                        <Download size={14} /> Download
                                    </button>
                                    <button className={styles.rowDropdownItem} onClick={() => handleDuplicateFile(file)}>
                                        <Copy size={14} /> Duplicate
                                    </button>
                                    <div className={styles.rowDropdownDivider} />
                                    <button className={`${styles.rowDropdownItem} ${styles.rowDropdownDanger}`} onClick={() => handleTrashFile(file)}>
                                        <Trash2 size={14} /> Move to Trash
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
