# Google Cloud Vision API Setup Guide

## Why Google Cloud Vision?
- **State-of-the-Art OCR**: Industry-leading accuracy
- **Large file support**: Up to 20MB images (vs 1MB for free alternatives)
- **Generous free tier**: 1000 requests/month free forever
- **Production-ready**: Used by enterprises worldwide

## Quick Setup (5 minutes)

### Step 1: Create Google Cloud Account
1. Go to https://console.cloud.google.com
2. Sign in with your Google account
3. Accept terms if this is your first time

### Step 2: Create a New Project
1. Click the project dropdown at the top
2. Click "New Project"
3. Name it "OCR Project" (or anything you like)
4. Click "Create"

### Step 3: Enable Vision API
1. Go to https://console.cloud.google.com/apis/library
2. Search for "Cloud Vision API"
3. Click on "Cloud Vision API"
4. Click "Enable"

### Step 4: Create API Key
1. Go to https://console.cloud.google.com/apis/credentials
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "API key"
4. Copy the API key that appears
5. (Optional but recommended) Click "Restrict Key":
   - Under "API restrictions", select "Restrict key"
   - Check only "Cloud Vision API"
   - Click "Save"

### Step 5: Add to Your Project
1. Open `/backend/.env` file
2. Replace the placeholder with your API key:
   ```
   GOOGLE_VISION_API_KEY=your_actual_api_key_here
   ```
3. Save the file
4. Restart the server: `npm start`

## Free Tier Limits
- **1000 requests per month** - Free forever
- **After 1000**: $1.50 per 1000 requests
- **File size**: Up to 20MB per image
- **No credit card required** for free tier

## Testing Your Setup
After adding your API key:
1. Restart the server
2. Upload an image through the web interface
3. Check the server logs for successful OCR processing

## Troubleshooting

### "API key not configured" error
- Make sure you added the key to `.env` file
- Restart the server after updating `.env`
- Check there are no extra spaces around the key

### "API key not valid" error
- Verify you enabled Cloud Vision API
- Check if API restrictions are too strict
- Try creating a new API key

### "Quota exceeded" error
- You've used your 1000 free requests this month
- Wait until next month or upgrade to paid tier
- Check usage at: https://console.cloud.google.com/apis/dashboard

## Alternative: Use Without API Key (Demo Mode)
If you don't want to set up Google Cloud, you can:
1. Use the demo API key (limited to ~100 requests/day)
2. The system will fall back to basic OCR
3. Not recommended for production use

## Security Best Practices
1. **Never commit `.env` to git** - Already in `.gitignore`
2. **Restrict your API key** to only Cloud Vision API
3. **Add application restrictions** if deploying to production
4. **Monitor usage** at the Google Cloud Console

## Cost Estimation
For reference:
- **First 1000/month**: FREE
- **1001-5,000,000**: $1.50 per 1000
- **Example**: 5000 requests/month = FREE for first 1000 + $6 for remaining 4000 = **$6/month**

## Support
- Google Cloud Vision Docs: https://cloud.google.com/vision/docs
- API Reference: https://cloud.google.com/vision/docs/reference/rest
- Pricing: https://cloud.google.com/vision/pricing
