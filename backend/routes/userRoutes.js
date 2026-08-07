const express = require('express');
const streamifier = require('streamifier');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

const router = express.Router();
router.use(protect);

// @route  PUT /api/users/:id/photo
// @desc   Uploads a profile picture to Cloudinary. Admin can update anyone; others only themselves.
router.put('/:id/photo', upload.single('photo'), async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this profile picture' });
    }
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'campusconnect/profile-pictures', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: uploadResult.secure_url },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/users?role=student&department=&semester=&search=&page=1&limit=10
// @desc   List users with search, filter, and pagination. Admin & faculty only.
router.get('/', authorize('admin', 'faculty'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.enrolledIn) filter.enrolledCourses = req.query.enrolledIn;
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { rollNo: regex }, { employeeId: regex }];
    }

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/users
// @desc   Admin creates a user of any role directly.
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user.toSafeObject());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Students may only view their own profile' });
    }
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('enrolledCourses', 'code name')
      .populate('department', 'name code');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/users/:id
// @desc   Admin can edit anyone; a user can edit limited fields on their own profile.
router.put('/:id', async (req, res) => {
  try {
    const isSelf = req.user.id === req.params.id;
    if (!isSelf && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this user' });
    }

    const allowedFields = isSelf && req.user.role !== 'admin'
      ? ['name', 'phone']
      : ['name', 'phone', 'department', 'semester', 'rollNo', 'employeeId', 'isActive', 'role'];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  DELETE /api/users/:id
// @desc   Admin only - deactivates the account (soft delete).
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
