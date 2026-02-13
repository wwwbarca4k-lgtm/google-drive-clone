'use client';

import styles from '../page.module.css';
import { Star } from 'lucide-react';

export default function FavouritesPage() {
    return (
        <main className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Favourites</h1>
                <p className={styles.pageSubtitle}>Your starred and bookmarked files</p>
            </div>

            <div className={styles.fileTable}>
                <div className={styles.tableHeader}>
                    <div>Name</div>
                    <div>Owner</div>
                    <div>Last Modified</div>
                    <div>Size</div>
                </div>

                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                        <Star size={36} />
                    </div>
                    <div className={styles.emptyTitle}>No favourites yet</div>
                    <div className={styles.emptySubtitle}>Star your important files for quick access</div>
                </div>
            </div>
        </main>
    );
}
