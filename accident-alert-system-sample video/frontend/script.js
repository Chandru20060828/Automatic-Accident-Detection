// Dashboard: Load recent accidents (since server start)
async function loadAccidents() {
  try {
    const res = await fetch("http://localhost:5000/api/recent-accidents");
    const data = await res.json();

    const table = document.getElementById("accidentTable");
    if (!table) return;

    table.innerHTML = "<tr><th>Timestamp</th><th>Location</th><th>Map</th></tr>";

    data.slice().reverse().forEach(acc => {
      const link = acc.mapsUrl ? `<a href="${acc.mapsUrl}" target="_blank">View</a>` : "-";
      const row = `<tr><td>${acc.timestamp}</td><td>${acc.location}</td><td>${link}</td></tr>`;
      table.innerHTML += row;
    });
  } catch (err) {
    console.error("Failed to fetch recent accidents:", err);
  }
}

// Dashboard: Search recent accidents
async function searchAccidents() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const res = await fetch("http://localhost:5000/api/recent-accidents");
  const data = await res.json();

  const table = document.getElementById("accidentTable");
  table.innerHTML = "<tr><th>Timestamp</th><th>Location</th><th>Map</th></tr>";

  data.slice().reverse().filter(acc =>
    acc.location.toLowerCase().includes(query) || acc.timestamp.includes(query)
  ).forEach(acc => {
    const link = acc.mapsUrl ? `<a href="${acc.mapsUrl}" target="_blank">View</a>` : "-";
    const row = `<tr><td>${acc.timestamp}</td><td>${acc.location}</td><td>${link}</td></tr>`;
    table.innerHTML += row;
  });
}

// History page: Search all accidents
async function searchHistory() {
  const query = document.getElementById("historySearch").value.toLowerCase();
  const res = await fetch("http://localhost:5000/api/accidents");
  const data = await res.json();

  const table = document.getElementById("historyTable");
  table.innerHTML = "<tr><th>ID</th><th>Timestamp</th><th>Location</th><th>Map</th></tr>";

  data.slice().reverse().filter(acc =>
    acc.location.toLowerCase().includes(query) || acc.timestamp.includes(query)
  ).forEach(acc => {
    const link = acc.mapsUrl ? `<a href="${acc.mapsUrl}" target="_blank">View</a>` : "-";
    const row = `<tr><td>${acc.id}</td><td>${acc.timestamp}</td><td>${acc.location}</td><td>${link}</td></tr>`;
    table.innerHTML += row;
  });
}

// Auto-refresh dashboard
setInterval(loadAccidents, 5000);
window.onload = loadAccidents;

// Load all accidents for history page
async function loadHistory() {
  try {
    const res = await fetch("http://localhost:5000/api/accidents");
    const data = await res.json();

    const table = document.getElementById("historyTable");
    if (!table) return;

    table.innerHTML = `
      <tr>
        <th>ID</th>
        <th>Timestamp</th>
        <th>Location</th>
        <th>Map</th>
        <th>Speed</th>
      </tr>`;

    // Display newest first
    data.slice().reverse().forEach(acc => {
      const link = acc.mapsUrl ? `<a href="${acc.mapsUrl}" target="_blank">View</a>` : "-";
      const speed = acc.speed || "-";
      const row = `<tr>
        <td>${acc.id}</td>
        <td>${acc.timestamp}</td>
        <td>${acc.location}</td>
        <td>${link}</td>
        <td>${speed}</td>
      </tr>`;
      table.innerHTML += row;
    });
  } catch (err) {
    console.error("Error loading history:", err);
  }
}

// Search accidents in history
async function searchHistory() {
  const query = document.getElementById("historySearch").value.toLowerCase();
  const res = await fetch("http://localhost:5000/api/accidents");
  const data = await res.json();

  const table = document.getElementById("historyTable");
  table.innerHTML = `
    <tr>
      <th>ID</th>
      <th>Timestamp</th>
      <th>Location</th>
      <th>Map</th>
      <th>Speed</th>
    </tr>`;

  data.slice().reverse().filter(acc =>
    acc.location.toLowerCase().includes(query) || acc.timestamp.includes(query)
  ).forEach(acc => {
    const link = acc.mapsUrl ? `<a href="${acc.mapsUrl}" target="_blank">View</a>` : "-";
    const speed = acc.speed || "-";
    const row = `<tr>
      <td>${acc.id}</td>
      <td>${acc.timestamp}</td>
      <td>${acc.location}</td>
      <td>${link}</td>
      <td>${speed}</td>
    </tr>`;
    table.innerHTML += row;
  });
}

// Automatically load history when page opens
window.onload = loadHistory;
