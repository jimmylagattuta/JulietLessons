// server.js
import express from "express"
import cors from "cors"
import fs from "fs"
import path from "path"
import http from "http"
import https from "https"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "dist")))

// All remaining requests serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"))
})

const PORT = process.env.PORT || 3000

// Try to spin up HTTPS if certs exist
let server

try {
  const keyPath  = "C:/Certbot/live/julietlessons.com/privkey.pem"
  const certPath = "C:/Certbot/live/julietlessons.com/fullchain.pem"

  const key  = fs.readFileSync(keyPath)
  const cert = fs.readFileSync(certPath)

  server = https.createServer({ key, cert }, app)
  server.listen(443, () => {
    console.log("HTTPS server running on port 443")
  })

} catch (err) {
  console.warn("⚠️  Could not load SSL certs, falling back to HTTP:", err.message)
  server = http.createServer(app)
  server.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`)
  })
}
