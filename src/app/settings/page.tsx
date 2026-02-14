'use client';

import styles from '../page.module.css';
import { Settings, User, HardDrive, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
    return (
        <main className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Settings</h1>
                <p className={styles.pageSubtitle}>Manage your account and preferences</p>
            </div>

            <div className={styles.fileTable}>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className={styles.fileRow} style={{ cursor: 'pointer' }}>
                        <div className={styles.fileName}>
                            <div className={`${styles.fileIcon} ${styles.fileIconBlue}`}>
                                <User size={18} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#fff' }}>Account</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Manage your profile and account settings</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.fileRow} style={{ cursor: 'pointer' }}>
                        <div className={styles.fileName}>
                            <div className={`${styles.fileIcon} ${styles.fileIconPurple}`}>
                                <HardDrive size={18} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#fff' }}>Storage</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>View storage usage and upgrade plan</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.fileRow} style={{ cursor: 'pointer' }}>
                        <div className={styles.fileName}>
                            <div className={`${styles.fileIcon} ${styles.fileIconGreen}`}>
                                <Bell size={18} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#fff' }}>Notifications</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Configure notification preferences</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.fileRow} style={{ cursor: 'pointer' }}>
                        <div className={styles.fileName}>
                            <div className={`${styles.fileIcon} ${styles.fileIconYellow}`}>
                                <Shield size={18} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#fff' }}>Privacy & Security</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Manage security settings and permissions</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.fileRow} style={{ cursor: 'pointer' }}>
                        <div className={styles.fileName}>
                            <div className={`${styles.fileIcon} ${styles.fileIconBlue}`}>
                                <Palette size={18} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#fff' }}>Appearance</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Customize theme and display</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
