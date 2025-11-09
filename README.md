# OCR File Upload Application

A full-stack web application that allows users to upload image files, performs OCR (Optical Character Recognition) using Tesseract.js, and stores the results in MongoDB.

## Features

- Upload image files (JPEG, PNG, GIF, BMP)
- Server-side OCR processing using Tesseract.js
- Store file metadata and OCR results in MongoDB
- View all uploaded documents with extracted text
- Delete documents and associated files
- Clean, responsive UI built with React
- RESTful API with Express.js

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Tesseract.js** for OCR processing
- **Multer** for file upload handling
- **CORS** for cross-origin requests

### Frontend Options

**Option 1: Simple HTML/CSS/JS (Recommended for Live Server)**
- Vanilla JavaScript with no build tools
- Can be run with VSCode Live Server extension
- Located in `public/` directory

**Option 2: React (Advanced)**
- React 18
- Axios for API requests
- Located in `frontend/` directory
- Requires npm and build process

## Project Structure

```
ocr-test/
├── backend/
│   ├── models/
│   │   └── Document.js       # MongoDB schema
│   ├── uploads/              # Uploaded files directory
│   ├── .env                  # Environment variables
│   ├── .env.example          # Environment variables template
│   ├── package.json
│   └── server.js             # Express server
├── public/                   # Simple HTML/CSS/JS version (Live Server)
│   ├── index.html           # Main HTML file
│   ├── styles.css           # Styling
│   └── app.js               # JavaScript logic
├── frontend/                 # React version (optional)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── App.css          # Styling
│   │   └── index.js         # React entry point
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd ocr-test
```

### 2. Set up Backend

```bash
cd backend
npm install
```

Configure your environment variables:
```bash
cp .env.example .env
```

Edit `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/ocr-database
PORT=5000
```

### 3. Set up Frontend (Optional - for React version only)

```bash
cd ../frontend
npm install
```

## Running the Application

### Method 1: Using VSCode Live Server (Simple & Quick)

This is the easiest method using the static HTML files in the `public/` directory.

#### Step 1: Start MongoDB

```bash
# On Linux/Mac
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Step 2: Start Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:5000`

#### Step 3: Open with Live Server

1. Open VSCode
2. Install the "Live Server" extension if you haven't already (Publisher: Ritwick Dey)
3. Open the `public/index.html` file
4. Right-click in the editor and select "Open with Live Server"
5. Your browser will open automatically at `http://127.0.0.1:5500/public/index.html`

That's it! No npm install needed for the frontend.

### Method 2: Using React (Advanced)

If you prefer the React version:

#### Step 1: Start MongoDB (same as above)

#### Step 2: Start Backend Server

```bash
cd backend
npm start
```

For development with auto-restart:
```bash
npm run dev
```

#### Step 3: Start React Frontend

In a new terminal:

```bash
cd frontend
npm start
```

The React app will open in your browser at `http://localhost:3000`

## API Endpoints

### Upload File
- **POST** `/api/upload`
- Upload an image file for OCR processing
- Request: `multipart/form-data` with `file` field
- Response: Document object with OCR results

### Get All Documents
- **GET** `/api/documents`
- Retrieve all uploaded documents
- Response: Array of document objects

### Get Document by ID
- **GET** `/api/documents/:id`
- Retrieve a single document
- Response: Document object

### Delete Document
- **DELETE** `/api/documents/:id`
- Delete a document and its associated file
- Response: Success message

### Health Check
- **GET** `/api/health`
- Check if the API is running
- Response: `{ status: 'ok' }`

## Usage

1. Open the application in your browser
   - Live Server: Usually `http://127.0.0.1:5500/public/index.html`
   - React: `http://localhost:3000`
2. Click "Choose File" and select an image containing text
3. Click "Upload & Process OCR" button
4. Wait for the OCR processing to complete (may take a few seconds)
5. View the extracted text and confidence score
6. All uploaded documents appear in the list below
7. Click "Delete" to remove documents

## File Upload Limitations

- Maximum file size: 10MB
- Supported formats: JPEG, PNG, GIF, BMP
- Only image files are accepted

## MongoDB Schema

```javascript
{
  filename: String,        // Stored filename
  originalName: String,    // Original filename
  filePath: String,        // Path to file on disk
  mimeType: String,        // File MIME type
  size: Number,            // File size in bytes
  ocrText: String,         // Extracted text
  ocrConfidence: Number,   // OCR confidence score
  uploadDate: Date         // Upload timestamp
}
```

## Development

### Backend Development

The backend uses nodemon for auto-restart:
```bash
npm run dev
```

### Frontend Development

React's development server provides hot reloading by default:
```bash
npm start
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check the `MONGODB_URI` in `.env`
- Verify MongoDB is accessible on the specified port

### CORS Errors
- Make sure the backend is running on port 5000
- Check that the frontend proxy is configured in `frontend/package.json`

### OCR Not Working
- Tesseract.js downloads language data on first use
- Ensure you have a stable internet connection
- Check backend console logs for detailed error messages

### File Upload Fails
- Check that the `backend/uploads/` directory exists and is writable
- Verify file size is under 10MB
- Ensure the file is an image type

## Future Enhancements

- Support for PDF files
- Multiple language support for OCR
- Image preprocessing for better OCR accuracy
- User authentication and authorization
- Search functionality for OCR text
- Export OCR results to different formats
- Batch file upload
- Progress bar for upload/processing

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
