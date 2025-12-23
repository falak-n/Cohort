const express = require('express');
const router = express.Router();
const Sample = require('../models/Sample');

// Get all samples with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, patient_id, specimen_type, disease_stage } = req.query;
    const query = {};

    if (patient_id) query.patient_id = parseInt(patient_id);
    if (specimen_type) query.specimen_type = specimen_type;
    if (disease_stage) query.disease_stage_at_specimen_collection = disease_stage;

    const samples = await Sample.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ timepoint: 1 });

    const total = await Sample.countDocuments(query);

    res.json({
      samples,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sample by ID
router.get('/:id', async (req, res) => {
  try {
    const sample = await Sample.findOne({ sample_id: req.params.id });
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    res.json(sample);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get samples by patient ID
router.get('/patient/:patient_id', async (req, res) => {
  try {
    const samples = await Sample.find({ patient_id: parseInt(req.params.patient_id) })
      .sort({ timepoint: 1 });
    res.json(samples);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create sample
router.post('/', async (req, res) => {
  try {
    const sample = new Sample(req.body);
    await sample.save();
    res.status(201).json(sample);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update sample
router.put('/:id', async (req, res) => {
  try {
    const sample = await Sample.findOneAndUpdate(
      { sample_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    res.json(sample);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete sample
router.delete('/:id', async (req, res) => {
  try {
    const sample = await Sample.findOneAndDelete({ sample_id: req.params.id });
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    res.json({ message: 'Sample deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Sample.countDocuments();
    const bySpecimenType = await Sample.aggregate([
      { $group: { _id: '$specimen_type', count: { $sum: 1 } } }
    ]);
    const byDiseaseStage = await Sample.aggregate([
      { $group: { _id: '$disease_stage_at_specimen_collection', count: { $sum: 1 } } }
    ]);
    const relapseCount = await Sample.countDocuments({ is_replapse: 'TRUE' });

    res.json({
      total,
      bySpecimenType,
      byDiseaseStage,
      relapseCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


