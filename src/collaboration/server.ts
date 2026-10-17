import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'node:http';

type Client = { socket: WebSocket; userId: string; roomId: string; lastSeen: number };
const rooms = new Map<string, Set<Client>>();

export function createCollaborationServer(port = Number(process.env.COLLABORATION_PORT || 4100)) {
  const server = createServer();
  const wss = new WebSocketServer({ server, path: '/collaboration' });

  wss.on('connection', (socket, request) => {
    const url = new URL(request.url || '/', 'http://localhost');
    const roomId = url.searchParams.get('roomId');
    const userId = url.searchParams.get('userId');
    const token = url.searchParams.get('token') || url.searchParams.get('apiKey');
    if (!roomId || !userId) {
      socket.close(4400, 'roomId and userId are required');
      return;
    }

    const expectedKey = process.env.NOVA_API_KEY || process.env.NEXUS_API_KEY;
    const adminPassword = process.env.NOVA_ADMIN_PASSWORD;
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.NOVA_DEV_MODE !== 'true' &&
      process.env.ALLOW_ANONYMOUS_DEV !== 'true' &&
      (expectedKey || adminPassword)
    ) {
      const isAuthorized =
        (expectedKey && token === expectedKey) ||
        (adminPassword && token === adminPassword);
      if (!isAuthorized) {
        socket.close(4401, 'Unauthorized');
        return;
      }
    }
    const client: Client = { socket, roomId, userId, lastSeen: Date.now() };
    const room = rooms.get(roomId) || new Set<Client>();
    room.add(client);
    rooms.set(roomId, room);
    broadcast(room, { type: 'presence:join', userId, roomId });

    socket.on('message', (raw) => {
      client.lastSeen = Date.now();
      let message: Record<string, unknown>;
      try { message = JSON.parse(raw.toString()); } catch { return; }
      if (message.type === 'presence:heartbeat') return;
      broadcast(room, { ...message, userId, roomId }, socket);
    });
    socket.on('close', () => {
      room.delete(client);
      if (!room.size) rooms.delete(roomId);
      else broadcast(room, { type: 'presence:leave', userId, roomId });
    });
  });

  const expiry = setInterval(() => {
    const cutoff = Date.now() - 45_000;
    for (const [roomId, room] of rooms) {
      for (const client of room) if (client.lastSeen < cutoff) client.socket.terminate();
      if (!room.size) rooms.delete(roomId);
    }
  }, 15_000);
  expiry.unref();
  server.on('close', () => clearInterval(expiry));
  server.listen(port);
  return server;
}

function broadcast(room: Set<Client>, message: Record<string, unknown>, except?: WebSocket) {
  const payload = JSON.stringify(message);
  for (const client of room) if (client.socket !== except && client.socket.readyState === WebSocket.OPEN) client.socket.send(payload);
}

if (process.argv[1]?.endsWith('collaboration/server.ts')) createCollaborationServer();
