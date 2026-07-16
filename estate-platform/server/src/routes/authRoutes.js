const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { signup, login, getTenants } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/tenants', protect, authorize('MANAGER'), getTenants);

module.exports = router;