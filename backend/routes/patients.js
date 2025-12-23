const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Get all patients with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, gender, cohort, search } = req.query;
    const query = {};

    if (gender) query.gender = gender;
    if (cohort) query.cohort = cohort;
    if (search) {
      query.$or = [
        { patient_id: isNaN(search) ? null : parseInt(search) },
        { gender: new RegExp(search, 'i') },
        { cohort: new RegExp(search, 'i') }
      ].filter(q => q.patient_id !== null || Object.keys(q).length > 1);
    }

    const patients = await Patient.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ patient_id: 1 });

    const total = await Patient.countDocuments(query);

    res.json({
      patients,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOne({ patient_id: parseInt(req.params.id) });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create patient
router.post('/', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { patient_id: parseInt(req.params.id) },
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ patient_id: parseInt(req.params.id) });
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Patient.countDocuments();
    const byGender = await Patient.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    const byCohort = await Patient.aggregate([
      { $group: { _id: '$cohort', count: { $sum: 1 } } }
    ]);
    const avgAge = await Patient.aggregate([
      { $match: { age_at_diagnosis: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgAge: { $avg: '$age_at_diagnosis' } } }
    ]);

    res.json({
      total,
      byGender,
      byCohort,
      avgAge: avgAge[0]?.avgAge || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


