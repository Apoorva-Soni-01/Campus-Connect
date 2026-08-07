const mongoose = require('mongoose');

const timetableSlotSchema = new mongoose.Schema(
  {
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    semester: { type: Number, required: true },
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: { type: String, required: true }, // "10:00"
    endTime: { type: String, required: true }, // "11:00"
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TimetableSlot', timetableSlotSchema);
