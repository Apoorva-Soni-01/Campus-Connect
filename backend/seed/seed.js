// Populates the database with a working demo dataset: departments, an admin,
// a couple of faculty, a handful of students, courses, a timetable, and a notice.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Notice = require('../models/Notice');
const TimetableSlot = require('../models/TimetableSlot');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Fee = require('../models/Fee');

const run = async () => {
  await connectDB();
  console.log('Clearing existing demo collections...');
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Course.deleteMany({}),
    Notice.deleteMany({}),
    TimetableSlot.deleteMany({}),
    Attendance.deleteMany({}),
    Marks.deleteMany({}),
    Fee.deleteMany({}),
  ]);

  console.log('Creating departments...');
  const [cse, ece, mech] = await Department.create([
    { name: 'Computer Science and Engineering', code: 'CSE' },
    { name: 'Electronics and Communication Engineering', code: 'ECE' },
    { name: 'Mechanical Engineering', code: 'MECH' },
  ]);

  console.log('Creating admin...');
  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@campusconnect.edu',
    password: 'Admin@123',
    role: 'admin',
  });

  console.log('Creating faculty...');
  const faculty1 = await User.create({
    name: 'Dr. Ritu Sharma',
    email: 'ritu.sharma@campusconnect.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: cse._id,
    employeeId: 'FAC-CSE-001',
  });
  const faculty2 = await User.create({
    name: 'Dr. Ankit Verma',
    email: 'ankit.verma@campusconnect.edu',
    password: 'Faculty@123',
    role: 'faculty',
    department: ece._id,
    employeeId: 'FAC-ECE-001',
  });

  console.log('Creating courses...');
  const dsa = await Course.create({
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    department: cse._id,
    credits: 4,
    semester: 3,
    schedule: 'Mon/Wed/Fri',
    instructor: faculty1._id,
  });
  const dbms = await Course.create({
    code: 'CS301',
    name: 'Database Management Systems',
    department: cse._id,
    credits: 3,
    semester: 5,
    schedule: 'Tue/Thu',
    instructor: faculty1._id,
  });
  const signals = await Course.create({
    code: 'EC201',
    name: 'Signals and Systems',
    department: ece._id,
    credits: 3,
    semester: 3,
    schedule: 'Mon/Wed',
    instructor: faculty2._id,
  });

  console.log('Creating students...');
  const studentDefs = [
    { name: 'Aarav Mehta', rollNo: 'CSE23001', gender: 'male', semester: 3, department: cse._id },
    { name: 'Diya Kapoor', rollNo: 'CSE23002', gender: 'female', semester: 3, department: cse._id },
    { name: 'Kabir Singh', rollNo: 'CSE23003', gender: 'male', semester: 5, department: cse._id },
    { name: 'Ishita Rao', rollNo: 'ECE23001', gender: 'female', semester: 3, department: ece._id },
    { name: 'Vivaan Joshi', rollNo: 'MECH23001', gender: 'male', semester: 3, department: mech._id },
  ];
  const students = await User.create(
    studentDefs.map((s) => ({
      ...s,
      email: `${s.rollNo.toLowerCase()}@campusconnect.edu`,
      password: 'Student@123',
      role: 'student',
      enrolledCourses: s.department.equals(cse._id) ? [dsa._id, dbms._id] : [signals._id],
    }))
  );

  console.log('Creating timetable...');
  await TimetableSlot.create([
    { department: cse._id, semester: 3, day: 'Monday', startTime: '10:00', endTime: '11:00', course: dsa._id, faculty: faculty1._id, room: 'CS-101' },
    { department: cse._id, semester: 3, day: 'Wednesday', startTime: '10:00', endTime: '11:00', course: dsa._id, faculty: faculty1._id, room: 'CS-101' },
    { department: ece._id, semester: 3, day: 'Monday', startTime: '11:00', endTime: '12:00', course: signals._id, faculty: faculty2._id, room: 'EC-201' },
  ]);

  console.log('Creating a welcome notice...');
  await Notice.create({
    title: 'Welcome to CampusConnect',
    message: 'The new semester portal is now live. Reach out to the admin office for any login issues.',
    targetRole: 'all',
    createdBy: admin._id,
  });

  console.log('Creating attendance history (last 15 weekdays, per enrolled course)...');
  const attendanceOps = [];
  const today = new Date();
  for (const student of students) {
    for (const courseId of student.enrolledCourses) {
      const course = [dsa, dbms, signals].find((c) => c._id.equals(courseId));
      let daysAdded = 0;
      let cursor = new Date(today);
      while (daysAdded < 15) {
        cursor.setDate(cursor.getDate() - 1);
        const day = cursor.getDay();
        if (day === 0 || day === 6) continue; // skip weekends
        daysAdded += 1;
        const isPresent = Math.random() < 0.85; // ~85% attendance
        attendanceOps.push({
          student: student._id,
          course: course._id,
          date: new Date(cursor),
          status: isPresent ? 'present' : 'absent',
          markedBy: course.instructor,
        });
      }
    }
  }
  await Attendance.insertMany(attendanceOps);

  console.log('Creating marks (mid sem + end sem per enrolled course)...');
  const marksOps = [];
  for (const student of students) {
    for (const courseId of student.enrolledCourses) {
      const course = [dsa, dbms, signals].find((c) => c._id.equals(courseId));
      marksOps.push(
        { student: student._id, course: course._id, examType: 'midsem', marksObtained: 20 + Math.floor(Math.random() * 10), totalMarks: 30, semester: student.semester, uploadedBy: course.instructor },
        { student: student._id, course: course._id, examType: 'endsem', marksObtained: 45 + Math.floor(Math.random() * 20), totalMarks: 70, semester: student.semester, uploadedBy: course.instructor }
      );
    }
  }
  await Marks.insertMany(marksOps);

  console.log('Creating fee records...');
  const feeOps = students.map((student, i) => ({
    student: student._id,
    semester: student.semester,
    amount: 45000,
    dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    status: i % 3 === 0 ? 'unpaid' : 'paid',
    paidDate: i % 3 === 0 ? undefined : new Date(),
    receiptNo: i % 3 === 0 ? undefined : `RCPT-SEED-${1000 + i}`,
  }));
  await Fee.insertMany(feeOps);

  console.log('\nSeed complete. Demo logins (password shown is for that role):');
  console.log('  Admin:   admin@campusconnect.edu / Admin@123');
  console.log('  Faculty: ritu.sharma@campusconnect.edu / Faculty@123');
  console.log('  Student: cse23001@campusconnect.edu / Student@123');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
