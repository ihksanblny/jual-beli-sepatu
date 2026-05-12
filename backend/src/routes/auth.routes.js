const express = require('express');
const { register, login, getMe, updateMe, verifyEmail, resendVerification, updatePassword, deleteMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { authValidators } = require('../utils/validators');

const router = express.Router();

router.post('/register', validate(authValidators.register), register);
router.post('/login', validate(authValidators.login), login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/update-password', protect, updatePassword);
router.delete('/delete-me', protect, deleteMe);

module.exports = router;
