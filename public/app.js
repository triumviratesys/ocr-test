// API Configuration
const API_URL = 'http://localhost:5000/api';

// DOM Elements - OCR Tab
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const batchFileInput = document.getElementById('batch-file-input');
const batchUploadBtn = document.getElementById('batch-upload-btn');
const notesetNameInput = document.getElementById('noteset-name');
const selectedFileText = document.getElementById('selected-file');
const errorMessage = document.getElementById('error-message');
const uploadResult = document.getElementById('upload-result');
const loading = document.getElementById('loading');
const documentsList = document.getElementById('documents-list');
const docCount = document.getElementById('doc-count');

// DOM Elements - Note Sets Tab
const notesetsList = document.getElementById('notesets-list');
const notesetCount = document.getElementById('noteset-count');
const notesetViewer = document.getElementById('noteset-viewer');
const viewerNotesetName = document.getElementById('viewer-noteset-name');
const viewerFilename = document.getElementById('viewer-filename');
const viewerConfidence = document.getElementById('viewer-confidence');
const viewerCleanedText = document.getElementById('viewer-cleaned-text');
const viewerRawText = document.getElementById('viewer-raw-text');
const docPosition = document.getElementById('doc-position');
const prevDocBtn = document.getElementById('prev-doc');
const nextDocBtn = document.getElementById('next-doc');
const closeViewerBtn = document.getElementById('close-viewer');
const moveDocUpBtn = document.getElementById('move-doc-up');
const moveDocDownBtn = document.getElementById('move-doc-down');
const removeFromSetBtn = document.getElementById('remove-from-set');
const editNotesetNameBtn = document.getElementById('edit-noteset-name');

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
let selectedBatchFiles = [];
let selectedContextFile = null;
let editingDocumentId = null;
let collapsedDocuments = new Set();
let uploadMode = 'single'; // 'single' or 'batch'

// Note Set Viewer State
let currentNoteSet = null;
let currentDocIndex = 0;

// Event Listeners - Upload Mode Toggle
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        uploadMode = btn.dataset.mode;
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (uploadMode === 'single') {
            document.getElementById('single-upload').style.display = 'flex';
            document.getElementById('batch-upload').style.display = 'none';
        } else {
            document.getElementById('single-upload').style.display = 'none';
            document.getElementById('batch-upload').style.display = 'flex';
        }
        selectedFileText.textContent = '';
    });
});

// Event Listeners - OCR
fileInput.addEventListener('change', handleFileSelect);
uploadBtn.addEventListener('click', handleUpload);
batchFileInput.addEventListener('change', handleBatchFileSelect);
batchUploadBtn.addEventListener('click', handleBatchUpload);

// Event Listeners - Note Set Viewer
closeViewerBtn.addEventListener('click', closeNoteSetViewer);
prevDocBtn.addEventListener('click', () => navigateDocument(-1));
nextDocBtn.addEventListener('click', () => navigateDocument(1));
moveDocUpBtn.addEventListener('click', () => moveDocument(-1));
moveDocDownBtn.addEventListener('click', () => moveDocument(1));
removeFromSetBtn.addEventListener('click', removeDocumentFromSet);
editNotesetNameBtn.addEventListener('click', renameNoteSet);

// Event Listeners - Context
contextFileInput.addEventListener('change', handleContextFileSelect);
contextUploadBtn.addEventListener('click', handleContextUpload);

// Event Listeners - Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
        if (btn.dataset.tab === 'notesets') {
            loadNoteSets();
        }
    });
});

// Event Listeners - Text Panels (Note Set Viewer)
document.getElementById('viewer-cleaned-panel').parentElement.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const panelName = btn.dataset.text;
        e.currentTarget.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.getElementById('viewer-cleaned-panel').classList.toggle('active', panelName === 'cleaned');
        document.getElementById('viewer-raw-panel').classList.toggle('active', panelName === 'raw');
    });
});

// Event Listeners - Text Panels (Upload Result)
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

// Batch file selection handler
function handleBatchFileSelect(event) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
        selectedBatchFiles = files;
        selectedFileText.textContent = `Selected: ${files.length} file(s) - ${files.map(f => f.name).join(', ')}`;
        hideError();
        hideUploadResult();
    } else {
        selectedBatchFiles = [];
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

// Upload handler (single file)
async function handleUpload() {
    if (!selectedFile) {
        showError('Please select a file first');
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        loading.style.display = 'block';
        hideError();
        hideUploadResult();

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();

        // Show result
        document.getElementById('result-filename').textContent = data.document.originalName;
        document.getElementById('result-confidence').textContent = data.document.confidence.toFixed(2);
        document.getElementById('result-ai-status').textContent = data.document.aiProcessed ? 'Yes' : 'No';
        document.getElementById('result-text').textContent = data.document.ocrText;
        document.getElementById('result-cleaned-text').innerHTML = marked.parse(data.document.aiCleanedText || data.document.ocrText);

        uploadResult.style.display = 'block';

        // Reload documents list
        await loadDocuments();

        // Reset form
        fileInput.value = '';
        selectedFile = null;
        selectedFileText.textContent = '';

    } catch (error) {
        showError('Error uploading file: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

// Batch upload handler
async function handleBatchUpload() {
    if (selectedBatchFiles.length === 0) {
        showError('Please select at least one file');
        return;
    }

    const formData = new FormData();
    selectedBatchFiles.forEach(file => {
        formData.append('files', file);
    });

    const notesetName = notesetNameInput.value.trim() || `Note Set ${new Date().toLocaleDateString()}`;
    formData.append('noteSetName', notesetName);

    try {
        loading.style.display = 'block';
        hideError();
        hideUploadResult();

        const loadingText = loading.querySelector('p');
        loadingText.textContent = `Processing batch upload of ${selectedBatchFiles.length} file(s)... This may take several minutes`;

        const response = await fetch(`${API_URL}/upload-batch`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Batch upload failed');
        }

        const data = await response.json();

        // Show success message
        let message = `Successfully processed ${data.processedCount} of ${selectedBatchFiles.length} file(s)`;
        if (data.errorCount > 0) {
            message += `\n${data.errorCount} file(s) failed`;
        }
        alert(message);

        // Switch to note sets tab
        if (data.noteSet) {
            switchTab('notesets');
            await loadNoteSets();
        } else {
            await loadDocuments();
        }

        // Reset form
        batchFileInput.value = '';
        notesetNameInput.value = '';
        selectedBatchFiles = [];
        selectedFileText.textContent = '';

    } catch (error) {
        showError('Error uploading batch: ' + error.message);
    } finally {
        loading.style.display = 'none';
        loading.querySelector('p').textContent = 'Processing OCR and AI enhancement... This may take 15-30 seconds';
    }
}

// Load documents
async function loadDocuments() {
    try {
        const response = await fetch(`${API_URL}/documents`);
        const documents = await response.json();
        renderDocuments(documents);
        docCount.textContent = documents.length;
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

// Render documents
function renderDocuments(documents) {
    if (documents.length === 0) {
        documentsList.innerHTML = '<p class="no-documents">No documents uploaded yet</p>';
        return;
    }

    documentsList.innerHTML = documents.map(doc => {
        const isEditing = editingDocumentId === doc._id;
        const isCollapsed = collapsedDocuments.has(doc._id);

        return `
        <div class="document-card" data-doc-id="${doc._id}">
            <div class="document-header">
                <h3>
                    <a href="${API_URL}/documents/${doc._id}/image" download="${doc.originalName}" class="filename-link">
                        ${escapeHtml(doc.originalName)}
                    </a>
                </h3>
                <div class="document-actions">
                    ${!isEditing ? `
                        <button class="download-btn" onclick="downloadImage('${doc._id}', '${escapeHtml(doc.originalName)}')" title="Download Image">📥 Image</button>
                        <button class="download-btn" onclick="downloadText('${doc._id}', '${escapeHtml(doc.originalName)}')" title="Download Text">💾 Text</button>
                        <button class="collapse-btn" onclick="toggleCollapse('${doc._id}')">
                            ${isCollapsed ? '▶ Expand' : '▼ Collapse'}
                        </button>
                        <button class="edit-btn" onclick="startEditDocument('${doc._id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteDocument('${doc._id}')">Delete</button>
                    ` : `
                        <button class="save-btn" onclick="saveDocument('${doc._id}')">Save</button>
                        <button class="cancel-btn" onclick="cancelEditDocument()">Cancel</button>
                    `}
                </div>
            </div>
            <div class="document-info">
                <p><strong>Uploaded:</strong> ${formatDate(doc.uploadDate)}</p>
                <p><strong>Size:</strong> ${formatFileSize(doc.size)}</p>
                <p><strong>OCR Confidence:</strong> ${doc.ocrConfidence.toFixed(2)}%</p>
            </div>
            ${!isCollapsed ? `
                <div class="ocr-text-preview scrollable">
                    ${isEditing ? `
                        <div class="edit-section">
                            ${doc.aiCleanedText ? `
                                <div class="edit-field">
                                    <strong>AI-Cleaned Text:</strong>
                                    <textarea id="edit-cleaned-${doc._id}" class="edit-textarea">${escapeHtml(doc.aiCleanedText)}</textarea>
                                </div>
                            ` : ''}
                            <div class="edit-field">
                                <strong>Raw OCR Text:</strong>
                                <textarea id="edit-raw-${doc._id}" class="edit-textarea">${escapeHtml(doc.ocrText)}</textarea>
                            </div>
                        </div>
                    ` : `
                        <h4>✨ AI-Cleaned Text:</h4>
                        <div class="markdown-content">
                            ${marked.parse(doc.aiCleanedText || doc.ocrText)}
                        </div>
                        <h4>📝 Raw OCR Text:</h4>
                        <pre>${escapeHtml(doc.ocrText)}</pre>
                    `}
                </div>
            ` : ''}
        </div>
        `;
    }).join('');
}

// Note Sets Functions

async function loadNoteSets() {
    try {
        const response = await fetch(`${API_URL}/notesets`);
        const noteSets = await response.json();
        renderNoteSets(noteSets);
        notesetCount.textContent = noteSets.length;
    } catch (error) {
        console.error('Error loading note sets:', error);
    }
}

function renderNoteSets(noteSets) {
    if (noteSets.length === 0) {
        notesetsList.innerHTML = '<p class="no-documents">No note sets created yet</p>';
        return;
    }

    notesetsList.innerHTML = noteSets.map(set => `
        <div class="noteset-card" data-set-id="${set._id}">
            <div class="noteset-header">
                <h3>${escapeHtml(set.name)}</h3>
                <div class="noteset-info">
                    <span>${set.documents.length} document(s)</span>
                    <span>Updated: ${formatDate(set.updatedDate)}</span>
                </div>
            </div>
            <div class="noteset-actions">
                <button class="view-btn" onclick="viewNoteSet('${set._id}')">View</button>
                <button class="delete-btn" onclick="deleteNoteSet('${set._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function viewNoteSet(noteSetId) {
    try {
        const response = await fetch(`${API_URL}/notesets/${noteSetId}`);
        currentNoteSet = await response.json();
        currentDocIndex = 0;

        // Hide note sets list, show viewer
        document.querySelector('.notesets-section').style.display = 'none';
        notesetViewer.style.display = 'block';

        // Display note set
        displayNoteSetDocument();
    } catch (error) {
        console.error('Error loading note set:', error);
        alert('Error loading note set');
    }
}

function displayNoteSetDocument() {
    if (!currentNoteSet || currentNoteSet.documents.length === 0) return;

    const doc = currentNoteSet.documents[currentDocIndex].documentId;

    // Update header
    viewerNotesetName.textContent = currentNoteSet.name;
    viewerFilename.textContent = doc.originalName;
    viewerConfidence.textContent = `Confidence: ${doc.ocrConfidence.toFixed(2)}%`;

    // Update text content
    viewerCleanedText.innerHTML = marked.parse(doc.aiCleanedText || doc.ocrText);
    viewerRawText.textContent = doc.ocrText;

    // Update position
    docPosition.textContent = `${currentDocIndex + 1} / ${currentNoteSet.documents.length}`;

    // Update navigation buttons
    prevDocBtn.disabled = currentDocIndex === 0;
    nextDocBtn.disabled = currentDocIndex === currentNoteSet.documents.length - 1;

    // Update move buttons
    moveDocUpBtn.disabled = currentDocIndex === 0;
    moveDocDownBtn.disabled = currentDocIndex === currentNoteSet.documents.length - 1;
}

function navigateDocument(direction) {
    const newIndex = currentDocIndex + direction;
    if (newIndex >= 0 && newIndex < currentNoteSet.documents.length) {
        currentDocIndex = newIndex;
        displayNoteSetDocument();
    }
}

async function moveDocument(direction) {
    if (!currentNoteSet) return;

    const newIndex = currentDocIndex + direction;
    if (newIndex < 0 || newIndex >= currentNoteSet.documents.length) return;

    try {
        // Swap documents
        const docs = currentNoteSet.documents;
        const temp = docs[currentDocIndex];
        docs[currentDocIndex] = docs[newIndex];
        docs[newIndex] = temp;

        // Update orders
        docs.forEach((doc, idx) => {
            doc.order = idx;
        });

        // Send update to server
        const response = await fetch(`${API_URL}/notesets/${currentNoteSet._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                documents: docs.map(d => ({
                    documentId: d.documentId._id,
                    order: d.order
                }))
            })
        });

        if (!response.ok) throw new Error('Failed to reorder documents');

        // Update current index and refresh
        currentDocIndex = newIndex;
        const data = await response.json();
        currentNoteSet = data.noteSet;
        displayNoteSetDocument();

    } catch (error) {
        console.error('Error moving document:', error);
        alert('Error reordering document');
    }
}

async function removeDocumentFromSet() {
    if (!currentNoteSet || currentNoteSet.documents.length === 0) return;

    if (!confirm('Remove this document from the note set?')) return;

    try {
        const docId = currentNoteSet.documents[currentDocIndex].documentId._id;

        const response = await fetch(`${API_URL}/notesets/${currentNoteSet._id}/documents/${docId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to remove document');

        const data = await response.json();
        currentNoteSet = data.noteSet;

        // If no documents left, close viewer
        if (currentNoteSet.documents.length === 0) {
            closeNoteSetViewer();
            loadNoteSets();
        } else {
            // Adjust current index if needed
            if (currentDocIndex >= currentNoteSet.documents.length) {
                currentDocIndex = currentNoteSet.documents.length - 1;
            }
            displayNoteSetDocument();
        }

    } catch (error) {
        console.error('Error removing document:', error);
        alert('Error removing document from set');
    }
}

async function renameNoteSet() {
    if (!currentNoteSet) return;

    const newName = prompt('Enter new name:', currentNoteSet.name);
    if (!newName || newName === currentNoteSet.name) return;

    try {
        const response = await fetch(`${API_URL}/notesets/${currentNoteSet._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        });

        if (!response.ok) throw new Error('Failed to rename note set');

        const data = await response.json();
        currentNoteSet = data.noteSet;
        viewerNotesetName.textContent = currentNoteSet.name;

    } catch (error) {
        console.error('Error renaming note set:', error);
        alert('Error renaming note set');
    }
}

function closeNoteSetViewer() {
    notesetViewer.style.display = 'none';
    document.querySelector('.notesets-section').style.display = 'block';
    currentNoteSet = null;
    currentDocIndex = 0;
    loadNoteSets();
}

async function deleteNoteSet(setId) {
    if (!confirm('Delete this note set? (Documents will not be deleted)')) return;

    try {
        const response = await fetch(`${API_URL}/notesets/${setId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete note set');

        await loadNoteSets();
    } catch (error) {
        console.error('Error deleting note set:', error);
        alert('Error deleting note set');
    }
}

// Start editing a document
function startEditDocument(id) {
    editingDocumentId = id;
    loadDocuments();
}

// Cancel editing a document
function cancelEditDocument() {
    editingDocumentId = null;
    loadDocuments();
}

// Save edited document
async function saveDocument(id) {
    try {
        const cleanedTextArea = document.getElementById(`edit-cleaned-${id}`);
        const rawTextArea = document.getElementById(`edit-raw-${id}`);

        const updateData = {};

        if (rawTextArea) {
            updateData.ocrText = rawTextArea.value;
        }

        if (cleanedTextArea) {
            updateData.aiCleanedText = cleanedTextArea.value;
        }

        const response = await fetch(`${API_URL}/documents/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error('Failed to save document');
        }

        editingDocumentId = null;
        await loadDocuments();

        // Show success message briefly
        const card = document.querySelector(`[data-doc-id="${id}"]`);
        if (card) {
            const header = card.querySelector('.document-header h3');
            const originalText = header.textContent;
            header.textContent = '✅ Saved successfully!';
            setTimeout(() => {
                header.textContent = originalText;
            }, 2000);
        }

    } catch (error) {
        console.error('Save error:', error);
        showError('Failed to save document changes');
    }
}

function toggleCollapse(id) {
    if (collapsedDocuments.has(id)) {
        collapsedDocuments.delete(id);
    } else {
        collapsedDocuments.add(id);
    }
    loadDocuments();
}

// Download image
async function downloadImage(id, filename) {
    try {
        const response = await fetch(`${API_URL}/documents/${id}/image`);
        if (!response.ok) throw new Error('Failed to download image');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download image error:', error);
        showError('Failed to download image');
    }
}

// Download text
async function downloadText(id, originalFilename) {
    try {
        const response = await fetch(`${API_URL}/documents/${id}`);
        if (!response.ok) throw new Error('Failed to fetch document');

        const doc = await response.json();

        // Prefer AI-cleaned text if available, otherwise use raw OCR text
        const textContent = doc.aiCleanedText || doc.ocrText || '';

        // Create filename with .txt extension
        const baseFilename = originalFilename.replace(/\.[^/.]+$/, '');
        const filename = `${baseFilename}.txt`;

        // Create and download text file
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download text error:', error);
        showError('Failed to download text');
    }
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
    } catch (error) {
        console.error('Delete error:', error);
        showError('Failed to delete document');
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

    try {
        const response = await fetch(`${API_URL}/context`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        showContextSuccess('Context document uploaded successfully!');

        // Reload context documents list
        await loadContextDocuments();

        // Reset form
        contextFileInput.value = '';
        contextDescription.value = '';
        contextCategory.value = '';
        selectedContextFile = null;
        contextSelectedFile.textContent = '';

        setTimeout(() => {
            hideContextSuccess();
        }, 3000);

    } catch (error) {
        showContextError('Error uploading context document: ' + error.message);
    }
}

// Load context documents
async function loadContextDocuments() {
    try {
        const response = await fetch(`${API_URL}/context`);
        const contextDocs = await response.json();
        renderContextDocuments(contextDocs);
        contextCount.textContent = contextDocs.length;
    } catch (error) {
        console.error('Error loading context documents:', error);
    }
}

// Render context documents
function renderContextDocuments(contextDocs) {
    if (contextDocs.length === 0) {
        contextList.innerHTML = '<p class="no-documents">No context documents uploaded yet</p>';
        return;
    }

    contextList.innerHTML = contextDocs.map(doc => `
        <div class="context-card">
            <div class="context-header">
                <h3>${escapeHtml(doc.originalName)}</h3>
                <button class="delete-btn-small" onclick="deleteContextDocument('${doc._id}')">Delete</button>
            </div>
            <div class="context-info">
                ${doc.description ? `<p><strong>Description:</strong> ${escapeHtml(doc.description)}</p>` : ''}
                ${doc.category ? `<p><strong>Category:</strong> <span class="category-tag">${escapeHtml(doc.category)}</span></p>` : ''}
                <p><strong>Uploaded:</strong> ${formatDate(doc.uploadDate)}</p>
                <p><strong>Size:</strong> ${formatFileSize(doc.size)}</p>
            </div>
        </div>
    `).join('');
}

// Delete context document
async function deleteContextDocument(id) {
    if (!confirm('Delete this context document?')) {
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
    } catch (error) {
        console.error('Delete error:', error);
        showContextError('Failed to delete context document');
    }
}

// Utility functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function hideUploadResult() {
    uploadResult.style.display = 'none';
}

function showContextError(message) {
    contextErrorMessage.textContent = message;
    contextErrorMessage.style.display = 'block';
}

function hideContextError() {
    contextErrorMessage.style.display = 'none';
}

function showContextSuccess(message) {
    contextSuccessMessage.textContent = message;
    contextSuccessMessage.style.display = 'block';
}

function hideContextSuccess() {
    contextSuccessMessage.style.display = 'none';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_URL}/documents`);
        if (!response.ok) {
            console.warn('Backend may not be running');
        }
    } catch (error) {
        console.error('Cannot connect to backend:', error);
    }
}
