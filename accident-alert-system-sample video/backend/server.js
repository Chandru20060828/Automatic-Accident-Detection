const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { sendAlertMail } = require("./emailService");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data", "accidents.json");

// Store server start time
const serverStartTime = new Date();

// helper to build maps url
function buildMapsUrl(lat, lon, locationText) {
  if (lat != null && lon != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + "," + lon)}`;
  } else if (locationText) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`;
  } else {
    return "";
  }
}

// GET all accidents (history)
app.get("/api/accidents", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  res.json(data);
});

// GET recent accidents (since server start)
app.get("/api/recent-accidents", (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE));
  const recent = data.filter(acc => new Date(acc.timestamp) >= serverStartTime);
  res.json(recent);
});

// POST new accident
app.post("/api/accidents", async (req, res) => {
  try {
    const { timestamp, location, speed, lat, lon } = req.body;
    if (!timestamp || (!location && (lat == null || lon == null))) {
      return res.status(400).json({ error: "Missing timestamp and location/coords" });
    }

    const mapsUrl = buildMapsUrl(lat, lon, location);

    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    const newAccident = {
      id: data.length + 1,
      timestamp,
      location: location || `${lat},${lon}`,
      lat: lat ?? null,
      lon: lon ?? null,
      mapsUrl,
      speed: speed || null
    };
    data.push(newAccident);

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    await sendAlertMail(newAccident);

    res.json({ message: "Accident recorded and email sent", accident: newAccident });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
