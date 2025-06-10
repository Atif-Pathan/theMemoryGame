import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for all origins (safe for a proxy)
app.use(cors());

// Base URL for the emoji.family API
const API_BASE = 'https://www.emoji.family/api';

/**
 * Catch-all proxy for all GET requests to /api/emojis*
 * This will handle:
 *   - /api/emojis
 *   - /api/emojis/:emoji
 *   - /api/emojis/:emoji/pack/svg
 *   - /api/emojis/:emoji/pack/png/:size
 *   - etc.
 */
app.get('/api/emojis*', async (req, res) => {
  // Remove '/api' from the start of the path to get the target API path
  const apiPath = req.originalUrl.replace(/^\/api/, '');

  // Build the full URL to the emoji.family API
  const url = `${API_BASE}${apiPath.replace(/^\/emojis/, '/emojis')}`;

  try {
    // Forward the request to the emoji.family API
    const response = await fetch(`https://www.emoji.family/api${apiPath}`, {
      headers: {
        // Some APIs require a User-Agent header
        'User-Agent': 'Mozilla/5.0',
      },
    });

    // Get the content type of the response
    const contentType = response.headers.get('content-type');

    // If the response is an image (SVG or PNG), stream it directly to the client
    if (contentType && (contentType.includes('image/svg') || contentType.includes('image/png'))) {
      res.set('Content-Type', contentType);
      // Get the response body as an ArrayBuffer
      const imageBuffer = await response.arrayBuffer();
      // Send the buffer as the response. Express handles this correctly.
      res.send(Buffer.from(imageBuffer));
      return;
    }

    // Otherwise, assume the response is JSON and send it to the client
    const data = await response.json();
    res.json(data);
  } catch (err) {
    // Log and return an error if the proxy fails
    console.error('Error proxying emoji API:', err);
    res.status(500).json({ error: 'Failed to fetch from emoji API' });
  }
});

// Start the proxy server
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});