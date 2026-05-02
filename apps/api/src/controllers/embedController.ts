import { Request, Response } from "express";

/**
 * Proxy TikTok embeds to avoid CORS issues
 */
export async function getTiktokEmbed(req: Request, res: Response) {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({ error: "Video ID is required" });
    }

    // Construct TikTok embed URL
    const tiktokEmbedUrl = `https://www.tiktok.com/embed/v2/${videoId}?lang=fr&mute=0&autoplay=1&share=1&controls=1&showinfo=0&rel=0`;
    
    // Fetch the TikTok embed HTML using Node.js fetch
    const response = await fetch(tiktokEmbedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`TikTok embed request failed: ${response.status}`);
    }

    // Modify the HTML to remove problematic scripts and add CORS headers
    let html = await response.text();
    
    // Remove or replace problematic scripts that cause CORS issues
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/mon\.tiktokv\.com/g, '');
    html = html.replace(/monitor_browser\/collect/g, '');
    
    // Add our own script to handle embed functionality
    const customScript = `
      <script>
        // Custom embed functionality
        window.addEventListener('message', function(event) {
          if (event.origin === '${req.headers.origin}') {
            const { event: eventType, method } = event.data;
            if (eventType === 'play' || method === 'play') {
              // Handle play
              const video = document.querySelector('video');
              if (video) video.play();
            } else if (eventType === 'pause' || method === 'pause') {
              // Handle pause
              const video = document.querySelector('video');
              if (video) video.pause();
            }
          }
        });
      </script>
    `;
    
    html = html.replace('</body>', customScript + '</body>');

    // Set CORS headers and return the modified HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.send(html);
    
  } catch (error) {
    console.error('Error proxying TikTok embed:', error);
    
    // Return a fallback embed on error
    const fallbackHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>TikTok Video</title>
        <style>
          body { margin: 0; padding: 0; background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
          .fallback { text-align: center; color: white; }
          .fallback a { color: #25F4EE; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="fallback">
          <p>TikTok video loading failed</p>
          <a href="https://www.tiktok.com/@/video/${req.params.videoId}" target="_blank">Watch on TikTok</a>
        </div>
      </body>
      </html>
    `;
    
    res.status(500).send(fallbackHtml);
  }
}

/**
 * Proxy YouTube embeds to avoid CORS issues
 */
export async function getYoutubeEmbed(req: Request, res: Response) {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({ error: "Video ID is required" });
    }

    // For YouTube, we can redirect to the embed URL since YouTube allows CORS
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${videoId}&enablejsapi=1&origin=${req.headers.origin}&rel=0&controls=1&modestbranding=1&showinfo=0`;
    
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Redirect to YouTube embed
    res.redirect(302, embedUrl);
    
  } catch (error) {
    console.error('Error proxying YouTube embed:', error);
    res.status(500).json({ error: "Failed to proxy YouTube embed" });
  }
}

/**
 * Proxy TikTok API requests to handle 403 Forbidden errors
 */
export async function proxyTiktokApi(req: Request, res: Response) {
  try {
    const originalUrl = req.originalUrl.replace('/api/embed/tiktok-api', '');
    const tiktokApiUrl = `https://www.tiktok.com${originalUrl}`;
    
    // Block problematic API endpoints that cause 403 errors
    if (originalUrl.includes('/api/related/item_list/') || 
        originalUrl.includes('/api/comment/') ||
        originalUrl.includes('/api/item/detail/')) {
      
      // Return mock data instead of making the actual request
      const mockData = {
        statusCode: 0,
        itemList: [],
        hasMore: 0,
        cursor: 0,
        extra: {
          logid: "mock_logid",
          now: Date.now()
        }
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.json(mockData);
      return;
    }
    
    // For other API requests, try to proxy them
    const headers: Record<string, string> = {};
    
    // Copy relevant headers from request
    Object.keys(req.headers).forEach(key => {
      const value = req.headers[key];
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
    
    // Add required headers for TikTok
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    headers['Referer'] = 'https://www.tiktok.com/';
    headers['Origin'] = 'https://www.tiktok.com';
    
    const response = await fetch(tiktokApiUrl, {
      method: req.method,
      headers: headers
    });
    
    if (!response.ok) {
      // If TikTok returns 403, return empty data
      if (response.status === 403) {
        const emptyData = {
          statusCode: 0,
          itemList: [],
          hasMore: 0,
          cursor: 0,
          extra: {
            logid: "blocked_logid",
            now: Date.now()
          }
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.json(emptyData);
        return;
      }
      
      throw new Error(`TikTok API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.json(data);
    
  } catch (error) {
    console.error('Error proxying TikTok API:', error);
    
    // Return empty data on error
    const emptyData = {
      statusCode: 0,
      itemList: [],
      hasMore: 0,
      cursor: 0,
      extra: {
        logid: "error_logid",
        now: Date.now()
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.json(emptyData);
  }
}
