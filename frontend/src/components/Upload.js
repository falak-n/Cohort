import React, { useState } from 'react';
import axios from 'axios';

function Upload() {
  const [patientFile, setPatientFile] = useState(null);
  const [sampleFile, setSampleFile] = useState(null);
  const [patientResult, setPatientResult] = useState(null);
  const [sampleResult, setSampleResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePatientUpload = async (e) => {
    e.preventDefault();
    if (!patientFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', patientFile);

    try {
      const response = await axios.post('/api/upload/patients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPatientResult(response.data);
    } catch (error) {
      setPatientResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSampleUpload = async (e) => {
    e.preventDefault();
    if (!sampleFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', sampleFile);

    try {
      const response = await axios.post('/api/upload/samples', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSampleResult(response.data);
    } catch (error) {
      setSampleResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Data</h2>

      <div className="card upload-section">
        <h3>Upload Patient Data</h3>
        <form onSubmit={handlePatientUpload}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setPatientFile(e.target.files[0])}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !patientFile}>
            Upload Patients
          </button>
        </form>
        {patientResult && (
          <div className={patientResult.error ? 'error' : 'success'}>
            {patientResult.error ? (
              <div>Error: {patientResult.error}</div>
            ) : (
              <div>
                <p>Success! Uploaded {patientResult.successCount} patients.</p>
                {patientResult.errorCount > 0 && (
                  <p>Errors: {patientResult.errorCount}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card upload-section">
        <h3>Upload Sample Data</h3>
        <form onSubmit={handleSampleUpload}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setSampleFile(e.target.files[0])}
            required
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !sampleFile}>
            Upload Samples
          </button>
        </form>
        {sampleResult && (
          <div className={sampleResult.error ? 'error' : 'success'}>
            {sampleResult.error ? (
              <div>Error: {sampleResult.error}</div>
            ) : (
              <div>
                <p>Success! Uploaded {sampleResult.successCount} samples.</p>
                {sampleResult.errorCount > 0 && (
                  <p>Errors: {sampleResult.errorCount}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Instructions</h3>
        <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Upload CSV files with patient or sample data</li>
          <li>Patient CSV should include: patient_id, gender, cohort, age_at_diagnosis, etc.</li>
          <li>Sample CSV should include: sample_id, patient_id, timepoint, specimen_type, etc.</li>
          <li>Files will be parsed and data will be stored in MongoDB</li>
        </ul>
      </div>
    </div>
  );
}

export default Upload;


