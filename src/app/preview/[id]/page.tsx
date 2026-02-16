'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function PreviewContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const name = searchParams.get('name') || 'File';
    const type = searchParams.get('type') || '';
    const link = searchParams.get('link') || '#';

    const isVideo = type.includes('video');
    const isAudio = type.includes('audio');
    const isImage = type.includes('image');

    const streamUrl = `/api/files/${id}/stream`;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;

    return (
        <main style={{
            marginLeft: '240px',
            marginTop: '80px',
            minHeight: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            background: '#0a0a1a',
        }}>
            {/* Top Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 32px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link href="/" style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.7)',
                        transition: 'all 0.15s',
                        textDecoration: 'none',
                    }}>
                        <ArrowLeft size={18} />
                    </Link>
                    <span style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#fff',
                        maxWidth: '400px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>{name}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '13px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            textDecoration: 'none',
                        }}
                    >
                        <Download size={14} /> Download
                    </a>
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: 'rgba(99,102,241,0.15)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            color: '#818cf8',
                            fontSize: '13px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            textDecoration: 'none',
                        }}
                    >
                        <ExternalLink size={14} /> Open in Drive
                    </a>
                </div>
            </div>

            {/* Player Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
            }}>
                {isVideo && (
                    <video
                        controls
                        autoPlay
                        style={{
                            maxWidth: '100%',
                            maxHeight: 'calc(100vh - 200px)',
                            borderRadius: '12px',
                            background: '#000',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                        }}
                    >
                        <source src={streamUrl} type={type} />
                        Your browser does not support the video tag.
                    </video>
                )}

                {isAudio && (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        padding: '48px',
                        textAlign: 'center',
                        maxWidth: '500px',
                        width: '100%',
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            fontSize: '32px',
                        }}>
                            🎵
                        </div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#fff',
                            marginBottom: '24px',
                        }}>{name}</div>
                        <audio controls autoPlay style={{ width: '100%' }}>
                            <source src={streamUrl} type={type} />
                            Your browser does not support the audio tag.
                        </audio>
                    </div>
                )}

                {isImage && (
                    <img
                        src={streamUrl}
                        alt={name}
                        style={{
                            maxWidth: '100%',
                            maxHeight: 'calc(100vh - 200px)',
                            borderRadius: '12px',
                            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                            objectFit: 'contain',
                        }}
                    />
                )}

                {!isVideo && !isAudio && !isImage && (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        padding: '60px',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>{name}</div>
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
                            Preview not available for this file type
                        </div>
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '10px 24px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 600,
                                textDecoration: 'none',
                            }}
                        >
                            Open in Google Drive
                        </a>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function PreviewPage() {
    return (
        <Suspense fallback={
            <main style={{
                marginLeft: '240px',
                marginTop: '80px',
                minHeight: 'calc(100vh - 80px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.5)',
            }}>
                Loading preview...
            </main>
        }>
            <PreviewContent />
        </Suspense>
    );
}
