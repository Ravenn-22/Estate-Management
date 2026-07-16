const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createAnnouncement, getAnnouncements } = require('../controllers/announcementController');

router.post('/', protect, authorize('MANAGER'), createAnnouncement);
router.get('/', protect, getAnnouncements);

module.exports = router;