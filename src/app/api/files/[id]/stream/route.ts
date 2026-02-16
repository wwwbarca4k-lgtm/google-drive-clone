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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const drive = await getDriveClient();

        // Get file metadata first
        const meta = await drive.files.get({
            fileId: id,
            fields: 'name, mimeType, size',
        });

        const mimeType = meta.data.mimeType || 'application/octet-stream';
        const fileSize = parseInt(meta.data.size || '0');

        // Handle range requests for video seeking
        const rangeHeader = request.headers.get('range');
        let start = 0;
        let end = fileSize - 1;

        if (rangeHeader) {
            const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
            if (match) {
                start = parseInt(match[1]);
                end = match[2] ? parseInt(match[2]) : fileSize - 1;
            }
        }

        const chunkSize = end - start + 1;

        // Download the file content with range
        const response = await drive.files.get(
            { fileId: id, alt: 'media' },
            {
                responseType: 'stream',
                headers: rangeHeader ? { Range: `bytes=${start}-${end}` } : {},
            }
        );

        const stream = response.data as unknown as ReadableStream;

        const headers: Record<string, string> = {
            'Content-Type': mimeType,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600',
        };

        if (rangeHeader) {
            headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
            headers['Content-Length'] = String(chunkSize);

            return new Response(stream as any, {
                status: 206,
                headers,
            });
        }

        headers['Content-Length'] = String(fileSize);
        return new Response(stream as any, {
            status: 200,
            headers,
        });
    } catch (error: any) {
        console.error('Stream error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
