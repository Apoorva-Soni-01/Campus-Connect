const express = require('express');
const Notice = require('../models/Notice');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route  GET /api/notices
// @desc   Everyone sees notices targeted at 'all' or at their own role.
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find({
      targetRole: { $in: ['all', req.user.role] },
    })
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/notices
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const notice = await Notice.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(notice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  PUT /api/notices/:id/read
// @desc   Marks a notice as read by the logged-in user.
router.put('/:id/read', async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user.id } },
      { new: true }
    );
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  DELETE /api/notices/:id
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
