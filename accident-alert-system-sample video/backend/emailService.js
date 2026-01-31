const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendAlertMail(accident) {
  const mapsUrl = accident.mapsUrl || "";
  // Directions link (use destination = lat,lon if available)
  let directionsUrl = "";
  if (accident.lat != null && accident.lon != null) {
    directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(accident.lat + "," + accident.lon)}`;
  } else if (mapsUrl) {
    directionsUrl = mapsUrl; // fallback: search link
  }

  const htmlBody = `
    <h2>Automatic Accident Detection Alert</h2>
    <p><strong>Timestamp:</strong> ${accident.timestamp}</p>
    <p><strong>Location:</strong> ${accident.location}</p>
    ${accident.speed ? `<p><strong>Reported Speed:</strong> ${accident.speed} km/h</p>` : ""}
    ${mapsUrl ? `<p><a href="${mapsUrl}" target="_blank">View location on Google Maps</a></p>` : ""}
    ${directionsUrl ? `<p><a href="${directionsUrl}" target="_blank">Get Directions / Navigate</a></p>` : ""}
    <hr>
    <p>Please dispatch ambulance immediately.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "chandru2006tj@gmail.com", // ideally dynamic later
    subject: "🚨 Accident Alert!",
    html: htmlBody,
    text: `Accident detected at ${accident.location} on ${accident.timestamp}. Location link: ${mapsUrl || directionsUrl}`
  };

  await transporter.sendMail(mailOptions);
  console.log("✅ Email sent with maps link!");
}

module.exports = { sendAlertMail };
