const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Patient = require('../models/Patient');
const Sample = require('../models/Sample');

const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

const isKeyMissing = () =>
  !GEMINI_KEY ||
  GEMINI_KEY === 'your_gemini_api_key_here' ||
  GEMINI_KEY.trim().length < 10; // quick sanity check

// Basic safety/abuse/PII guardrails
const unsafePatterns = [
  /password/i,
  /api[_-]?key/i,
  /secret/i,
  /token/i,
  /ssn/i,
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN-like
  /\b\d{16}\b/, // possible card number
  /credit\s?card/i
];

const isUnsafe = (text = '') => unsafePatterns.some((p) => p.test(text));

const isAmbiguous = (text = '') => {
  const trimmed = text.trim();
  return !trimmed || trimmed.length < 4;
};

const buildPrompt = ({ contextData, query }) => `You are a medical data analyst. Use only the provided context. If data is missing, state it plainly without inventing facts.

Context:
${contextData}

User query: ${query}

Provide:
1) Key findings
2) Patterns or trends
3) Recommendations or observations

Rules:
- Be concise and clinical.
- Do not include credentials, secrets, or speculative PHI.
- If information is insufficient, clearly say what is missing.`;

router.post('/insights', async (req, res) => {
  try {
    if (isKeyMissing()) {
      return res.status(400).json({ error: 'Gemini API key not configured or invalid' });
    }

    const { query, patientId } = req.body;

    // Safety: block obviously unsafe prompts
    if (isUnsafe(query)) {
      return res.status(400).json({ error: 'Query rejected by safety filter' });
    }

    // Clarify ambiguous prompts (unless patientId is provided for context)
    if (isAmbiguous(query) && !patientId) {
      return res.status(400).json({
        error: 'Please provide a clearer question (e.g., relapse trends, cohort comparison, risk factors).',
        clarificationNeeded: true
      });
    }

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
      const genderStats = await Patient.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]);
      const sampleStats = await Sample.aggregate([
        { $group: { _id: '$disease_stage_at_specimen_collection', count: { $sum: 1 } } }
      ]);
      
      contextData = `Cohort Statistics:\n${JSON.stringify(patientStats, null, 2)}\n\n`;
      contextData += `Gender Distribution:\n${JSON.stringify(genderStats, null, 2)}\n\n`;
      contextData += `Sample Statistics:\n${JSON.stringify(sampleStats, null, 2)}\n\n`;
    }

    if (!genAI) {
      console.error('[AI /insights] Error: Generative AI client not configured (missing GEMINI_API_KEY)');
      return res.status(500).json({ error: 'AI provider not configured. Set GEMINI_API_KEY in the environment.' });
    }

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const userQuery = query || 'Provide general insights about this patient cohort data';
    const prompt = buildPrompt({ contextData, query: userQuery });

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (err) {
      console.error('[AI /insights] Model generation error:', err);
      const msg = err && err.message ? err.message : String(err);
      if (msg.includes('not found') || msg.match(/models\/.+ is not found/)) {
        return res.status(502).json({ error: 'AI model not found. Check GEMINI_MODEL and GEMINI_API_KEY configuration.' });
      }
      return res.status(500).json({ error: 'AI provider error' });
    }

    const response = await result.response;
    const text = response.text();

    res.json({
      insights: text,
      query: userQuery
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('[AI /insights] Error:', error);
  }
});

// Debug endpoint: return the constructed context used for AI prompts (no external calls)
router.post('/context', async (req, res) => {
  try {
    const { query, patientId } = req.body || {};
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
      const genderStats = await Patient.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } }
      ]);
      const sampleStats = await Sample.aggregate([
        { $group: { _id: '$disease_stage_at_specimen_collection', count: { $sum: 1 } } }
      ]);

      contextData = `Cohort Statistics:\n${JSON.stringify(patientStats, null, 2)}\n\n`;
      contextData += `Gender Distribution:\n${JSON.stringify(genderStats, null, 2)}\n\n`;
      contextData += `Sample Statistics:\n${JSON.stringify(sampleStats, null, 2)}\n\n`;
    }

    res.json({ context: contextData, query: query || 'Provide general insights about this patient cohort data', patientId: patientId || null });
  } catch (err) {
    console.error('[AI /context] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/analyze-patient/:patientId', async (req, res) => {
  try {
    if (isKeyMissing()) {
      return res.status(400).json({ error: 'Gemini API key not configured or invalid' });
    }

    const patientId = parseInt(req.params.patientId);
    const { query } = req.body || {};

    if (isUnsafe(query)) {
      return res.status(400).json({ error: 'Query rejected by safety filter' });
    }

    const patient = await Patient.findOne({ patient_id: patientId });
    const samples = await Sample.find({ patient_id: patientId }).sort({ timepoint: 1 });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const modelName = GEMINI_MODEL || 'gemini-is-2.5-flash';
    if (!genAI) {
      console.error('[AI /analyze-patient] Error: Generative AI client not configured (missing GEMINI_API_KEY)');
      return res.status(500).json({ error: 'AI provider not configured. Set GEMINI_API_KEY in the environment.' });
    }

    let model;
    try {
      model = genAI.getGenerativeModel({ model: modelName });
    } catch (initErr) {
      console.error('[AI /analyze-patient] Model init error:', initErr);
      return res.status(502).json({ error: `AI model initialization failed: ${initErr.message || initErr}` });
    }

    const patientContext = `Patient: ${JSON.stringify(patient, null, 2)}\nSamples: ${JSON.stringify(samples, null, 2)}`;
    const userQuery = query || "Analyze this patient's medical history and provide concise insights.";
    const prompt = buildPrompt({ contextData: patientContext, query: userQuery });

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      res.json({
        patientId,
        analysis: text
      });
    } catch (genErr) {
      console.error('[AI /analyze-patient] Generate error:', genErr);
      const msg = genErr && genErr.message ? genErr.message : String(genErr);
      if (msg.includes('not found') || msg.match(/models\/.+ is not found/)) {
        return res.status(502).json({ error: 'AI model not found. Check GEMINI_MODEL and GEMINI_API_KEY configuration.' });
      }
      return res.status(500).json({ error: 'AI provider error' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error('[AI /analyze-patient] Error:', error);
  }
});

module.exports = router;


