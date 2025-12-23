# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (v14+)
- ✅ MongoDB running (local or cloud)
- ✅ Google Gemini API key

## Step-by-Step Setup

### 1. Backend Setup (Terminal 1)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Edit .env and add your MongoDB URI and Gemini API key:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/cohort_db
# GEMINI_API_KEY=your_actual_api_key_here

# Start the server
npm start
```

You should see: `Server running on port 5000` and `MongoDB Connected`

### 2. Frontend Setup (Terminal 2)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The browser should automatically open to `http://localhost:3000`

### 3. Upload Your Data

1. Go to **Upload Data** page in the browser
2. Click "Choose File" under "Upload Patient Data"
3. Select `patient (1).csv` from the Cohort folder
4. Click "Upload Patients"
5. Wait for success message
6. Repeat for `sample (1).csv` under "Upload Sample Data"

### 4. Explore the Application

- **Dashboard**: View statistics and use AI insights
- **Patients**: Browse and filter patient data
- **Samples**: Browse and filter sample data

## Troubleshooting


### CSV Upload Fails
- Check CSV file format matches expected columns
- Ensure file is not corrupted
- Check backend console for detailed error messages

## Testing the API

You can test API endpoints directly:

```bash
# Get all patients
curl http://localhost:5000/api/patients

# Get patient statistics
curl http://localhost:5000/api/patients/stats/summary

# Get samples for a patient
curl http://localhost:5000/api/samples/patient/2476
```

## Default Data

After uploading the CSV files, you should have:
- ~800 patients
- ~900 samples
- Various cohorts (Waves1+2, Waves3+4)
- Multiple specimen types and disease stages



