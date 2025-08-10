const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

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
  if (!req.file) return res.status(400).json({ error: 'No file' });
  res.json({ success: true, url: '/uploads/' + req.file.filename, filename: req.file.filename, mimetype: req.file.mimetype });
});

// List uploaded files (returns array of { filename, url, mimetype, size, uploadedAt })
app.get('/files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.json([]);
    const out = files.map(f => {
      const st = fs.statSync(path.join(uploadDir, f));
      return { filename: f, url: '/uploads/' + f, size: st.size, uploadedAt: st.mtime };
    }).sort((a,b)=> b.uploadedAt - a.uploadedAt);
    res.json(out);
  });
});

// Simple health
app.get('/ping', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`✅ VietHub running: http://localhost:${PORT}`);
});