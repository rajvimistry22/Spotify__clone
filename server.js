// server.js
const express = require("express");
const path = require("path");

const app = express();
const port = 8000;

// Serve static files from the directory (frontend code like index.html, script.js)
app.use(express.static(path.join(__dirname, "spotifyclone")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "spotifyclone", "index.html"));
});

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
