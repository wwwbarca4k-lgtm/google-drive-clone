'use client';

import styles from '../page.module.css';
import { Trash2 } from 'lucide-react';

export default function TrashPage() {
    return (
        <main className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Trash</h1>
                <p className={styles.pageSubtitle}>Items in trash will be permanently deleted after 30 days</p>
            </div>

            <div className={styles.fileTable}>
                <div className={styles.tableHeader}>
                    <div>Name</div>
                    <div>Original Location</div>
                    <div>Date Deleted</div>
                    <div>Size</div>
                </div>

                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <Trash2 size={36} />
                    </div>
                    <div className={styles.emptyTitle}>Trash is empty</div>
                    <div className={styles.emptySubtitle}>Deleted files will appear here for 30 days before being permanently removed</div>
                </div>
            </div>
        </main>
    );
}
