const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Notice = require('../models/Notice');
const TimetableSlot = require('../models/TimetableSlot');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

const todayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' });

// @route  GET /api/dashboard/admin
router.get('/admin', authorize('admin'), async (req, res) => {
  try {
    const [totalStudents, totalFaculty, totalDepartments, totalCourses] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'faculty', isActive: true }),
      Department.countDocuments(),
      Course.countDocuments(),
    ]);

    // Attendance trend - overall present % for each of the last 14 days that has data
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const attendanceTrend = await Attendance.aggregate([
      { $match: { date: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
        },
      },
      { $project: { date: '$_id', _id: 0, percentage: { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] } } },
      { $sort: { date: 1 } },
    ]);

    // Department-wise student counts
    const departmentWiseAgg = await User.aggregate([
      { $match: { role: 'student', isActive: true, department: { $ne: null } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);
    const departments = await Department.find({ _id: { $in: departmentWiseAgg.map((d) => d._id) } });
    const departmentWise = departmentWiseAgg.map((d) => ({
      department: departments.find((dep) => dep._id.equals(d._id))?.name || 'Unknown',
      count: d.count,
    }));

    // Gender ratio among students
    const genderAgg = await User.aggregate([
      { $match: { role: 'student', isActive: true } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
    ]);
    const genderRatio = genderAgg.map((g) => ({ gender: g._id || 'unspecified', count: g.count }));

    // Placement statistics - mock data, no real placement module exists yet
    const placementStats = [
      { year: 2022, placedPercentage: 78 },
      { year: 2023, placedPercentage: 82 },
      { year: 2024, placedPercentage: 85 },
      { year: 2025, placedPercentage: 88 },
    ];

    res.json({
      cards: { totalStudents, totalFaculty, totalDepartments, totalCourses },
      attendanceTrend,
      departmentWise,
      genderRatio,
      placementStats,
      placementStatsIsMockData: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/dashboard/faculty
router.get('/faculty', authorize('faculty'), async (req, res) => {
  try {
    const today = todayName();
    const [todaysLectures, assignedCourses] = await Promise.all([
      TimetableSlot.find({ faculty: req.user.id, day: today })
        .populate('course', 'code name')
        .sort({ startTime: 1 }),
      Course.find({ instructor: req.user.id }),
    ]);

    const courseIds = assignedCourses.map((c) => c._id);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const markedTodayCourseIds = (
      await Attendance.find({ course: { $in: courseIds }, date: { $gte: todayDate }, markedBy: req.user.id }).distinct('course')
    ).map((id) => id.toString());

    const attendancePending = assignedCourses.filter((c) => !markedTodayCourseIds.includes(c._id.toString()));

    res.json({
      todaysLectures,
      assignedCoursesCount: assignedCourses.length,
      attendancePending: attendancePending.map((c) => ({ _id: c._id, code: c.code, name: c.name })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  GET /api/dashboard/student
router.get('/student', authorize('student'), async (req, res) => {
  try {
    const student = await User.findById(req.user.id);

    const [attendanceRecords, marks, todaysClasses, notices] = await Promise.all([
      Attendance.find({ student: student._id }),
      Marks.find({ student: student._id }),
      TimetableSlot.find({ department: student.department, semester: student.semester, day: todayName() })
        .populate('course', 'code name')
        .populate('faculty', 'name')
        .sort({ startTime: 1 }),
      Notice.find({ targetRole: { $in: ['all', 'student'] } }).sort({ createdAt: -1 }).limit(5),
    ]);

    const totalClasses = attendanceRecords.length;
    const presentClasses = attendanceRecords.filter((a) => a.status === 'present').length;
    const attendancePercentage = totalClasses ? Math.round((presentClasses / totalClasses) * 1000) / 10 : 0;

    const totalObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMax = marks.reduce((sum, m) => sum + m.totalMarks, 0);
    const percentage = totalMax ? (totalObtained / totalMax) * 100 : 0;
    const cgpa = Math.min(10, Math.round((percentage / 9.5) * 100) / 100);

    res.json({
      attendancePercentage,
      cgpa,
      todaysClasses,
      notices,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
