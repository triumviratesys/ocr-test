# 🚀 START HERE - OCR File Upload App

Welcome! This is a simple web application that lets you upload images and extract text using OCR (Optical Character Recognition).

## ⚡ Fastest Way to Run (Recommended)

### Using VSCode Live Server - 3 Steps:

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start the backend server:**
   ```bash
   npm start
   ```
   (Keep this terminal running)

3. **Open with Live Server:**
   - Open `public/index.html` in VSCode
   - Right-click → "Open with Live Server"
   - Browser opens automatically at `http://127.0.0.1:5500`

**Note:** Make sure MongoDB is running first!
```bash
# Linux/Mac
sudo systemctl start mongod

# OR Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

✅ **That's it!** No npm install for frontend, no build process, just pure HTML/CSS/JS.

---

## 📁 Project Structure

```
ocr-test/
├── public/              ⭐ USE THIS with Live Server
│   ├── index.html      # Main HTML page
│   ├── styles.css      # Styling
│   └── app.js          # JavaScript logic
│
├── backend/            # Express API server
│   ├── server.js       # Main server file
│   ├── models/         # MongoDB schemas
│   └── uploads/        # Uploaded files stored here
│
└── frontend/           # React version (optional, advanced)
    └── ...
```

---

## 📚 Documentation

- **[LIVE_SERVER_SETUP.md](LIVE_SERVER_SETUP.md)** - Detailed Live Server guide with troubleshooting
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute quick start for both Live Server and React
- **[README.md](README.md)** - Complete documentation with API details

---

## 🎯 First Upload Test

1. Find an image with text (screenshot, photo of a document, etc.)
2. Click "Choose File" in the web interface
3. Select your image
4. Click "Upload & Process OCR"
5. Wait a few seconds
6. See the extracted text!

---

## ❓ Common Issues

### "Cannot connect to backend"
- Make sure backend is running: `cd backend && npm start`
- Backend should show: "Server running on port 5000"

### "MongoDB connection error"
- Start MongoDB: `sudo systemctl start mongod`
- Or use Docker: `docker run -d -p 27017:27017 mongo`

### OCR is slow
- First run downloads language files (~5MB)
- Subsequent runs are much faster

---

## 🎨 What It Does

1. **Upload** - Select an image file from your computer
2. **Process** - Server runs OCR using Tesseract.js
3. **Store** - Saves file metadata and extracted text to MongoDB
4. **Display** - Shows extracted text with confidence score
5. **Manage** - View all uploaded documents and delete them

---

## 🔧 Tech Stack

**Backend:**
- Express.js (Node.js web framework)
- MongoDB (Database)
- Tesseract.js (OCR library)
- Multer (File upload handling)

**Frontend (Simple Version):**
- HTML5
- CSS3
- Vanilla JavaScript
- No build tools needed!

---

## 🚦 System Requirements

- **Node.js** v14+ (for backend)
- **MongoDB** (local or Docker)
- **VSCode** with Live Server extension
- **Web Browser** (Chrome, Firefox, Safari, Edge)

---

## 💡 Tips

- Use clear, high-contrast images for best OCR results
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, GIF, BMP
- First OCR run downloads language data (one-time)

---

## 🎓 Learning Path

1. **Start Simple:** Use Live Server version (`public/` directory)
2. **Understand the Code:** Read through `public/app.js` - it's simple!
3. **Customize:** Modify `public/styles.css` to change the look
4. **Explore API:** Check `backend/server.js` for API endpoints
5. **Advanced:** Try the React version in `frontend/` directory

---

## 🤝 Need Help?

1. Check browser console (F12 → Console tab)
2. Check backend terminal for errors
3. Read [LIVE_SERVER_SETUP.md](LIVE_SERVER_SETUP.md) for detailed troubleshooting
4. Make sure MongoDB and backend are running

---

## 🎉 Features

- ✅ Simple drag-and-drop file upload
- ✅ Real-time OCR processing
- ✅ Confidence scores
- ✅ Document history
- ✅ Delete functionality
- ✅ Responsive design
- ✅ No build tools required
- ✅ Works offline (after first OCR run)

---

**Ready to go? Open `public/index.html` with Live Server and start uploading!** 🚀
