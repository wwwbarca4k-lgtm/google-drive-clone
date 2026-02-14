import { NextResponse } from 'next/server';

// Step 2: Proxy a chunk to Google Drive's resumable upload URL
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const chunk = formData.get('chunk') as File;
        const uploadUrl = formData.get('uploadUrl') as string;
        const start = parseInt(formData.get('start') as string);
        const end = parseInt(formData.get('end') as string);
        const total = parseInt(formData.get('total') as string);

        if (!chunk || !uploadUrl) {
            return NextResponse.json({ error: 'Missing chunk or uploadUrl' }, { status: 400 });
        }

        const buffer = Buffer.from(await chunk.arrayBuffer());

        const res = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Length': String(buffer.length),
                'Content-Range': `bytes ${start}-${end}/${total}`,
            },
            body: buffer,
        });

        // 308 = more chunks needed, 200/201 = upload complete
        if (res.status === 308) {
            return NextResponse.json({ status: 'continue' });
        }

        if (res.ok) {
            const data = await res.json();
            return NextResponse.json({
                status: 'complete',
                fileId: data.id,
                name: data.name,
            });
        }

        const errText = await res.text();
        console.error('Chunk upload failed:', res.status, errText);
        return NextResponse.json({ error: 'Chunk upload failed', details: errText }, { status: 500 });

    } catch (error: any) {
        console.error('Chunk proxy error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
