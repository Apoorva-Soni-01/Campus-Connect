const express = require('express');
const TimetableSlot = require('../models/TimetableSlot');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route  GET /api/timetable?department=&semester=&faculty=
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.faculty) filter.faculty = req.query.faculty;

    // A student with no explicit query defaults to their own department + semester
    if (req.user.role === 'student' && !req.query.department) {
      filter.department = req.user.department;
      filter.semester = req.user.semester;
    }
    // Faculty with no explicit query default to their own assigned slots
    if (req.user.role === 'faculty' && !req.query.faculty && !req.query.department) {
      filter.faculty = req.user.id;
    }

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const slots = await TimetableSlot.find(filter)
      .populate('course', 'code name')
      .populate('faculty', 'name')
      .populate('department', 'name code');

    slots.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) || a.startTime.localeCompare(b.startTime));
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/timetable
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const slot = await TimetableSlot.create(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  PUT /api/timetable/:id
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const slot = await TimetableSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!slot) return res.status(404).json({ message: 'Timetable slot not found' });
    res.json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  DELETE /api/timetable/:id
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const slot = await TimetableSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Timetable slot not found' });
    res.json({ message: 'Timetable slot deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
