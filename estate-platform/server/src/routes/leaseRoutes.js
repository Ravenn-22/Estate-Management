const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createLease,
  getLeases,
  getMyLease,
  endLease,
} = require('../controllers/leaseController');

router.post('/', protect, authorize('MANAGER'), createLease);
router.get('/', protect, authorize('MANAGER'), getLeases);
router.get('/my-lease', protect, authorize('TENANT'), getMyLease);
router.patch('/:id/end', protect, authorize('MANAGER'), endLease);

module.exports = router;