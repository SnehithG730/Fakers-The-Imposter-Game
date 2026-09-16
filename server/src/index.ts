import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authenticateUser, verifyToken } from './auth.js';
import { GameEngine } from './gameEngine.js';
import { setupSocketHandler } from './socketHandler.js';
import { THEME_PRESETS, TEAM_METADATA } from './presets.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

const gameEngine = new GameEngine();

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

setupSocketHandler(io, gameEngine);

// --- REST API ENDPOINTS ---

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: Date.now(),
    game: {
      round: gameEngine.getRoundState()
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const result = authenticateUser(username, password);
  if (!result) {
    return res.status(401).json({ error: 'Invalid elemental credentials' });
  }

  return res.json(result);
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }

  return res.json({ session });
});

/**
 * Authoritative Role-Specific Projected State Endpoint:
 * - ADMIN receives full state (completeRoundState) including imposter identity & secret keyword.
 * - NORMAL TEAM receives { theme, role: 'TEAM', ownKeyword, ... }.
 * - IMPOSTER receives { theme, role: 'IMPOSTER', ownKeyword: null, ... }.
 * - Unauthenticated requests are rejected.
 */
app.get('/api/game/state', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Bearer token required' });
  }

  const token = authHeader.split(' ')[1];
  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  if (session.role === 'ADMIN') {
    return res.json({
      role: 'ADMIN',
      completeRoundState: gameEngine.getAdminPayload()
    });
  }

  if (session.role === 'TEAM' && session.teamId) {
    const teamPayload = gameEngine.getClientTeamPayload(session.teamId);
    return res.json(teamPayload);
  }

  return res.status(403).json({ error: 'Forbidden: Invalid role session' });
});

app.get('/api/presets', (req, res) => {
  res.json({
    presets: THEME_PRESETS,
    teams: TEAM_METADATA
  });
});

// Serve frontend static build
const clientDistPath = path.resolve(__dirname, '../../dist/client');
const clientAltPath = path.resolve(__dirname, '../client');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else if (fs.existsSync(clientAltPath)) {
  app.use(express.static(clientAltPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientAltPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`? THE FIVE ELEMENTS — IMPOSTER server running at http://localhost:${PORT}`);
});
