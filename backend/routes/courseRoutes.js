const express = require('express');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();
router.use(protect);

// @route  GET /api/courses
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.department) filter.department = req.query.department;
    if (req.query.semester) filter.semester = req.query.semester;
    if (req.query.instructor) filter.instructor = req.query.instructor;
    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .populate('department', 'name code')
      .sort({ code: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/courses
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  GET /api/courses/:id
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('department', 'name code');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  PUT /api/courses/:id
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  DELETE /api/courses/:id
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/courses/:id/enroll
// @desc   The logged-in student enrolls themselves in a course.
router.post('/:id/enroll', authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const student = await User.findById(req.user.id);
    if (student.enrolledCourses.includes(course.id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    student.enrolledCourses.push(course.id);
    await student.save();
    res.json({ message: `Enrolled in ${course.code}`, enrolledCourses: student.enrolledCourses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
