const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadDocument, getAllDocuments, getMyDocuments } = require('../controllers/documentController');

router.post('/', protect, authorize('MANAGER'), upload.single('file'), uploadDocument);
router.get('/', protect, authorize('MANAGER'), getAllDocuments);
router.get('/my-documents', protect, authorize('TENANT'), getMyDocuments);

module.exports = router;