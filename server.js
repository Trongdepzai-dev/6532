const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// tạo uploads nếu chưa có
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer lưu file vào uploads với tên an toàn
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeExt = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.random().toString(36).slice(2,9) + safeExt;
    cb(null, name);
  }
});
const upload = multer({ storage });

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// Upload endpoint (accept single file named 'file')
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ 
      success: true, 
      url: '/uploads/' + req.file.filename, 
      filename: req.file.filename, 
      mimetype: req.file.mimetype 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// List uploaded files (returns array of { filename, url, mimetype, size, uploadedAt })
app.get('/files', (req, res) => {
  try {
    fs.readdir(uploadDir, (err, files) => {
      if (err) {
        console.error('Read directory error:', err);
        return res.json([]);
      }
      try {
        const out = files.map(f => {
          const st = fs.statSync(path.join(uploadDir, f));
          return { filename: f, url: '/uploads/' + f, size: st.size, uploadedAt: st.mtime };
        }).sort((a,b)=> b.uploadedAt - a.uploadedAt);
        res.json(out);
      } catch (statError) {
        console.error('File stat error:', statError);
        res.json([]);
      }
    });
  } catch (error) {
    console.error('Files listing error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Simple health
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`✅ VietHub running: http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});