const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route  POST /api/auth/register
// @desc   Self-registration always creates a 'student'. An authenticated admin
//         may create any role (admin/faculty/student) by passing role in the body.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, rollNo, department, semester, employeeId, phone } = req.body;
    let role = 'student';

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        const requester = await User.findById(decoded.id);
        if (requester && requester.role === 'admin' && req.body.role) {
          role = req.body.role;
        }
      } catch (_) {
        // invalid/absent token -> falls back to public self-registration as student
      }
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email is already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role,
      rollNo,
      department,
      semester,
      employeeId,
      phone,
    });

    res.status(201).json({
      user: user.toSafeObject(),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }
    res.json({
      user: user.toSafeObject(),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user.toSafeObject());
});

// @route  PUT /api/auth/change-password
// @desc   Logged-in user changes their own password.
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  POST /api/auth/forgot-password
// @desc   Emails a time-limited reset link. Always returns 200 to avoid leaking
//         which emails are registered.
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const rawToken = user.generatePasswordResetToken();
      await user.save({ validateBeforeSave: false });

      const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${rawToken}`;
      try {
        await sendEmail({
          to: user.email,
          subject: 'CampusConnect password reset',
          html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
        });
      } catch (mailErr) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return res.status(500).json({ message: 'Could not send reset email, please try again later' });
      }
    }
    res.json({ message: 'If that email is registered, a reset link has been sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/auth/reset-password/:token
router.put('/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset, you can now log in' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
