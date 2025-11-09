// API Configuration
const API_URL = 'http://localhost:5000/api';

// DOM Elements
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const selectedFileText = document.getElementById('selected-file');
const errorMessage = document.getElementById('error-message');
const uploadResult = document.getElementById('upload-result');
const loading = document.getElementById('loading');
const documentsList = document.getElementById('documents-list');
const docCount = document.getElementById('doc-count');

// State
let selectedFile = null;

// Event Listeners
fileInput.addEventListener('change', handleFileSelect);
uploadBtn.addEventListener('click', handleUpload);

// Initialize
loadDocuments();

// File selection handler
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        selectedFile = file;
        selectedFileText.textContent = `Selected: ${file.name}`;
        hideError();
        hideUploadResult();
    } else {
        selectedFile = null;
        selectedFileText.textContent = '';
    }
}

// Upload handler
async function handleUpload() {
    if (!selectedFile) {
        showError('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    // Disable upload button and show loading
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Processing...';
    showLoading();
    hideError();
    hideUploadResult();

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();

        // Show upload result
        showUploadResult(data.document);

        // Reset file input
        fileInput.value = '';
        selectedFile = null;
        selectedFileText.textContent = '';

        // Reload documents list
        await loadDocuments();

    } catch (error) {
        console.error('Upload error:', error);
        showError(error.message || 'Failed to upload file');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload & Process OCR';
        hideLoading();
    }
}

// Load all documents
async function loadDocuments() {
    try {
        const response = await fetch(`${API_URL}/documents`);

        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }

        const documents = await response.json();
        renderDocuments(documents);
        docCount.textContent = documents.length;

    } catch (error) {
        console.error('Error loading documents:', error);
        documentsList.innerHTML = '<p class="no-documents">Error loading documents. Make sure the backend is running.</p>';
    }
}

// Render documents list
function renderDocuments(documents) {
    if (documents.length === 0) {
        documentsList.innerHTML = '<p class="no-documents">No documents uploaded yet</p>';
        return;
    }

    documentsList.innerHTML = documents.map(doc => `
        <div class="document-card">
            <div class="document-header">
                <h3>${escapeHtml(doc.originalName)}</h3>
                <button class="delete-btn" onclick="deleteDocument('${doc._id}')">Delete</button>
            </div>
            <div class="document-info">
                <p><strong>Uploaded:</strong> ${formatDate(doc.uploadDate)}</p>
                <p><strong>Size:</strong> ${formatFileSize(doc.size)}</p>
                <p><strong>Confidence:</strong> ${doc.ocrConfidence.toFixed(2)}%</p>
            </div>
            <div class="ocr-text-preview">
                <strong>OCR Text:</strong>
                <pre>${escapeHtml(doc.ocrText || 'No text detected')}</pre>
            </div>
        </div>
    `).join('');
}

// Delete document
async function deleteDocument(id) {
    if (!confirm('Are you sure you want to delete this document?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/documents/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete document');
        }

        // Reload documents list
        await loadDocuments();

        // Hide upload result if it's the deleted document
        const resultElement = document.getElementById('result-filename');
        if (uploadResult.style.display !== 'none' && resultElement) {
            hideUploadResult();
        }

    } catch (error) {
        console.error('Delete error:', error);
        showError('Failed to delete document');
    }
}

// Show upload result
function showUploadResult(document) {
    document.getElementById('result-filename').textContent = document.originalName;
    document.getElementById('result-confidence').textContent = document.confidence.toFixed(2);
    document.getElementById('result-text').textContent = document.ocrText || 'No text detected';
    uploadResult.style.display = 'block';
}

// Hide upload result
function hideUploadResult() {
    uploadResult.style.display = 'none';
}

// Show loading spinner
function showLoading() {
    loading.style.display = 'block';
}

// Hide loading spinner
function hideLoading() {
    loading.style.display = 'none';
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
}

// Utility: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Utility: Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Check backend health on page load
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        if (!response.ok) {
            throw new Error('Backend not responding');
        }
        console.log('Backend is healthy');
    } catch (error) {
        console.error('Backend health check failed:', error);
        showError('Cannot connect to backend. Make sure the server is running on port 5000.');
    }
}

// Run health check on page load
checkBackendHealth();
