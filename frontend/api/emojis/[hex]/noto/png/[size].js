export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { hex, size } = req.query;
  
  const targetUrl = `https://www.emoji.family/api/emojis/${hex}/noto/png/${size}`;
  console.log('Fetching image from:', targetUrl);

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType);
    
    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);
    res.send(buffer);
    
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}