const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createInvoice, getInvoices, getMyInvoices } = require('../controllers/invoiceController');

router.post('/', protect, authorize('MANAGER'), createInvoice);
router.get('/', protect, authorize('MANAGER'), getInvoices);
router.get('/my-invoices', protect, authorize('TENANT'), getMyInvoices);

module.exports = router;