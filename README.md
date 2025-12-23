# Cohort Management System

A full-stack application for managing medical cohort data with patient and sample information, featuring AI-powered insights using Google Gemini.

## Features

- **Data Management**: Upload and manage patient and sample CSV data
- **RESTful API**: Complete CRUD operations for patients and samples
- **Search & Filter**: Advanced filtering and search capabilities
- **Dashboard**: Overview statistics and data visualization
- **AI Integration**: Google Gemini AI for data insights and analysis
- **MongoDB**: NoSQL database for flexible data storage

## Project Structure

```
Cohort/
├── backend/          # Express.js backend API
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   └── server.js     # Server entry point
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   └── App.js
│   └── public/
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Google Gemini API key

## Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cohort_db
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start MongoDB (if running locally):
```bash
# Make sure MongoDB is running on your system
```

5. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

## Usage


### Uploading Data

1. Go to the "Upload Data" page
2. Upload `patient (1).csv` file for patient data
3. Upload `sample (1).csv` file for sample data
4. Data will be automatically parsed and stored in MongoDB

### Viewing Data

- **Dashboard**: Overview statistics and AI insights
- **Patients**: Browse and filter patient data
- **Samples**: Browse and filter sample data

### AI Insights

1. Navigate to Dashboard
2. Enter a question in the AI Insights section
3. Click "Get Insights" to receive AI-generated analysis

Example API request (replace <HOST> and ensure the backend is running and GEMINI_API_KEY is set):

```bash
curl -X POST "http://<HOST>/api/ai/insights" \
  -H "Content-Type: application/json" \
  -d '{ "query": "How many male patients are there?" }'
```

Expected behavior: The AI prompt now includes a **Gender Distribution** aggregation from the database, so the model should be able to report the count of `Male` if patients have been imported. If the model still says gender is missing, confirm the CSV was uploaded (use `GET /api/patients` to verify records).

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients (with pagination and filters)
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/stats/summary` - Get patient statistics

### Samples
- `GET /api/samples` - Get all samples (with pagination and filters)
- `GET /api/samples/:id` - Get sample by ID
- `GET /api/samples/patient/:patient_id` - Get samples by patient ID
- `POST /api/samples` - Create new sample
- `PUT /api/samples/:id` - Update sample
- `DELETE /api/samples/:id` - Delete sample
- `GET /api/samples/stats/summary` - Get sample statistics

### Upload
- `POST /api/upload/patients` - Upload patient CSV file
- `POST /api/upload/samples` - Upload sample CSV file

### AI
- `POST /api/ai/insights` - Get AI insights (requires query in body)
- `POST /api/ai/analyze-patient/:patientId` - Analyze specific patient

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React, React Router, Axios
- **AI**: Google Gemini API
- **File Upload**: Multer, CSV Parser

## Design Decisions

1. **Separation of Concerns**: Clean separation between frontend and backend
2. **RESTful API**: Standard REST endpoints for easy integration
3. **MongoDB**: Flexible schema for medical data with varying fields
4. **Pagination**: Efficient data loading with pagination
5. **Error Handling**: Comprehensive error handling throughout
6. **AI Integration**: Context-aware AI insights based on actual data

## Notes

- Make sure MongoDB is running before starting the backend
- Get your Google Gemini API key from Google AI Studio
- CSV files should match the expected format (see sample files)


