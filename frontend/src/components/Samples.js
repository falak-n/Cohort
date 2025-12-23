import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Samples() {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    patient_id: '',
    specimen_type: '',
    disease_stage: ''
  });

  useEffect(() => {
    fetchSamples();
  }, [page, filters]);

  const fetchSamples = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });
      
      const response = await axios.get(`/api/samples?${params}`);
      setSamples(response.data.samples);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching samples:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  if (loading) {
    return <div className="loading">Loading samples...</div>;
  }

  return (
    <div>
      <h2>Samples</h2>
      
      <div className="filters">
        <input
          type="number"
          placeholder="Patient ID"
          value={filters.patient_id}
          onChange={(e) => handleFilterChange('patient_id', e.target.value)}
        />
        <select
          value={filters.specimen_type}
          onChange={(e) => handleFilterChange('specimen_type', e.target.value)}
        >
          <option value="">All Specimen Types</option>
          <option value="Bone Marrow Aspirate">Bone Marrow Aspirate</option>
          <option value="Peripheral Blood">Peripheral Blood</option>
          <option value="Leukapheresis">Leukapheresis</option>
        </select>
        <select
          value={filters.disease_stage}
          onChange={(e) => handleFilterChange('disease_stage', e.target.value)}
        >
          <option value="">All Disease Stages</option>
          <option value="Initial Diagnosis">Initial Diagnosis</option>
          <option value="Relapse">Relapse</option>
          <option value="Residual">Residual</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Sample ID</th>
              <th>Patient ID</th>
              <th>Timepoint</th>
              <th>Specimen Type</th>
              <th>Disease Stage</th>
              <th>Diagnosis</th>
              <th>Relapse</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((sample) => (
              <tr key={sample._id}>
                <td>{sample.sample_id}</td>
                <td>{sample.patient_id}</td>
                <td>{sample.timepoint}</td>
                <td>{sample.specimen_type || '-'}</td>
                <td>{sample.disease_stage_at_specimen_collection || '-'}</td>
                <td>{sample.specific_dx_at_acquisition || '-'}</td>
                <td>{sample.is_replapse === 'TRUE' ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Samples;


