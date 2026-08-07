const express = require('express');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route  POST /api/attendance
// @desc   Faculty marks attendance for a whole class on a given date.
//         body: { course, date, records: [{ student, status }] }
router.post('/', authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { course, date, records } = req.body;
    if (!course || !date || !Array.isArray(records)) {
      return res.status(400).json({ message: 'course, date, and records[] are required' });
    }

    const ops = records.map((r) => ({
      updateOne: {
        filter: { student: r.student, course, date },
        update: { $set: { status: r.status, markedBy: req.user.id } },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    res.status(201).json({ message: `Attendance saved for ${records.length} student(s)` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  GET /api/attendance?course=&date=
router.get('/', authorize('admin', 'faculty'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.course) filter.course = req.query.course;
    if (req.query.date) filter.date = new Date(req.query.date);
    const records = await Attendance.find(filter).populate('student', 'name rollNo');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/attendance/student/:studentId
// @desc   Attendance history + per-course percentage for one student.
router.get('/student/:studentId', async (req, res) => {
  try {
    if (req.user.role === 'student' && req.user.id !== req.params.studentId) {
      return res.status(403).json({ message: 'Students may only view their own attendance' });
    }
    const records = await Attendance.find({ student: req.params.studentId }).populate('course', 'code name');

    const byCourse = {};
    records.forEach((r) => {
      const key = r.course._id.toString();
      if (!byCourse[key]) byCourse[key] = { course: r.course, present: 0, total: 0 };
      byCourse[key].total += 1;
      if (r.status === 'present') byCourse[key].present += 1;
    });
    const summary = Object.values(byCourse).map((c) => ({
      course: c.course,
      present: c.present,
      total: c.total,
      percentage: c.total ? Math.round((c.present / c.total) * 1000) / 10 : 0,
    }));

    res.json({ records, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
