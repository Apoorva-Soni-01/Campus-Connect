const express = require('express');
const Marks = require('../models/Marks');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route  GET /api/marks?student=&course=
// @desc   Students see only their own; faculty/admin can filter by student or course.
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      filter.student = req.user.id;
    } else {
      if (req.query.student) filter.student = req.query.student;
      if (req.query.course) filter.course = req.query.course;
    }

    const marks = await Marks.find(filter)
      .populate('student', 'name rollNo')
      .populate('course', 'code name')
      .sort({ createdAt: -1 });
    res.json(marks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/marks
// @desc   Faculty uploads a mark entry (mid sem / end sem / practical) for a student.
//         Upserts, so re-submitting the same student+course+examType updates it.
router.post('/', authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { student, course, examType, marksObtained, totalMarks, semester } = req.body;
    const mark = await Marks.findOneAndUpdate(
      { student, course, examType },
      { marksObtained, totalMarks, semester, uploadedBy: req.user.id },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(mark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  POST /api/marks/bulk
// @desc   Faculty uploads marks for a whole class at once for one course + examType.
//         body: { course, examType, semester, records: [{ student, marksObtained, totalMarks }] }
router.post('/bulk', authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { course, examType, semester, records } = req.body;
    if (!course || !examType || !Array.isArray(records)) {
      return res.status(400).json({ message: 'course, examType, and records[] are required' });
    }
    const ops = records.map((r) => ({
      updateOne: {
        filter: { student: r.student, course, examType },
        update: {
          $set: {
            marksObtained: r.marksObtained,
            totalMarks: r.totalMarks,
            semester,
            uploadedBy: req.user.id,
          },
        },
        upsert: true,
      },
    }));
    await Marks.bulkWrite(ops);
    res.status(201).json({ message: `Marks saved for ${records.length} student(s)` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  DELETE /api/marks/:id
router.delete('/:id', authorize('admin', 'faculty'), async (req, res) => {
  try {
    const mark = await Marks.findByIdAndDelete(req.params.id);
    if (!mark) return res.status(404).json({ message: 'Mark entry not found' });
    res.json({ message: 'Mark entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
