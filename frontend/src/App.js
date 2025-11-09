import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch all documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadResult(response.data.document);
      setSelectedFile(null);

      // Reset file input
      document.getElementById('file-input').value = '';

      // Refresh document list
      fetchDocuments();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/documents/${id}`);
      fetchDocuments();

      // Clear upload result if it's the deleted document
      if (uploadResult && uploadResult.id === id) {
        setUploadResult(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete document');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>OCR File Upload</h1>
        <p>Upload images to extract text using Tesseract.js</p>
      </header>

      <main className="App-main">
        {/* Upload Section */}
        <div className="upload-section">
          <h2>Upload New Image</h2>
          <div className="upload-controls">
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="upload-btn"
            >
              {uploading ? 'Processing...' : 'Upload & Process OCR'}
            </button>
          </div>

          {selectedFile && (
            <p className="selected-file">Selected: {selectedFile.name}</p>
          )}

          {error && <div className="error-message">{error}</div>}

          {uploadResult && (
            <div className="upload-result">
              <h3>Upload Successful!</h3>
              <p><strong>File:</strong> {uploadResult.originalName}</p>
              <p><strong>Confidence:</strong> {uploadResult.confidence.toFixed(2)}%</p>
              <div className="ocr-text-box">
                <strong>Extracted Text:</strong>
                <pre>{uploadResult.ocrText || 'No text detected'}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="documents-section">
          <h2>Uploaded Documents ({documents.length})</h2>
          {documents.length === 0 ? (
            <p className="no-documents">No documents uploaded yet</p>
          ) : (
            <div className="documents-list">
              {documents.map((doc) => (
                <div key={doc._id} className="document-card">
                  <div className="document-header">
                    <h3>{doc.originalName}</h3>
                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="document-info">
                    <p><strong>Uploaded:</strong> {new Date(doc.uploadDate).toLocaleString()}</p>
                    <p><strong>Size:</strong> {(doc.size / 1024).toFixed(2)} KB</p>
                    <p><strong>Confidence:</strong> {doc.ocrConfidence.toFixed(2)}%</p>
                  </div>
                  <div className="ocr-text-preview">
                    <strong>OCR Text:</strong>
                    <pre>{doc.ocrText || 'No text detected'}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
