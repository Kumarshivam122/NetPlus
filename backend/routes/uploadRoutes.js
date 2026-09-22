const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure product-images subdirectory exists
const productImagesDir = path.join(__dirname, '..', 'uploads', 'product-images');
if (!fs.existsSync(productImagesDir)) {
  fs.mkdirSync(productImagesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const productImageStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'product-images'));
  },
  filename(req, file, cb) {
    cb(null, `product_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images and PDFs only!');
  }
}

function checkImageType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only (JPG, PNG, WebP)!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

const productImageUpload = multer({
  storage: productImageStorage,
  limits: { fileSize: 20 * 1024 }, // 20KB limit
  fileFilter: function (req, file, cb) {
    checkImageType(file, cb);
  },
});

// General file upload (documents, prescriptions, etc.)
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Build full URL dynamically based on request origin
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({ url: `${baseUrl}/uploads/${req.file.filename}` });
});

// Product image upload
router.post('/product-image', productImageUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({ url: `${baseUrl}/uploads/product-images/${req.file.filename}` });
});

module.exports = router;
