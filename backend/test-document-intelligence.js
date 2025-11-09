require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testDocumentIntelligence() {
  console.log('\n=== Testing Azure Document Intelligence Configuration ===\n');

  // Check environment variables
  const visionKey = process.env.AZURE_VISION_KEY;
  const visionEndpoint = process.env.AZURE_VISION_ENDPOINT;
  const docIntelKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
  const docIntelEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;

  console.log('Environment Variables:');
  console.log('  AZURE_VISION_KEY:', visionKey ? `${visionKey.substring(0, 8)}...` : 'NOT SET');
  console.log('  AZURE_VISION_ENDPOINT:', visionEndpoint || 'NOT SET');
  console.log('  AZURE_DOCUMENT_INTELLIGENCE_KEY:', docIntelKey ? `${docIntelKey.substring(0, 8)}...` : 'NOT SET (will use Vision key)');
  console.log('  AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT:', docIntelEndpoint || 'NOT SET (will use Vision endpoint)');
  console.log();

  // Determine which credentials to use
  const azureKey = docIntelKey || visionKey;
  const azureEndpoint = docIntelEndpoint || visionEndpoint;

  console.log('Will use for Document Intelligence:');
  console.log('  Key:', azureKey ? `${azureKey.substring(0, 8)}...` : 'MISSING');
  console.log('  Endpoint:', azureEndpoint || 'MISSING');
  console.log();

  if (!azureKey || !azureEndpoint) {
    console.error('❌ ERROR: Missing Azure credentials in .env file');
    process.exit(1);
  }

  // Test 1: Check if endpoint is reachable
  console.log('Test 1: Checking endpoint accessibility...');
  const testUrl = `${azureEndpoint}/formrecognizer/documentModels/prebuilt-layout:analyze?api-version=2023-07-31`;
  console.log('  URL:', testUrl);
  console.log();

  // Create a simple test image (1x1 black PNG)
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  try {
    console.log('Test 2: Attempting to submit test image...');
    const submitResponse = await axios.post(testUrl, testImageBuffer, {
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': 'application/octet-stream'
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      validateStatus: function (status) {
        return status < 500; // Don't throw on 4xx errors, we want to see them
      }
    });

    console.log('  Response Status:', submitResponse.status);
    console.log('  Response Status Text:', submitResponse.statusText);
    console.log();

    if (submitResponse.status === 401) {
      console.error('❌ 401 UNAUTHORIZED ERROR\n');
      console.error('Possible causes:');
      console.error('  1. Invalid API key - verify the key is correct in your .env');
      console.error('  2. API key is for Computer Vision only, not Document Intelligence');
      console.error('  3. Endpoint URL is for a different resource than the API key');
      console.error('  4. API key has expired or been regenerated in Azure Portal');
      console.error();
      console.error('Response details:');
      console.error(JSON.stringify(submitResponse.data, null, 2));
      console.error();
      console.error('To fix this:');
      console.error('  1. Go to Azure Portal: https://portal.azure.com');
      console.error('  2. Find your Document Intelligence or Azure AI Services resource');
      console.error('  3. Go to "Keys and Endpoint" section');
      console.error('  4. Copy KEY 1 and ENDPOINT exactly as shown');
      console.error('  5. Update your .env file with these values');
      process.exit(1);
    } else if (submitResponse.status === 404) {
      console.error('❌ 404 NOT FOUND ERROR\n');
      console.error('The endpoint does not support Document Intelligence.');
      console.error();
      console.error('This means you likely have a Computer Vision resource, not an Azure AI Services resource.');
      console.error();
      console.error('To fix this:');
      console.error('  Option A: Create Azure AI Services multi-service resource');
      console.error('    1. Go to https://portal.azure.com');
      console.error('    2. Search for "Azure AI Services" (not Computer Vision)');
      console.error('    3. Create the resource');
      console.error('    4. Use its key and endpoint for both AZURE_VISION_* variables');
      console.error();
      console.error('  Option B: Create separate Document Intelligence resource');
      console.error('    1. Go to https://portal.azure.com');
      console.error('    2. Search for "Document Intelligence"');
      console.error('    3. Create the resource');
      console.error('    4. Use its key and endpoint for AZURE_DOCUMENT_INTELLIGENCE_* variables');
      process.exit(1);
    } else if (submitResponse.status === 202) {
      console.log('✅ SUCCESS! Document Intelligence is working correctly.');
      console.log();
      console.log('Operation Location:', submitResponse.headers['operation-location']);
      console.log();
      console.log('Your Document Intelligence is properly configured!');
      process.exit(0);
    } else {
      console.log('⚠️  Unexpected response:', submitResponse.status);
      console.log('Response data:', JSON.stringify(submitResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ ERROR making request:');
    console.error();
    console.error('Message:', error.message);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Check if the endpoint URL is correct');
    } else {
      console.error('Error details:', error);
    }
    process.exit(1);
  }
}

testDocumentIntelligence();
