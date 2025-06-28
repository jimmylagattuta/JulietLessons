import https from "https";
import fs from "fs";
import path from "path";
import express from "express";
import cors from 'cors';
import { fileURLToPath } from 'url';

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json());

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const options = {
    key: fs.readFileSync('C:/Certbot/live/julietlessons.com/privkey.pem'),
    cert: fs.readFileSync('C:/Certbot/live/julietlessons.com/fullchain.pem'),
};

https.createServer(options, app).listen(443, () => {
    console.log("Server running on https://localhost");
});