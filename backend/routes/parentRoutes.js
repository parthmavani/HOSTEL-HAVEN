const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getParentOverview, getChildLeaves, getParentAnnouncements } = require('../controllers/parentController');

router.get('/overview', protect, authorize('parent'), getParentOverview);
router.get('/leaves', protect, authorize('parent'), getChildLeaves);
router.get('/announcements', protect, authorize('parent'), getParentAnnouncements);

module.exports = router;
