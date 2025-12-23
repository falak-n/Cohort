const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Patient = require('../models/Patient');
const Sample = require('../models/Sample');

const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

router.post('/patients', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let successCount = 0;
        let errorCount = 0;

        for (const row of results) {
          try {
            const patientData = {
              patient_id: parseInt(row.patient_id),
              centre_id: row.centre_id ? parseInt(row.centre_id) : null,
              cohort: row.cohort || null,
              gender: row.gender || null,
              self_reported_race: row.self_reported_race || null,
              self_reported_ethnicity: row.self_reported_ethnicity || null,
              age_at_diagnosis: row.age_at_diagnosis ? parseFloat(row.age_at_diagnosis) : null,
              prior_malignancy: row.prior_malignancy || null,
              publication: row.publication || null
            };

            await Patient.findOneAndUpdate(
              { patient_id: patientData.patient_id },
              patientData,
              { upsert: true, new: true }
            );
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({ row: row.patient_id, error: error.message });
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          message: 'Upload completed',
          successCount,
          errorCount,
          errors: errors.slice(0, 10) // Return first 10 errors
        });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/samples', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const errors = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let successCount = 0;
        let errorCount = 0;

        for (const row of results) {
          try {
            const sampleData = {
              sample_id: row.sample_id,
              patient_id: parseInt(row.patient_id),
              timepoint: row.timepoint ? parseInt(row.timepoint) : null,
              is_replapse: row.is_replapse || null,
              is_denovo: row.is_denovo || null,
              is_transformed: row.is_transformed || null,
              specific_dx_at_acquisition_mdsmpn: row.specific_dx_at_acquisition_mdsmpn || null,
              non_aml_mdsmpn_specific_dx_at_acquisition: row.non_aml_mdsmpn_specific_dx_at_acquisition || null,
              dx_at_inclusion: row.dx_at_inclusion || null,
              specific_dx_at_inclusion: row.specific_dx_at_inclusion || null,
              eln2017_criteria: row.eln2017_criteria || null,
              dx_at_specimen_acquisition: row.dx_at_specimen_acquisition || null,
              specific_dx_at_acquisition: row.specific_dx_at_acquisition || null,
              age_at_specimen_acquisition: row.age_at_specimen_acquisition ? parseFloat(row.age_at_specimen_acquisition) : null,
              specimen_groups: row.specimen_groups || null,
              disease_stage_at_specimen_collection: row.disease_stage_at_specimen_collection || null,
              specimen_type: row.specimen_type || null,
              rnaseq_availability: row.rnaseq_availability || null,
              exomeseq_available: row.exomeseq_available || null
            };

            await Sample.findOneAndUpdate(
              { sample_id: sampleData.sample_id },
              sampleData,
              { upsert: true, new: true }
            );
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push({ row: row.sample_id, error: error.message });
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          message: 'Upload completed',
          successCount,
          errorCount,
          errors: errors.slice(0, 10)
        });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


