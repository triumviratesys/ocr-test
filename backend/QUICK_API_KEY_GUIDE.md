# Get Your Google Cloud Vision API Key - Quick Guide

## What You're Looking For
✅ **API Key** format: `AIzaSy...` (long alphanumeric string, ~39 characters)
❌ **NOT OAuth Client ID**: `xxx.apps.googleusercontent.com`

## Step-by-Step Instructions

### 1. Go to API Credentials Page
**Direct Link**: https://console.cloud.google.com/apis/credentials

### 2. Check Your Current Page
You should see tabs at the top:
- ✅ **Credentials** (you want this one)
- OAuth consent screen
- Domain verification

### 3. Look for "API Keys" Section
On the Credentials page, you'll see different sections:
- **OAuth 2.0 Client IDs** ← This is what you found (not what we need)
- **API Keys** ← This is what you need!
- Service Accounts

### 4. Create an API Key

**If you see existing API Keys:**
- Click on one to view/copy it
- Look for the "Key" field with format: `AIzaSy...`

**If you DON'T see any API Keys:**
1. Click the **"+ CREATE CREDENTIALS"** button at the top
2. Select **"API key"** from the dropdown
3. A popup will show your new API key starting with `AIzaSy...`
4. Copy this key!

### 5. (Important) Enable Cloud Vision API
If you haven't already:
1. Go to: https://console.cloud.google.com/apis/library/vision.googleapis.com
2. Click **"Enable"**
3. Wait for it to enable (takes a few seconds)

### 6. Add to Your Project
Open `/home/triumviratesys/ocr-test/backend/.env` and update:
```
GOOGLE_VISION_API_KEY=AIzaSy...your_actual_key_here
```

### 7. Restart the Server
```bash
cd /home/triumviratesys/ocr-test/backend
npm start
```

## Visual Guide - What You're Looking For

### ❌ WRONG (OAuth Client ID):
```
950676763645-kbu8pv5trtvpse9nnik40h7ded54659f.apps.googleusercontent.com
```
This is for OAuth authentication, not API calls.

### ✅ CORRECT (API Key):
```
AIzaSyBkEHg8F3hJ9kLmN0pQrStUvWxYz123456
```
This is what you need! Starts with "AIzaSy"

## Troubleshooting

### "I don't see API Keys section"
- Make sure you're in the correct project (check dropdown at top)
- You might need to create your first API key using "+ CREATE CREDENTIALS"

### "I see multiple API keys"
- Use any of them, or create a new one
- All will work as long as Cloud Vision API is enabled

### "API key not working"
1. Verify Cloud Vision API is enabled: https://console.cloud.google.com/apis/library/vision.googleapis.com
2. Check if you have any API restrictions set (should say "None" or include "Cloud Vision API")
3. Make sure you copied the entire key (no spaces before/after)
4. Restart your server after updating .env

## Security Note
- This API key will be visible in your .env file
- Don't commit .env to git (already in .gitignore)
- For production, add application restrictions in the console

## Need More Help?
See full guide: GOOGLE_VISION_SETUP.md
