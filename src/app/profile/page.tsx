'use client';

import styles from '../page.module.css';
import { User, Mail, MapPin, Calendar } from 'lucide-react';

export default function ProfilePage() {
    return (
        <main className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Profile</h1>
                <p className={styles.pageSubtitle}>Your account information</p>
            </div>

            <div className={styles.fileTable}>
                <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                    {/* Avatar */}
                    <div style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <User size={40} color="#fff" />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>User</div>
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Premium Member</div>
                    </div>

                    {/* Info rows */}
                    <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Mail size={18} color="#6366f1" />
                            <div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Email</div>
                                <div style={{ fontSize: '14px', color: '#fff' }}>user@sporzo.in</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <MapPin size={18} color="#a855f7" />
                            <div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Location</div>
                                <div style={{ fontSize: '14px', color: '#fff' }}>India</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <Calendar size={18} color="#22c55e" />
                            <div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Joined</div>
                                <div style={{ fontSize: '14px', color: '#fff' }}>February 2026</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
