const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });
const Patient = require('../models/Patient');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cohort_db';

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const genderStats = await Patient.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    console.log('Gender distribution:');
    genderStats.forEach(g => console.log(`${g._id || 'UNKNOWN'}: ${g.count}`));

    const male = genderStats.find(g => (g._id || '').toLowerCase() === 'male');
    if (male) {
      console.log('\nMale count found:', male.count);
    } else {
      console.log('\nNo male records found in the database.');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error checking gender counts:', err);
    process.exit(1);
  }
}

main();
