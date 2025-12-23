const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Patient = require('../models/Patient');
const Sample = require('../models/Sample');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.post('/insights', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'Gemini API key not configured' });
    }

    const { query, patientId } = req.body;

    let contextData = '';
    
    if (patientId) {
      const patient = await Patient.findOne({ patient_id: parseInt(patientId) });
      const samples = await Sample.find({ patient_id: parseInt(patientId) }).sort({ timepoint: 1 });
      
      contextData = `Patient Information:\n${JSON.stringify(patient, null, 2)}\n\n`;
      contextData += `Patient Samples:\n${JSON.stringify(samples, null, 2)}\n\n`;
    } else {
      const patientStats = await Patient.aggregate([
        { $group: { _id: '$cohort', count: { $sum: 1 } } }
      ]);
      const sampleStats = await Sample.aggregate([
        { $group: { _id: '$disease_stage_at_specimen_collection', count: { $sum: 1 } } }
      ]);
      
      contextData = `Cohort Statistics:\n${JSON.stringify(patientStats, null, 2)}\n\n`;
      contextData += `Sample Statistics:\n${JSON.stringify(sampleStats, null, 2)}\n\n`;
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `You are a medical data analyst. Analyze the following cohort data and provide insights based on the query.

${contextData}

Query: ${query || 'Provide general insights about this patient cohort data'}

Please provide:
1. Key findings
2. Patterns or trends
3. Recommendations or observations

Keep the response concise and professional.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      insights: text,
      query: query || 'General insights'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze-patient/:patientId', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ error: 'Gemini API key not configured' });
    }

    const patientId = parseInt(req.params.patientId);
    const patient = await Patient.findOne({ patient_id: patientId });
    const samples = await Sample.find({ patient_id: patientId }).sort({ timepoint: 1 });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Analyze this patient's medical history and provide insights:

Patient: ${JSON.stringify(patient, null, 2)}
Samples: ${JSON.stringify(samples, null, 2)}

Provide:
1. Disease progression timeline
2. Key clinical observations
3. Risk factors or patterns
4. Recommendations

Keep response concise and medical-focused.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      patientId,
      analysis: text
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

