import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { WebSocketMessage } from './types.js';

let wss: WebSocketServer | null = null;
const clients: Set<WebSocket> = new Set();

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    // console.log(`[WS] Client connected. Active clients: ${clients.size}`);

    // Send initial greeting
    ws.send(
      JSON.stringify({
        type: 'connection_established',
        data: { message: 'Connected to NEXUS AI Real-Time Agent Stream' },
        timestamp: new Date().toISOString(),
      })
    );

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch (e) {
        // ignore non-json
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      // console.log(`[WS] Client disconnected. Active clients: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.error('[WS] Client error:', err);
      clients.delete(ws);
    });
  });

  // Keep-alive heartbeat every 30 seconds
  setInterval(() => {
    if (!wss) return;
    for (const ws of clients) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }
  }, 30000);

  return wss;
}

export function broadcast(message: WebSocketMessage) {
  const payload = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

export function broadcastEvent(type: string, missionId: string | undefined, data: any) {
  broadcast({
    type,
    mission_id: missionId,
    data,
    timestamp: new Date().toISOString(),
  });
}
