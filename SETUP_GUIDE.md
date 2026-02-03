# Google Drive Integration Setup Guide

To connect your college project to your storage, we'll use a **Service Account**. This is like a "robot user" that we can give permission to access a specific folder in your Drive.

## Step 1: Create a Google Cloud Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com/).
2. Create a **New Project** (name it "Storage Clone").
3. Once created, select the project.

## Step 2: Enable Drive API
1. In the search bar at the top, type **"Google Drive API"**.
2. Click on it and press **Enable**.

## Step 3: Create Credentials (The Robot)
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials** > **Service Account**.
3. Name it "uploader-bot".
4. Click **Create and Continue**, then **Done** (skip role assignment for now).
5. Click on the newly created Service Account (email looks like `uploader-bot@...`).
6. Go to the **Keys** tab.
7. Click **Add Key > Create new key > JSON**.
8. A file will download. **Renaming it to `service-account.json`.**
9. **Move this file** into your project folder: `/src/app/api/files/service-account.json` (Note: In a real app, we'd use environment variables, but for this project, this is the easiest way).

## Step 4: Share Your Folder
1. Go to your real Google Drive (drive.google.com).
2. Create a new folder (e.g., "Web Storage Uploads").
3. Right-click the folder > **Share**.
4. **Paste the Service Account Email** you found in Step 3 (looks like `uploader-bot@project-123.iam.gserviceaccount.com`).
5. Send!

## Step 5: Get Folder ID
1. Open that folder in Google Drive.
2. Look at the URL bar. It looks like `drive.google.com/drive/u/0/folders/YOUR_FOLDER_ID_HERE`.
3. Copy that ID. We will use it in the code.
