import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

const getDriveClient = async () => {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        throw new Error('Missing Google Auth Credentials (Env Vars)');
    }
    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    return google.drive({ version: 'v3', auth: oAuth2Client });
};

// PATCH — move to trash
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const drive = await getDriveClient();

        await drive.files.update({
            fileId: id,
            requestBody: { trashed: true },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Trash error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST — duplicate file
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const drive = await getDriveClient();

        const original = await drive.files.get({
            fileId: id,
            fields: 'name, parents',
        });

        const response = await drive.files.copy({
            fileId: id,
            requestBody: {
                name: `Copy of ${original.data.name}`,
                parents: original.data.parents || [],
            },
            fields: 'id, name, webViewLink',
        });

        return NextResponse.json({
            success: true,
            fileId: response.data.id,
            name: response.data.name,
            link: response.data.webViewLink,
        });
    } catch (error: any) {
        console.error('Duplicate error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
