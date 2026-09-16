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
import { DatabaseService } from './db.js';

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
    database: {
      connected: DatabaseService.isConnected(),
      provider: 'supabase'
    },
    game: {
      round: gameEngine.getRoundState()
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, teamName, password, playerName } = req.body;
  const realm = (teamName || (username && !playerName ? username : '')).toString().trim();
  const player = (playerName || (teamName && username ? username : '')).toString().trim();

  if (!realm || !password) {
    return res.status(400).json({ error: 'Team name / realm identifier and password are required' });
  }

  const result = authenticateUser(realm, password, player || undefined);
  if (!result) {
    return res.status(401).json({ error: 'Invalid elemental credentials or realm identifier' });
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
 * - Unauthenticated requests are rejected with 401.
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
const candidatePaths = [
  path.resolve(process.cwd(), 'dist/client'),
  path.resolve(__dirname, '../client'),
  path.resolve(__dirname, '../../dist/client')
];

let clientDistPath: string | null = null;
for (const cand of candidatePaths) {
  if (fs.existsSync(cand) && fs.existsSync(path.join(cand, 'index.html'))) {
    clientDistPath = cand;
    break;
  }
}

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath!, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`🚀 THE FIVE ELEMENTS - IMPOSTER server running at http://localhost:${PORT}`);
});
