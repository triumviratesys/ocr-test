# File Upload "Failed to Fetch" Troubleshooting Guide

## The Problem
"Failed to fetch" means the browser cannot connect to the backend server at `http://localhost:5000/api/upload`

This is **NOT a code bug** - it's a connectivity/setup issue.

---

## Step-by-Step Diagnosis

### Step 1: Check if Backend Server is Running

Open a terminal and run:

```bash
cd /home/user/ocr-test/backend
npm start
```

**Expected output:**
```
Server running on port 5000
Connected to MongoDB
```

**If you see an error:**
- `EADDRINUSE`: Port 5000 is already taken (something else is using it)
- `MongoDB connection error`: MongoDB isn't running
- `Cannot find module`: Run `npm install` first

---

### Step 2: Verify Server is Accessible

While the server is running, open a **NEW terminal** and test:

```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{"status":"ok"}
```

**If this fails:**
- Your backend server is NOT running properly
- Go back to Step 1

---

### Step 3: Check MongoDB is Running

```bash
# Check if MongoDB process is running
ps aux | grep mongod

# Or try connecting directly
mongosh --eval "db.version()"
```

**If MongoDB is not running:**

Start it based on your installation method:
```bash
# Option 1: System service
sudo systemctl start mongod

# Option 2: Homebrew (Mac)
brew services start mongodb-community

# Option 3: Manual start
mongod --dbpath ~/data/db
```

---

### Step 4: Check Environment Variables

Verify your `.env` file exists and has the correct MongoDB URI:

```bash
cat /home/user/ocr-test/backend/.env
```

**Must contain:**
```
MONGODB_URI=mongodb://localhost:27017/ocr-database
PORT=5000
```

---

### Step 5: Check VSCode Live Server Port

VSCode Live Server typically runs on port **5500** or **5501**.

**Check your browser URL bar:**
- If it shows `http://127.0.0.1:5500` or `http://localhost:5500` - **GOOD**
- This is your **frontend** (Live Server)
- It should make requests to `http://localhost:5000` (backend)

**Open DevTools Console and verify:**
```javascript
// Type this in the browser console:
console.log(API_URL)
```

**Should output:** `http://localhost:5000/api`

---

### Step 6: Test Upload with curl

If the backend is running, test the upload endpoint directly:

```bash
cd /home/user/ocr-test
curl -X POST http://localhost:5000/api/upload \
  -F "file=@/path/to/test-image.jpg"
```

Replace `/path/to/test-image.jpg` with an actual image path.

**Expected:** JSON response with OCR results
**If this works:** The backend is fine, the issue is in the frontend connection

---

## Common Issues & Solutions

### Issue 1: Backend Not Running
**Symptom:** `curl http://localhost:5000/api/health` fails
**Solution:** Start the backend server with `npm start` in the `backend/` directory

### Issue 2: MongoDB Not Running
**Symptom:** Server starts but shows "MongoDB connection error"
**Solution:** Start MongoDB (see Step 3)

### Issue 3: Missing Dependencies
**Symptom:** Server won't start, shows module errors
**Solution:**
```bash
cd /home/user/ocr-test/backend
npm install
```

### Issue 4: Port Conflict
**Symptom:** "EADDRINUSE: Port 5000 is already in use"
**Solution:**
```bash
# Find what's using port 5000
lsof -i :5000
# Kill the process (replace PID with actual process ID)
kill -9 PID
# Or change the port in .env
PORT=5001
```

### Issue 5: CORS Error (Different from "failed to fetch")
**Symptom:** Console shows "CORS policy" error
**Solution:** Already handled - backend has `app.use(cors())`

### Issue 6: Wrong Frontend File
**Symptom:** Seeing the React app instead of the Live Server version
**Solution:**
- Make sure you're opening `http://localhost:5500/public/index.html`
- NOT the React dev server (port 3000)

---

## Data Loss Issue

About your MongoDB data vanishing - this can happen if:

1. **Different Database:** You're connecting to a different database name
   - Check: `mongodb://localhost:27017/ocr-database` (database name is `ocr-database`)
   - If you changed it, old data is in the previous database

2. **MongoDB Restarted Without Persistence:**
   - Check data directory exists: `ls ~/data/db` or `/data/db`
   - MongoDB needs write permissions to this directory

3. **Using In-Memory Database:**
   - If MongoDB is running without a data directory, it's in-memory only
   - Data is lost on restart

**To check if your data still exists:**
```bash
mongosh ocr-database --eval "db.documents.find().pretty()"
```

**To check all databases:**
```bash
mongosh --eval "show dbs"
```

---

## Quick Start Checklist

Run these commands in order:

```bash
# 1. Start MongoDB
sudo systemctl start mongod
# OR
mongod --dbpath ~/data/db

# 2. Open a new terminal, start backend
cd /home/user/ocr-test/backend
npm install  # Only needed once
npm start

# 3. Open another terminal, verify it's running
curl http://localhost:5000/api/health

# 4. Open Live Server in VSCode
# Right-click public/index.html → "Open with Live Server"

# 5. Try uploading a file
```

---

## Still Not Working?

Run this diagnostic script and share the output:

```bash
echo "=== PORT CHECK ==="
lsof -i :5000 2>/dev/null || echo "Port 5000: Nothing running"
lsof -i :5500 2>/dev/null || echo "Port 5500: Nothing running"

echo -e "\n=== MONGODB CHECK ==="
ps aux | grep mongod | grep -v grep || echo "MongoDB: Not running"

echo -e "\n=== BACKEND HEALTH CHECK ==="
curl -s http://localhost:5000/api/health || echo "Backend: Not responding"

echo -e "\n=== DATABASE CHECK ==="
mongosh ocr-database --quiet --eval "db.documents.countDocuments()" 2>/dev/null || echo "MongoDB: Cannot connect"

echo -e "\n=== ENV FILE ==="
cat /home/user/ocr-test/backend/.env | grep -v "KEY\|SECRET" || echo ".env file not found"
```
