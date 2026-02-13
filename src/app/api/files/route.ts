import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

// Load these from .env or Vercel Environment Variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// Helper to get an authenticated Drive client
const getDriveClient = async () => {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        throw new Error('Missing Google Auth Credentials (Env Vars)');
    }

    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    return google.drive({ version: 'v3', auth: oAuth2Client });
};

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const drive = await getDriveClient();

        // Prepare buffer stream
        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const fileMetadata = {
            name: file.name,
            parents: FOLDER_ID ? [FOLDER_ID] : [], // Use env var folder or root
        };

        const media = {
            mimeType: file.type,
            body: stream,
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, iconLink, webContentLink',
        });

        return NextResponse.json({
            success: true,
            fileId: response.data.id,
            link: response.data.webViewLink
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({
            error: error.message || 'Upload failed',
            details: 'Check server logs for credential errors'
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        if (!CLIENT_ID) {
            // Return empty if not configured (prevents crash on clean deploy)
            return NextResponse.json({ files: [] });
        }

        const drive = await getDriveClient();

        const query = FOLDER_ID
            ? `'${FOLDER_ID}' in parents and trashed = false`
            : 'trashed = false'; // Fallback to listing everything if no folder set

        const response = await drive.files.list({
            q: query,
            fields: 'files(id, name, mimeType, modifiedTime, size, owners, webViewLink, iconLink)',
            orderBy: 'folder, modifiedTime desc',
            pageSize: 100,
        });

        const files = response.data.files || [];

        const formattedFiles = files.map((file: any) => ({
            id: file.id,
            name: file.name,
            type: file.mimeType,
            owner: file.owners?.[0]?.displayName || 'Me',
            modified: file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : '-',
            size: file.size ? (parseInt(file.size) / 1024 / 1024).toFixed(2) + ' MB' : '-',
            sizeBytes: file.size ? parseInt(file.size) : 0,
            link: file.webViewLink,
            icon: file.iconLink
        }));

        return NextResponse.json({ files: formattedFiles });

    } catch (error: any) {
        console.error('List error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
