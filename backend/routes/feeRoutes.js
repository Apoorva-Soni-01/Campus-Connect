const express = require('express');
const Fee = require('../models/Fee');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route  GET /api/fees?student=  (admin/faculty can filter; students only see their own)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      filter.student = req.user.id;
    } else if (req.query.student) {
      filter.student = req.query.student;
    }
    if (req.query.status) filter.status = req.query.status;

    const fees = await Fee.find(filter).populate('student', 'name rollNo').sort({ dueDate: 1 });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route  POST /api/fees
// @desc   Admin creates a fee record for a student.
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.create(req.body);
    res.status(201).json(fee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  PUT /api/fees/:id/pay
// @desc   Marks a fee as paid. Students may pay their own; admin may mark any as paid.
router.put('/:id/pay', async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    if (req.user.role === 'student' && fee.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You may only pay your own fees' });
    }
    fee.status = 'paid';
    fee.paidDate = new Date();
    fee.receiptNo = `RCPT-${Date.now()}`;
    await fee.save();
    res.json(fee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  PUT /api/fees/:id
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json(fee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route  DELETE /api/fees/:id
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee record not found' });
    res.json({ message: 'Fee record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
