// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const fuzz = require('fuzzball');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// MySQL connection
const connection = mysql.createConnection({
  host: "rare-disease-med-database.c7qai64ma8pc.ap-southeast-2.rds.amazonaws.com",
  user: "admin",
  password: "Babybaby0720",
  database: "RareDisease" // Connect directly to RareDisease
});

// Test database connection
connection.connect(error =>{
    if (error){console.log("There's an error")}
    
    else{
        console.log("There's no error")
    }
        
})
app.post('/search', (req, res) => {
  const { medications } = req.body;
  const query = "SELECT * FROM diseases";

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }

    const threshold = 80;
    const matchedDiseases = [];

    results.forEach(disease => {
      if (!disease.Medications) return;

      const dbMeds = disease.Medications.split(',').map(med => med.trim().toLowerCase());

      // Check each user input medication against each medication in the database
      for (const userMed of medications) {
        for (const dbMed of dbMeds) {
          const similarity = fuzz.ratio(userMed.toLowerCase(), dbMed);
          if (similarity >= threshold) {
            matchedDiseases.push(disease.Name);
            break;
          }
        }
        if (matchedDiseases.includes(disease.Name)) break;
      }
    });

    res.json({ diseases: matchedDiseases });
  });
});
// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });