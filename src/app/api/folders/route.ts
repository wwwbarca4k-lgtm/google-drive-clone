import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

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
        const body = await request.json();
        const folderName = body.name?.trim();

        if (!folderName) {
            return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
        }

        const drive = await getDriveClient();

        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: FOLDER_ID ? [FOLDER_ID] : [],
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name, webViewLink',
        });

        return NextResponse.json({
            success: true,
            folderId: response.data.id,
            name: response.data.name,
            link: response.data.webViewLink,
        });

    } catch (error: any) {
        console.error('Create folder error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to create folder',
        }, { status: 500 });
    }
}
