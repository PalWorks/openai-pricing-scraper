# OpenAI Pricing Scraper 🧼

A simple Node.js service that scrapes [OpenAI's pricing page](https://platform.openai.com/docs/pricing) and serves it as JSON and CSV.

## 🚀 Deployment

### Requirements
* Node.js ≥ 16
* (Optional) A Render account for hosting

### Local run

```bash
git clone https://github.com/yourusername/openai-pricing-scraper.git
cd openai-pricing-scraper
npm install
node server.js
```

The server starts on `http://localhost:3000`.

## 🌐 Endpoints

| Route           | Description              |
|-----------------|--------------------------|
| `/`             | Health check             |
| `/pricing`      | Pricing data as JSON     |
| `/pricing.csv`  | Pricing data as CSV      |

## 🧠 How it works
1. Fetches raw HTML from OpenAI’s pricing page with Axios.
2. Parses model names and token costs with Cheerio.
3. Caches results in memory and refreshes every 24 h.

## ⏱️ Cron refresh
Refresh interval is handled by `setInterval` inside `server.js`; no external scheduler needed.

## 📄 License
MIT – see `LICENSE` file.
