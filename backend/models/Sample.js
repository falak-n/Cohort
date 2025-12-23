const mongoose = require('mongoose');

const sampleSchema = new mongoose.Schema({
  sample_id: { type: String, required: true, unique: true, index: true },
  patient_id: { type: Number, required: true, index: true },
  timepoint: Number,
  is_replapse: String,
  is_denovo: String,
  is_transformed: String,
  specific_dx_at_acquisition_mdsmpn: String,
  non_aml_mdsmpn_specific_dx_at_acquisition: String,
  dx_at_inclusion: String,
  specific_dx_at_inclusion: String,
  eln2017_criteria: String,
  dx_at_specimen_acquisition: String,
  specific_dx_at_acquisition: String,
  age_at_specimen_acquisition: Number,
  specimen_groups: String,
  disease_stage_at_specimen_collection: String,
  specimen_type: String,
  rnaseq_availability: String,
  exomeseq_available: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Sample', sampleSchema);

