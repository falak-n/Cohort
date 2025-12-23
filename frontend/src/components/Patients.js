import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    gender: '',
    cohort: '',
    search: ''
  });

  useEffect(() => {
    fetchPatients();
  }, [page, filters]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });
      
      const response = await axios.get(`/api/patients?${params}`);
      setPatients(response.data.patients);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  if (loading) {
    return <div className="loading">Loading patients...</div>;
  }

  return (
    <div>
      <h2>Patients</h2>
      
      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
        <select
          value={filters.gender}
          onChange={(e) => handleFilterChange('gender', e.target.value)}
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select
          value={filters.cohort}
          onChange={(e) => handleFilterChange('cohort', e.target.value)}
        >
          <option value="">All Cohorts</option>
          <option value="Waves1+2">Waves1+2</option>
          <option value="Waves3+4">Waves3+4</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Gender</th>
              <th>Cohort</th>
              <th>Age at Diagnosis</th>
              <th>Race</th>
              <th>Ethnicity</th>
              <th>Prior Malignancy</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id}>
                <td>{patient.patient_id}</td>
                <td>{patient.gender || '-'}</td>
                <td>{patient.cohort || '-'}</td>
                <td>{patient.age_at_diagnosis || '-'}</td>
                <td>{patient.self_reported_race || '-'}</td>
                <td>{patient.self_reported_ethnicity || '-'}</td>
                <td>{patient.prior_malignancy || '-'}</td>
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

export default Patients;


