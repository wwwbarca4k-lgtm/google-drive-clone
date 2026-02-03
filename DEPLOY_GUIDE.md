# Deployment Guide: Vercel + Hostinger

Your project is built with **Next.js**, so the best (and usually free) way to host it is **Vercel** (the creators of Next.js). You can then point your Hostinger domain to Vercel.

## Step 1: Push Code to GitHub
1. Create a new repository on [GitHub.com](https://github.com/new) (name it "google-drive-clone").
2. In your project terminal, run these commands:
   ```bash
   git add .
   git commit -m "Ready for deploy"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/google-drive-clone.git
   git push -u origin main
   ```

## Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com/signup) and sign up with GitHub.
2. Click **"New Project"**.
3. Import your `google-drive-clone` repository.
4. **Environment Variables**: Use the credentials we set up earlier:
   *   `GOOGLE_CLIENT_ID`
   *   `GOOGLE_CLIENT_SECRET`
   *   `GOOGLE_REFRESH_TOKEN`
   *   `GOOGLE_DRIVE_FOLDER_ID`
5. Click **Deploy**.

## Step 3: Connect Hostinger Domain
1. In your **Vercel Project Dashboard**, go to **Settings > Domains**.
2. Enter your Hostinger domain (e.g., `mycollegeproject.com`) and click **Add**.
3. Vercel will show you some **DNS Records** (A Record and CNAME).
4. Go to **Hostinger Dashboard > DNS Zone Editor**.
5. Add the records Vercel showed you:
   *   **Type**: `A` | **Name**: `@` | **Value**: `76.76.21.21` (Example)
   *   **Type**: `CNAME` | **Name**: `www` | **Value**: `cname.vercel-dns.com`
6. Wait 5-30 mins for it to propagate.

## Important Note on OAuth
Since your website domain changed (from `localhost` to `yourdomain.com`), you must update **Google Cloud Console**:
1. Go to **APIs & Services > Credentials**.
2. Edit your OAuth Client.
3. Add your new domain to **Authorized JavaScript origins**: `https://yourdomain.com`
4. Add your new callback to **Authorized redirect URIs**: `https://yourdomain.com/oauth2callback`
