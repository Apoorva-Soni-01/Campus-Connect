const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    examType: { type: String, enum: ['midsem', 'endsem', 'practical'], required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    totalMarks: { type: Number, required: true, min: 1 },
    semester: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// One mark entry per student, per course, per exam type
marksSchema.index({ student: 1, course: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
