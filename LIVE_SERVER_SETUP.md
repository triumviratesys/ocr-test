# Live Server Setup Guide

This guide will help you run the OCR application using VSCode's Live Server extension - the simplest way to get started!

## What You Need

1. **VSCode** - Download from [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. **Node.js** - For the backend server only. Download from [https://nodejs.org/](https://nodejs.org/)
3. **MongoDB** - For database storage
4. **Live Server Extension** - Install from VSCode marketplace

## Step-by-Step Setup

### 1. Install Live Server Extension

1. Open VSCode
2. Click the Extensions icon (or press `Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Live Server"
4. Install the extension by **Ritwick Dey**
5. Reload VSCode if prompted

### 2. Install Backend Dependencies

Open a terminal in the project directory and run:

```bash
cd backend
npm install
```

This installs all the required packages for the backend server.

### 3. Start MongoDB

Choose one of these options:

**Option A: Local MongoDB**
```bash
# Linux/Mac
sudo systemctl start mongod

# Windows (if MongoDB is installed as a service)
net start MongoDB
```

**Option B: Docker (if you have Docker installed)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option C: MongoDB Atlas (Free cloud database)**
1. Sign up at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env` with your connection string

### 4. Start the Backend Server

In your terminal:

```bash
cd backend
npm start
```

You should see:
```
Connected to MongoDB
Server running on port 5000
```

**Keep this terminal window open!** The backend must stay running.

### 5. Open with Live Server

1. In VSCode, navigate to `public/index.html`
2. Right-click anywhere in the HTML file
3. Select **"Open with Live Server"**
4. Your default browser will automatically open to `http://127.0.0.1:5500/public/index.html`

## Testing the Application

1. You should see the "OCR File Upload" interface
2. Click "Choose File" and select any image with text (screenshot, photo of a document, etc.)
3. Click "Upload & Process OCR"
4. Wait a few seconds for processing
5. The extracted text will appear below!

## Troubleshooting

### "Cannot connect to backend" error

**Problem:** The frontend can't reach the backend server.

**Solutions:**
- Make sure the backend is running (you should see "Server running on port 5000")
- Check that no other application is using port 5000
- Verify the backend URL in `public/app.js` (should be `http://localhost:5000/api`)

### "Cannot GET /api/health" or similar errors

**Problem:** Backend server isn't responding.

**Solutions:**
- Restart the backend server
- Check for errors in the backend terminal
- Make sure all dependencies are installed (`npm install` in backend directory)

### MongoDB connection errors

**Problem:** Backend can't connect to MongoDB.

**Solutions:**
- Verify MongoDB is running:
  ```bash
  # Check if MongoDB is running
  sudo systemctl status mongod  # Linux

  # Or check Docker
  docker ps | grep mongodb
  ```
- Check your `backend/.env` file has the correct `MONGODB_URI`
- Default should be: `mongodb://localhost:27017/ocr-database`

### Live Server not working

**Problem:** Live Server won't start or page doesn't load.

**Solutions:**
- Make sure you right-clicked on `public/index.html` specifically
- Try clicking the "Go Live" button in VSCode's status bar (bottom right)
- Check if another Live Server instance is already running
- Try a different port by configuring Live Server settings

### OCR is very slow

**First run:** Tesseract.js needs to download language data files (~5MB). This only happens once.

**Subsequent runs:** Should be much faster. If still slow:
- Check your internet connection (for first run)
- Try with a smaller image file
- Clear browser cache and try again

### Images won't upload

**Solutions:**
- Check file size (must be under 10MB)
- Verify file format (JPEG, PNG, GIF, or BMP only)
- Check browser console for errors (F12 → Console tab)
- Verify the `backend/uploads/` directory exists

## Customization

### Change Backend Port

If port 5000 is already in use:

1. Edit `backend/.env`:
   ```
   PORT=5001
   ```

2. Edit `public/app.js` line 2:
   ```javascript
   const API_URL = 'http://localhost:5001/api';
   ```

3. Restart the backend server

### Change Live Server Port

1. In VSCode, go to Settings (`Ctrl+,` / `Cmd+,`)
2. Search for "Live Server"
3. Find "Live Server > Settings: Port"
4. Change to your desired port (e.g., 5500, 8080, etc.)

## File Locations

### Frontend Files (What Live Server serves)
- `public/index.html` - Main HTML structure
- `public/styles.css` - All styling
- `public/app.js` - JavaScript logic and API calls

### Backend Files
- `backend/server.js` - Express server and API routes
- `backend/models/Document.js` - MongoDB schema
- `backend/uploads/` - Where uploaded images are stored

## Next Steps

- Try different images with various text types
- Check the MongoDB database to see stored documents
- Customize the styling in `public/styles.css`
- Add more features to the API
- Deploy to production

## Stopping the Application

1. **Stop Live Server**: Click "Port: 5500" in VSCode status bar, or close the browser
2. **Stop Backend**: In the backend terminal, press `Ctrl+C`
3. **Stop MongoDB** (optional):
   ```bash
   # Linux/Mac
   sudo systemctl stop mongod

   # Docker
   docker stop mongodb
   ```

## Additional Resources

- [Live Server Documentation](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- [Express.js Documentation](https://expressjs.com/)
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## Getting Help

If you run into issues:

1. Check the browser console (F12 → Console)
2. Check the backend terminal for error messages
3. Verify all prerequisites are installed
4. Make sure all commands were run in the correct directories
5. Try restarting everything (MongoDB, backend, Live Server)

Happy OCR processing!
