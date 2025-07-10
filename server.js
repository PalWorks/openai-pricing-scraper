const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()
const PORT = process.env.PORT || 3000

let cachedData = null

async function scrapePricing() {
  try {
    const { data: html } = await axios.get('https://openai.com/pricing', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    })

    const $ = cheerio.load(html)
    const results = []

    $('h3:text("Usage")').each((_, el) => {
      const model = $(el).text().trim()
      const parent = $(el).closest('section')
      parent.find('table tbody tr').each((_, row) => {
        const cells = $(row).find('td')
        if (cells.length >= 2) {
          results.push({
            model,
            input_cost: $(cells[0]).text().trim(),
            output_cost: $(cells[1]).text().trim()
          })
        }
      })
    })

    cachedData = {
      updated: new Date().toISOString(),
      models: results
    }
    console.log('✅ Pricing data refreshed')
  } catch (err) {
    console.error('❌ Scrape error:', err.message)
  }
}

scrapePricing()
setInterval(scrapePricing, 24 * 60 * 60 * 1000)

app.get('/', (_, res) => res.send('✅ OpenAI Pricing Scraper is live'))

app.get('/pricing', (_, res) => {
  if (!cachedData) return res.status(503).json({ error: 'Data not ready yet' })
  res.json(cachedData)
})

app.get('/pricing.csv', (_, res) => {
  if (!cachedData) return res.status(503).send('Data not ready yet')
  const csv = ['Model,Input Token Cost,Output Token Cost']
    .concat(
      cachedData.models.map(
        m => `"${m.model}","${m.input_cost}","${m.output_cost}"`
      )
    )
    .join('\n')
  res.setHeader('Content-Type', 'text/csv')
  res.send(csv)
})

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`))
