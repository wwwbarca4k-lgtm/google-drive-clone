import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

// Step 1: Create a resumable upload session on Google Drive
export async function POST(request: Request) {
    try {
        const { name, mimeType, size } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'File name required' }, { status: 400 });
        }

        if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
            return NextResponse.json({ error: 'Server credentials not configured' }, { status: 500 });
        }

        const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
        oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

        // Get a fresh access token
        const { credentials } = await oAuth2Client.refreshAccessToken();
        const accessToken = credentials.access_token;

        // Create a resumable upload session directly via Google's REST API
        const metadata = {
            name,
            parents: FOLDER_ID ? [FOLDER_ID] : [],
        };

        const initRes = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json; charset=UTF-8',
                    'X-Upload-Content-Type': mimeType || 'application/octet-stream',
                    'X-Upload-Content-Length': String(size),
                },
                body: JSON.stringify(metadata),
            }
        );

        if (!initRes.ok) {
            const err = await initRes.text();
            console.error('Resumable init failed:', err);
            return NextResponse.json({ error: 'Failed to start upload session' }, { status: 500 });
        }

        const uploadUrl = initRes.headers.get('Location');
        if (!uploadUrl) {
            return NextResponse.json({ error: 'No upload URL returned' }, { status: 500 });
        }

        return NextResponse.json({ uploadUrl });

    } catch (error: any) {
        console.error('Upload start error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
