const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

const app = express();
const PORT = process.env.PORT || 10000;
const PRICING_URL = 'https://raw.githubusercontent.com/openai/openai-python/main/openai/data/pricing.json';

async function fetchPricingAndSaveToCSV() {
  try {
    const response = await fetch(PRICING_URL);

    if (!response.ok) {
      console.error(`❌ Failed to fetch pricing JSON: ${response.statusText}`);
      return;
    }

    const pricingData = await response.json();
    const rows = [];

    for (const [category, models] of Object.entries(pricingData)) {
      for (const [modelName, prices] of Object.entries(models)) {
        rows.push({
          category,
          model: modelName,
          input_per_1k: prices.prompt || prices.input || '',
          output_per_1k: prices.completion || prices.output || '',
          unit: prices.unit || 'tokens'
        });
      }
    }

    const csvWriter = createObjectCsvWriter({
      path: 'openai_pricing.csv',
      header: [
        { id: 'category', title: 'Category' },
        { id: 'model', title: 'Model' },
        { id: 'input_per_1k', title: 'Input per 1K' },
        { id: 'output_per_1k', title: 'Output per 1K' },
        { id: 'unit', title: 'Unit' }
      ]
    });

    await csvWriter.writeRecords(rows);
    console.log('✅ Prices written to openai_pricing.csv');
  } catch (err) {
    console.error('❌ Scrape error:', err.message || err);
  }
}

app.get('/', (req, res) => {
  res.send('OpenAI Pricing Scraper is live. Check /csv for latest CSV.');
});

app.get('/csv', async (req, res) => {
  try {
    await fetchPricingAndSaveToCSV();
    res.download('openai_pricing.csv');
  } catch (e) {
    res.status(500).send('Failed to generate CSV');
  }
});

// Initial fetch every 24 hrs
fetchPricingAndSaveToCSV();
setInterval(fetchPricingAndSaveToCSV, 24 * 60 * 60 * 1000); // 24 hours

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
