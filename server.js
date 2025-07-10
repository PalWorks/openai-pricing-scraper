const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Replace this with your Browserless token
const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;

const browserlessEndpoint = `https://production-sfo.browserless.io/screenshot?token=${BROWSERLESS_TOKEN}`;
const TARGET_URL = "https://platform.openai.com/docs/pricing";
const CSV_FILE = path.join(__dirname, "pricing.csv");

async function takeScreenshot() {
  const response = await fetch(browserlessEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: TARGET_URL,
      options: {
        waitUntil: "load",
        timeout: 30000
      },
      browserContext: "default",
      gotoOptions: {
        waitUntil: "networkidle2"
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.7103.113 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Scrape error: ${response.statusText}`);
  }

  const buffer = await response.buffer();

  // Simulate processing to extract text and convert to CSV
  const timestamp = new Date().toISOString();
  const dummyPricingData = [
    ["Model", "Input Price (per 1K tokens)", "Output Price (per 1K tokens)"],
    ["GPT-4", "$0.03", "$0.06"],
    ["GPT-3.5", "$0.001", "$0.002"],
    ["Fetched At", timestamp, ""]
  ];

  const csv = dummyPricingData.map(row => row.join(",")).join("\n");
  fs.writeFileSync(CSV_FILE, csv);
}

app.get("/pricing", async (req, res) => {
  try {
    await takeScreenshot();
    res.send("✅ Pricing data fetched and CSV generated.");
  } catch (error) {
    console.error("❌ Scrape error:", error.message);
    res.status(500).send("Failed to scrape pricing data.");
  }
});

app.get("/pricing.csv", (req, res) => {
  if (!fs.existsSync(CSV_FILE)) {
    return res.status(404).send("No data yet. Please visit /pricing first.");
  }

  res.setHeader("Content-Disposition", "attachment; filename=pricing.csv");
  res.setHeader("Content-Type", "text/csv");
  fs.createReadStream(CSV_FILE).pipe(res);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
