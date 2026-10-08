import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupWebSocket } from './websocket.js';
import { apiRouter } from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Initialize WebSocket server
setupWebSocket(server);

// Static assets if in production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>NEXUS AI Backend</title></head>
          <body style="font-family:sans-serif; background:#0b0f19; color:#f1f5f9; padding:2rem;">
            <h2>NEXUS AI Backend Server is Running on port ${PORT}</h2>
            <p>API endpoints available at <a href="/api/health" style="color:#38bdf8">/api/health</a></p>
            <p>Client frontend dev server runs at <a href="${CLIENT_URL}" style="color:#38bdf8">${CLIENT_URL}</a></p>
          </body>
        </html>
      `);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 NEXUS AI Multi-Agent Backend Server running on port ${PORT}`);
  console.log(`📡 WebSocket server initialized on ws://localhost:${PORT}`);
  console.log(`🔗 REST API available at http://localhost:${PORT}/api`);
  console.log(`======================================================\n`);
});
