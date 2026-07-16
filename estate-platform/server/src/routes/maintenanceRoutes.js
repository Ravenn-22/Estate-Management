const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createRequest,
  getAllRequests,
  getMyRequests,
  updateRequestStatus,
} = require('../controllers/maintenanceController');

router.post('/', protect, authorize('TENANT'), upload.array('photos', 5), createRequest);
router.get('/', protect, authorize('MANAGER'), getAllRequests);
router.get('/my-requests', protect, authorize('TENANT'), getMyRequests);
router.patch('/:id/status', protect, authorize('MANAGER'), updateRequestStatus);

module.exports = router;