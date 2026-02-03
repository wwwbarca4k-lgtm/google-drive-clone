# Switch to OAuth 2.0 (To Fix "0 Storage" Error)

The "Service Account" method is failing because standard robot accounts have 0 GB of storage. Use this method instead to upload **as your personal account** (using your 2TB quota).

## Step 1: Create OAuth Credentials
1. Go back to [console.cloud.google.com](https://console.cloud.google.com/).
2. Go to **APIs & Services > Credentials**.
3. Click **Create Credentials** > **OAuth Client ID**.
4. **Application Type**: Web application.
5. **Name**: "Storage App".
6. **Authorized Redirect URIs**: Add `http://localhost:3000/oauth2callback`.
7. Click **Create**.
8. **Copy** the `Client ID` and `Client Secret`.

## Step 2: Get a Refresh Token (The "Permanent Pass")
We need a special manual script to convert your ID/Secret into a "Refresh Token" that allows the app to stay logged in as YOU forever.

1. Open the file `src/scripts/get_token.js` in your editor.
2. Replace `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with the codes you just copied.
3. Save the file.
4. Run this command in your terminal:
   ```bash
   node src/scripts/get_token.js
   ```
5. **Click the link** it shows.
6. Login with your **personal Google account** (the one with 2TB).
7. Allow access.
8. The terminal will print a `REFRESH_TOKEN`. **Copy it**.

## Step 3: Update Code
I (the AI) will update the code for you once you give me:
1. Your **Client ID**
2. Your **Client Secret**
3. Your **Refresh Token**
