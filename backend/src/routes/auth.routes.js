const express = require('express');
const { register, login, getMe, updateMe, verifyEmail, resendVerification } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;
