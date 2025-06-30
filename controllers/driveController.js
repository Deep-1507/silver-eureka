const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

// Replace this with your Google Sheets public CSV link
const GOOGLE_SHEET_CSV_LINK = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSnm-ZRKyeODgUCWfN6q7tKZbBigkRqYLNzmjG4JVlcckbbVPa1mMdTOp6ey-t-ns-FZt1Y5xkUuNps/pub?output=csv";

// Fetch all drives (GET)
router.get("/drives", async (req, res) => {
  try {
    const response = await axios.get(GOOGLE_SHEET_CSV_LINK);

    // Save CSV to a temporary file
    const tempCsvPath = path.join(__dirname, "temp.csv");
    fs.writeFileSync(tempCsvPath, response.data);

    // Parse the CSV and convert it to JSON
    const drives = [];
    fs.createReadStream(tempCsvPath)
      .pipe(csv())
      .on("data", (row) => drives.push(row))
      .on("end", () => {
        res.status(200).json(drives);
      });
  } catch (err) {
    res.status(500).json({ message: "Error fetching drives: " + err.message });
  }
});

// Add a new drive (POST)
router.post("/drives", async (req, res) => {
  try {
    const { companyName, hrDetails, coodName, phoneNumber, status, dateCreated } = req.body;

    // Prepare new data as a CSV row
    const newRow = `"${companyName}","${JSON.stringify(hrDetails)}","${coodName}","${phoneNumber}","${status}","${dateCreated}"\n`;

    // Append the new row to a local file (Google Sheets can't be written directly via a public link)
    const tempCsvPath = path.join(__dirname, "temp.csv");
    fs.appendFileSync(tempCsvPath, newRow);

    res.status(201).json({ message: "Drive added successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error saving drive: " + err.message });
  }
});

module.exports = router;
