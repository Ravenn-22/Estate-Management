const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { recordPayment, getPaymentsForInvoice } = require('../controllers/paymentController');

router.post('/', protect, authorize('MANAGER'), recordPayment);
router.get('/invoice/:invoiceId', protect, getPaymentsForInvoice);

module.exports = router;