// API Configuration
const API_URL = 'http://localhost:5000/api';

// DOM Elements - OCR Tab
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const selectedFileText = document.getElementById('selected-file');
const errorMessage = document.getElementById('error-message');
const uploadResult = document.getElementById('upload-result');
const loading = document.getElementById('loading');
const documentsList = document.getElementById('documents-list');
const docCount = document.getElementById('doc-count');

// DOM Elements - Context Tab
const contextFileInput = document.getElementById('context-file-input');
const contextUploadBtn = document.getElementById('context-upload-btn');
const contextDescription = document.getElementById('context-description');
const contextCategory = document.getElementById('context-category');
const contextSelectedFile = document.getElementById('context-selected-file');
const contextErrorMessage = document.getElementById('context-error-message');
const contextSuccessMessage = document.getElementById('context-success-message');
const contextList = document.getElementById('context-list');
const contextCount = document.getElementById('context-count');

// State
let selectedFile = null;
let selectedContextFile = null;

// Event Listeners - OCR
fileInput.addEventListener('change', handleFileSelect);
uploadBtn.addEventListener('click', handleUpload);

// Event Listeners - Context
contextFileInput.addEventListener('change', handleContextFileSelect);
contextUploadBtn.addEventListener('click', handleContextUpload);

// Event Listeners - Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// Event Listeners - Text Panels
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTextPanel(btn.dataset.text));
});

// Initialize
loadDocuments();
loadContextDocuments();
checkBackendHealth();

// Tab Switching
function switchTab(tabName) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// Text Panel Switching (Raw vs Cleaned)
function switchTextPanel(panelName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.text === panelName);
    });

    // Update panels
    document.getElementById('cleaned-text-panel').classList.toggle('active', panelName === 'cleaned');
    document.getElementById('raw-text-panel').classList.toggle('active', panelName === 'raw');
}

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

// Context file selection handler
function handleContextFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        selectedContextFile = file;
        contextSelectedFile.textContent = `Selected: ${file.name}`;
        hideContextError();
        hideContextSuccess();
    } else {
        selectedContextFile = null;
        contextSelectedFile.textContent = '';
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
        showUploadResult(data.document);

        fileInput.value = '';
        selectedFile = null;
        selectedFileText.textContent = '';

        await loadDocuments();

    } catch (error) {
        console.error('Upload error:', error);
        showError(error.message || 'Failed to upload file');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload & Process';
        hideLoading();
    }
}

// Context upload handler
async function handleContextUpload() {
    if (!selectedContextFile) {
        showContextError('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedContextFile);
    formData.append('description', contextDescription.value);
    formData.append('category', contextCategory.value);

    contextUploadBtn.disabled = true;
    contextUploadBtn.textContent = 'Uploading...';
    hideContextError();
    hideContextSuccess();

    try {
        const response = await fetch(`${API_URL}/context`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        showContextSuccess(`Successfully uploaded: ${data.contextDocument.originalName}`);

        contextFileInput.value = '';
        selectedContextFile = null;
        contextSelectedFile.textContent = '';
        contextDescription.value = '';
        contextCategory.value = '';

        await loadContextDocuments();

    } catch (error) {
        console.error('Context upload error:', error);
        showContextError(error.message || 'Failed to upload context file');
    } finally {
        contextUploadBtn.disabled = false;
        contextUploadBtn.textContent = 'Upload Context';
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

// Load all context documents
async function loadContextDocuments() {
    try {
        const response = await fetch(`${API_URL}/context`);

        if (!response.ok) {
            throw new Error('Failed to fetch context documents');
        }

        const contexts = await response.json();
        renderContextDocuments(contexts);
        contextCount.textContent = contexts.length;

    } catch (error) {
        console.error('Error loading context documents:', error);
        contextList.innerHTML = '<p class="no-documents">Error loading context documents.</p>';
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
                <p><strong>OCR Confidence:</strong> ${doc.ocrConfidence.toFixed(2)}%</p>
                <p><strong>AI Enhanced:</strong> ${doc.aiProcessed ? '✅ Yes' : '❌ No'}</p>
            </div>
            ${doc.aiProcessed && doc.aiCleanedText ? `
                <div class="ocr-text-preview">
                    <strong>AI-Cleaned Text (Preview):</strong>
                    <div class="markdown-content">${renderMarkdown(doc.aiCleanedText.substring(0, 500))}${doc.aiCleanedText.length > 500 ? '...' : ''}</div>
                </div>
            ` : `
                <div class="ocr-text-preview">
                    <strong>Raw OCR Text (Preview):</strong>
                    <pre>${escapeHtml((doc.ocrText || 'No text detected').substring(0, 300))}${doc.ocrText && doc.ocrText.length > 300 ? '...' : ''}</pre>
                </div>
            `}
        </div>
    `).join('');
}

// Render context documents list
function renderContextDocuments(contexts) {
    if (contexts.length === 0) {
        contextList.innerHTML = '<p class="no-documents">No context documents uploaded yet</p>';
        return;
    }

    contextList.innerHTML = contexts.map(ctx => `
        <div class="context-card">
            <div class="context-header">
                <div>
                    <h3>${escapeHtml(ctx.originalName)}</h3>
                    ${ctx.category ? `<span class="context-category">${escapeHtml(ctx.category)}</span>` : ''}
                </div>
                <button class="delete-btn" onclick="deleteContext('${ctx._id}')">Delete</button>
            </div>
            <div class="context-info">
                <p><strong>Uploaded:</strong> ${formatDate(ctx.uploadDate)}</p>
                <p><strong>Size:</strong> ${formatFileSize(ctx.size)}</p>
                ${ctx.description ? `<p><strong>Description:</strong> ${escapeHtml(ctx.description)}</p>` : ''}
            </div>
            <div class="context-preview">
                <strong>Content Preview:</strong>
                <pre>${escapeHtml((ctx.content || '').substring(0, 200))}${ctx.content && ctx.content.length > 200 ? '...' : ''}</pre>
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

        await loadDocuments();

        const resultElement = document.getElementById('result-filename');
        if (uploadResult.style.display !== 'none' && resultElement) {
            hideUploadResult();
        }

    } catch (error) {
        console.error('Delete error:', error);
        showError('Failed to delete document');
    }
}

// Delete context document
async function deleteContext(id) {
    if (!confirm('Are you sure you want to delete this context document?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/context/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete context document');
        }

        await loadContextDocuments();
        showContextSuccess('Context document deleted successfully');

    } catch (error) {
        console.error('Delete context error:', error);
        showContextError('Failed to delete context document');
    }
}

// Show upload result
function showUploadResult(doc) {
    document.getElementById('result-filename').textContent = doc.originalName;
    document.getElementById('result-confidence').textContent = doc.confidence.toFixed(2);
    document.getElementById('result-ai-status').textContent = doc.aiProcessed ? '✅ Yes' : '❌ No';

    // Show AI-cleaned text
    const cleanedTextDiv = document.getElementById('result-cleaned-text');
    if (doc.aiCleanedText) {
        cleanedTextDiv.innerHTML = renderMarkdown(doc.aiCleanedText);
    } else {
        cleanedTextDiv.textContent = 'AI processing was not available';
    }

    // Show raw OCR text
    document.getElementById('result-text').textContent = doc.ocrText || 'No text detected';

    uploadResult.style.display = 'block';
}

// Simple markdown renderer
function renderMarkdown(text) {
    if (!text) return '';

    return text
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Line breaks
        .replace(/\n/g, '<br>')
        // Lists
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
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

// Show context error
function showContextError(message) {
    contextErrorMessage.textContent = message;
    contextErrorMessage.style.display = 'block';
}

// Hide context error
function hideContextError() {
    contextErrorMessage.style.display = 'none';
}

// Show context success
function showContextSuccess(message) {
    contextSuccessMessage.textContent = message;
    contextSuccessMessage.style.display = 'block';
    setTimeout(() => hideContextSuccess(), 5000);
}

// Hide context success
function hideContextSuccess() {
    contextSuccessMessage.style.display = 'none';
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
