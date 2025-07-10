const fetch = require('node-fetch');
const TARGET = 'https://platform.openai.com/docs/pricing';

(async () => {
  try {
    const res = await fetch(TARGET, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    console.log('Status:', res.status, res.statusText);

    ['server', 'cf-ray', 'cf-cache-status', 'cf-chl-bypass'].forEach(h => {
      if (res.headers.get(h)) console.log(`${h}:`, res.headers.get(h));
    });

    const body = await res.text();
    const snippet = body.slice(0, 500).replace(/\s+/g, ' ');
    console.log('\nBody snippet:', snippet, '…\n');

    if (snippet.includes('Just a moment') && snippet.includes('challenges.cloudflare.com')) {
      console.log('Likely hitting a Turnstile JS challenge.');
    } else if (snippet.includes('cf-error-code')) {
      console.log('Cloudflare error page (cf-error).');
    } else if (res.status === 403) {
      console.log('Access forbidden, but exact challenge not obvious in first 500 chars.');
    } else {
      console.log('No obvious Cloudflare block detected in snippet; maybe passed.');
    }
  } catch (e) {
    console.error('Fetch failed:', e.message);
  }
})();
