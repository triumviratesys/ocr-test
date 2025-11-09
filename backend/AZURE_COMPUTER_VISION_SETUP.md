# Azure Computer Vision Read API Setup

## What You Need
You have Azure OpenAI keys, but OCR requires **Azure Computer Vision** (different service).

## Quick Setup (5 minutes)

### Step 1: Go to Azure Portal
**Link**: https://portal.azure.com

### Step 2: Create Computer Vision Resource
1. Click **"+ Create a resource"**
2. Search for **"Computer Vision"** or **"Azure AI Vision"**
3. Click **"Create"**

### Step 3: Configure the Resource
- **Subscription**: Use your existing subscription
- **Resource Group**: Create new or use existing
- **Region**: Choose closest to you (e.g., East US, West Europe)
- **Name**: Something like `ocr-computer-vision`
- **Pricing Tier**: Select **Free F0** (5000 requests/month free)

### Step 4: Get Your Keys
After creation (takes 1-2 minutes):
1. Go to your Computer Vision resource
2. Click **"Keys and Endpoint"** in the left menu
3. Copy:
   - **Key 1** (looks like: `abc123def456...`)
   - **Endpoint** (looks like: `https://YOUR-RESOURCE.cognitiveservices.azure.com/`)

### Step 5: Add to .env File
```env
AZURE_VISION_KEY=your_key_here
AZURE_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
```

## Free Tier Details
- **5000 transactions per month** - FREE
- **After 5000**: $1 per 1000 transactions
- **Max file size**: 50MB
- **Optimized for handwriting**

## Document Intelligence Setup (for Layout Analysis)

This application uses **Azure Document Intelligence** (formerly Form Recognizer) to extract layout information, tables, and document structure. You have two options:

### Option 1: Multi-Service Resource (Recommended - Simplest)
Use an **Azure AI Services** multi-service resource that includes both Computer Vision AND Document Intelligence:
1. In Azure Portal, search for **"Azure AI Services"** (not "Computer Vision")
2. Create the resource with Free F0 or Standard S0 tier
3. Use the SAME key and endpoint for both services in your `.env`:
   ```env
   AZURE_VISION_KEY=your_ai_services_key
   AZURE_VISION_ENDPOINT=https://your-ai-services-resource.cognitiveservices.azure.com/
   ```
4. Leave Document Intelligence variables blank - the app will automatically use Vision credentials

### Option 2: Separate Document Intelligence Resource
Create a dedicated Document Intelligence resource:
1. Search for **"Document Intelligence"** in Azure Portal
2. Create resource (Free tier: 500 pages/month)
3. Get Key and Endpoint from "Keys and Endpoint"
4. Add to `.env`:
   ```env
   AZURE_DOCUMENT_INTELLIGENCE_KEY=your_doc_intel_key
   AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-doc-intel-resource.cognitiveservices.azure.com/
   ```

### How to Check Which You Have
- **Multi-service**: Resource type shows "Azure AI Services" or "Cognitive Services" - use Option 1
- **Computer Vision only**: Resource type shows "Computer Vision" - need Option 2 for Document Intelligence
- **Separate resources**: You already have both - use both sets of credentials

## Can't Find Computer Vision?
Your Azure subscription might not have it enabled. Try:
1. **Azure AI Services** (all-in-one resource that includes Vision)
2. Or create a new free Azure account

## Need Help?
Let me know if you:
- Can't find Computer Vision in Azure
- Need help with a different Azure service
- Want to use a different OCR provider
