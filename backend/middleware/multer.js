// backend/middleware/multer.js
const multer = require('multer');
const path = require('path');

// Memory storage (buffer mein save hoga)
const storage = multer.memoryStorage();

// File filter - strictly checks both mimetype and file extension
const fileFilter = (req, file, cb) => {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only valid image files (jpeg, jpg, png, gif, webp) are allowed!'), false);
  }
};

// Multer upload config
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;