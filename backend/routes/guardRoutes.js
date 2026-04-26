const express = require('express');
const router = express.Router();
const { verifyAndScan } = require('../controllers/guardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/scan', protect, authorize('guard', 'admin'), verifyAndScan);

module.exports = router;
