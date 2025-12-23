import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [patientStats, setPatientStats] = useState(null);
  const [sampleStats, setSampleStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patientRes, sampleRes] = await Promise.all([
        axios.get('/api/patients/stats/summary'),
        axios.get('/api/samples/stats/summary')
      ]);
      setPatientStats(patientRes.data);
      setSampleStats(sampleRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    
    setAiLoading(true);
    try {
      const response = await axios.post('/api/ai/insights', { query: aiQuery });
      setAiResponse(response.data.insights);
    } catch (error) {
      setAiResponse('Error: ' + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <h2>Dashboard Overview</h2>
      
      <div className="stats">
        <div className="stat-card">
          <h3>Total Patients</h3>
          <div className="value">{patientStats?.total || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Samples</h3>
          <div className="value">{sampleStats?.total || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Relapse Cases</h3>
          <div className="value">{sampleStats?.relapseCount || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Avg Age at Diagnosis</h3>
          <div className="value">{patientStats?.avgAge ? Math.round(patientStats.avgAge) : 0}</div>
        </div>
      </div>

      <div className="card">
        <h3>Gender Distribution</h3>
        {patientStats?.byGender?.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <strong>{item._id || 'Unknown'}:</strong> {item.count}
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Cohort Distribution</h3>
        {patientStats?.byCohort?.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <strong>{item._id || 'Unknown'}:</strong> {item.count}
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Sample Types</h3>
        {sampleStats?.bySpecimenType?.map((item, idx) => (
          <div key={idx} style={{ marginBottom: '10px' }}>
            <strong>{item._id || 'Unknown'}:</strong> {item.count}
          </div>
        ))}
      </div>

      <div className="card ai-section">
        <h3>AI Insights</h3>
        <textarea
          placeholder="Ask a question about the cohort data..."
          value={aiQuery}
          onChange={(e) => setAiQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAIQuery} disabled={aiLoading}>
          {aiLoading ? 'Analyzing...' : 'Get Insights'}
        </button>
        {aiResponse && (
          <div className="ai-response">{aiResponse}</div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;


