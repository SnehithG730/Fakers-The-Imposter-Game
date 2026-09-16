import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthSession, TeamId, UserRole } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'five-elements-imposter-secret-key-2026-production';
const TOKEN_EXPIRY = '24h';

interface UserAccount {
  username: string;
  role: UserRole;
  teamId?: TeamId;
  displayName: string;
  passwordHash: string;
}

const SALT = bcrypt.genSaltSync(10);

const ACCOUNTS: Record<string, UserAccount> = {
  admin: {
    username: 'admin',
    role: 'ADMIN',
    displayName: 'Supreme Arbiter (Admin)',
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Adm!N7308', SALT)
  },
  prudhvi: {
    username: 'prudhvi',
    role: 'TEAM',
    teamId: 'prudhvi',
    displayName: 'Prudhvi (Earth)',
    passwordHash: bcrypt.hashSync(process.env.PRUDHVI_PASSWORD || 'PruD#v!236;', SALT)
  },
  vayu: {
    username: 'vayu',
    role: 'TEAM',
    teamId: 'vayu',
    displayName: 'Vayu (Air)',
    passwordHash: bcrypt.hashSync(process.env.VAYU_PASSWORD || 'V@yU378', SALT)
  },
  jal: {
    username: 'jal',
    role: 'TEAM',
    teamId: 'jal',
    displayName: 'Jal (Water)',
    passwordHash: bcrypt.hashSync(process.env.JAL_PASSWORD || 'J@L135', SALT)
  },
  aakash: {
    username: 'aakash',
    role: 'TEAM',
    teamId: 'aakash',
    displayName: 'Aakash (Cosmos)',
    passwordHash: bcrypt.hashSync(process.env.AAKASH_PASSWORD || 'A@Ka$H124', SALT)
  },
  agni: {
    username: 'agni',
    role: 'TEAM',
    teamId: 'agni',
    displayName: 'Agni (Fire)',
    passwordHash: bcrypt.hashSync(process.env.AGNI_PASSWORD || '@Gn!246', SALT)
  }
};

export function authenticateUser(username: string, password: string): { session: AuthSession; token: string } | null {
  const normalizedUser = username.trim().toLowerCase();
  const account = ACCOUNTS[normalizedUser];
  if (!account) return null;

  const isMatch = bcrypt.compareSync(password, account.passwordHash);
  if (!isMatch) return null;

  const session: AuthSession = {
    username: account.username,
    role: account.role,
    teamId: account.teamId,
    displayName: account.displayName
  };

  const token = jwt.sign(session, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  return { session, token };
}

export function verifyToken(token: string): AuthSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthSession;
    return decoded;
  } catch {
    return null;
  }
}
