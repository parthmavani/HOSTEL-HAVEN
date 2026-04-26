const express = require('express');
const router = express.Router();
const { getAllStudents, getUserById, updateProfilePhoto } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');

router.get('/students', protect, authorize('warden', 'admin', 'counsellor'), getAllStudents);
router.put('/profile-photo', protect, uploadProfile.single('photo'), updateProfilePhoto);
router.get('/:id', protect, getUserById);

module.exports = router;
