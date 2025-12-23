const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patient_id: { type: Number, required: true, unique: true, index: true },
  centre_id: Number,
  cohort: String,
  gender: String,
  self_reported_race: String,
  self_reported_ethnicity: String,
  age_at_diagnosis: Number,
  prior_malignancy: String,
  publication: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);


