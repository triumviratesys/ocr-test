# Quick Start Guide

Get up and running in 5 minutes!

## Choose Your Frontend

**Option 1: Live Server (Easiest)** - No build tools, just HTML/CSS/JS
- See **Live Server Quick Start** below

**Option 2: React** - Modern framework with build process
- See **React Quick Start** below

---

## Live Server Quick Start

### Prerequisites Check

```bash
# Check Node.js version (need v14+)
node --version

# Check if MongoDB is installed
mongod --version
```

### Installation

Only need to install backend dependencies:

```bash
cd backend
npm install
```

That's it! No frontend installation needed.

### Running

**Terminal 1: Start MongoDB**
```bash
# Using local MongoDB
sudo systemctl start mongod

# OR using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Terminal 2: Start Backend**
```bash
cd backend
npm start
```

**VSCode: Open with Live Server**
1. Open `public/index.html` in VSCode
2. Install "Live Server" extension if you haven't
3. Right-click in the editor → "Open with Live Server"
4. Browser opens automatically!

✅ Done! Upload an image and see OCR in action.

---

## React Quick Start

### Prerequisites Check

```bash
# Check Node.js version (need v14+)
node --version

# Check if MongoDB is installed
mongod --version
```

### Installation

Install both backend and frontend dependencies:

```bash
# Install backend
cd backend && npm install && cd ..

# Install frontend
cd frontend && npm install && cd ..
```

## Starting the Application

### Terminal 1: Start MongoDB (if not running)

```bash
# Using local MongoDB
sudo systemctl start mongod

# OR using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Terminal 2: Start Backend

```bash
cd backend
npm start
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

### Terminal 3: Start Frontend

```bash
cd frontend
npm start
```

Your browser will automatically open to `http://localhost:3000`

## First Upload Test

1. Find any image with text (screenshot, photo of a document, etc.)
2. Click "Choose File" in the web interface
3. Select your image
4. Click "Upload & Process OCR"
5. Wait a few seconds for processing
6. See the extracted text appear!

## Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Or check Docker container
docker ps | grep mongodb
```

### "Port 5000 already in use"
Edit `backend/.env` and change:
```
PORT=5001
```

Then update `frontend/package.json` proxy:
```json
"proxy": "http://localhost:5001"
```

### "Module not found" errors
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

## Testing the API Directly

```bash
# Health check
curl http://localhost:5000/api/health

# Get all documents
curl http://localhost:5000/api/documents

# Upload a file
curl -X POST -F "file=@/path/to/image.jpg" http://localhost:5000/api/upload
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the API endpoints section
- Customize the styling in `frontend/src/App.css`
- Add authentication (future enhancement)
- Deploy to production

## Common Issues

1. **OCR is slow**: First run downloads language data, subsequent runs are faster
2. **Poor OCR accuracy**: Use clear, high-contrast images with readable text
3. **File upload fails**: Check file size (max 10MB) and format (images only)

Enjoy your OCR application!
