import https from 'node:https';
import http from 'node:http';

/**
 * Render free-tier Web Services sleep after 15 minutes of inactivity.
 * Pinging the server's public URL through Render's external router every 14 minutes
 * keeps the instance active and prevents cold-start delays.
 */
export const keepServerAlive = () => {
  // Render automatically exposes RENDER_EXTERNAL_URL in its environment (e.g., https://my-service.onrender.com)
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || process.env.BACKEND_URL;

  if (!targetUrl) {
    console.log('[Keep-Alive] No public URL provided. (Set RENDER_EXTERNAL_URL or SERVER_URL in Render dashboard to enable self-ping).');
    return;
  }

  // Ping every 14 minutes (14 * 60 * 1000 ms), just before the 15-minute sleep threshold
  const INTERVAL_MS = 14 * 60 * 1000;
  const pingUrl = targetUrl.replace(/\/$/, '') + '/api/ping';

  console.log(`[Keep-Alive] Self-ping service started for: ${pingUrl} (every 14 mins)`);

  const ping = () => {
    try {
      const client = pingUrl.startsWith('https') ? https : http;
      const req = client.get(pingUrl, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`[Keep-Alive] Server ping successful at ${new Date().toLocaleTimeString()} (Status: ${res.statusCode})`);
        } else {
          console.warn(`[Keep-Alive] Ping returned status code ${res.statusCode}`);
        }
      });

      req.on('error', (err) => {
        console.error(`[Keep-Alive] Ping request failed:`, err.message);
      });

      // 10 second timeout for ping request
      req.setTimeout(10000, () => {
        req.destroy();
      });
    } catch (error) {
      console.error(`[Keep-Alive] Error during ping:`, error.message);
    }
  };

  // First ping after 1 minute of server startup, then every 14 minutes
  setTimeout(ping, 60 * 1000);
  const timer = setInterval(ping, INTERVAL_MS);

  // Unref timer so it doesn't block Node process termination if server is shutting down
  if (timer.unref) {
    timer.unref();
  }
};
