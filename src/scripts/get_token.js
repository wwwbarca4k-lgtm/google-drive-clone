const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const open = require('open'); // We might need to ask user to install this or just print URL

// 1. Enter your credentials here
const CLIENT_ID = '1011444708432-ctga63tq9grku3g7q3kl2unbf2nnuifn.apps.googleusercontent.com';

const CLIENT_SECRET = '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';

const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getAccessToken() {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Force refresh token
    });

    console.log('\nPlease open this URL in your browser:\n');
    console.log(authUrl);
    console.log('\n');

    // Simple server to catch the callback
    const server = http.createServer(async (req, res) => {
        if (req.url.startsWith('/oauth2callback')) {
            const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
            const code = qs.get('code');

            res.end('Authentication successful! You can close this tab and check your terminal.');
            server.close();

            const { tokens } = await oauth2Client.getToken(code);
            console.log('\n>>> SUCCESS! SAVE THESE CREDENTIALS <<<\n');
            console.log('REFRESH_TOKEN:', tokens.refresh_token);
            console.log('\n(Copy this Refresh Token into your .env file or route.ts)\n');
        }
    });

    server.listen(3000, () => {
        console.log('Listening on http://localhost:3000/oauth2callback');
    });
}

// Check if user updated content
if (CLIENT_ID === 'YOUR_CLIENT_ID') {
    console.log('ERROR: You must open "src/scripts/get_token.js" and paste your Client ID and Secret first.');
} else {
    getAccessToken();
}
