const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createUnit,
  getUnits,
  getUnitById,
  updateUnitStatus,
} = require('../controllers/unitController');

router.post('/', protect, authorize('MANAGER'), createUnit);
router.get('/', protect, getUnits);
router.get('/:id', protect, getUnitById);
router.patch('/:id/status', protect, authorize('MANAGER'), updateUnitStatus);

module.exports = router;