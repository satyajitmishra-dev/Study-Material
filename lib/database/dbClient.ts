import { DatabaseAdapter, User, Account, Session } from './adapter';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Singleton Prisma Client
let globalPrisma: PrismaClient | undefined;

export const getPrisma = (): PrismaClient | null => {
  if (typeof window !== 'undefined') return null;
  if (!process.env.DATABASE_URL) return null;
  
  if (!globalPrisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    globalPrisma = new PrismaClient({ adapter });
  }
  return globalPrisma;
};

// --- 1. PRISMA DATABASE ADAPTER ---
class PrismaDatabaseAdapter implements DatabaseAdapter {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return { ...user, role: user.role as 'admin' | 'user', status: user.status as 'active' | 'disabled' };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return { ...user, role: user.role as 'admin' | 'user', status: user.status as 'active' | 'disabled' };
  }

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
      }
    });
    return { ...created, role: created.role as 'admin' | 'user', status: created.status as 'active' | 'disabled' };
  }

  async updateUserRole(id: string, role: 'admin' | 'user'): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { role }
    });
    return { ...updated, role: updated.role as 'admin' | 'user', status: updated.status as 'active' | 'disabled' };
  }

  async updateUserStatus(id: string, status: 'active' | 'disabled'): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status }
    });
    return { ...updated, role: updated.role as 'admin' | 'user', status: updated.status as 'active' | 'disabled' };
  }

  async createAccount(account: Account): Promise<Account> {
    const created = await this.prisma.account.create({
      data: {
        id: account.id,
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      }
    });
    return created;
  }

  async getAccountByProvider(provider: string, providerAccountId: string): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId
        }
      }
    });
    return account;
  }

  async createSession(session: Session): Promise<Session> {
    const created = await this.prisma.session.create({
      data: {
        id: session.id,
        sessionToken: session.sessionToken,
        userId: session.userId,
        expires: session.expires,
      }
    });
    return created;
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { sessionToken: token }
    });
    return session;
  }

  async updateSessionExpiration(token: string, expires: Date): Promise<Session> {
    const updated = await this.prisma.session.update({
      where: { sessionToken: token },
      data: { expires }
    });
    return updated;
  }

  async deleteSessionByToken(token: string): Promise<void> {
    await this.prisma.session.delete({
      where: { sessionToken: token }
    });
  }
}

// --- 2. TRANSIENT IN-MEMORY DATABASE ADAPTER (DEV SANBOX FALLBACK) ---
class MemoryDatabaseAdapter implements DatabaseAdapter {
  private users: Map<string, User> = new Map();
  private accounts: Map<string, Account> = new Map();
  private sessions: Map<string, Session> = new Map();

  constructor() {
    // Seed initial sandbox accounts for dev accessibility checks
    const devAdmin: User = {
      id: 'sandbox-admin-id',
      name: 'Sandbox Administrator',
      email: 'admin@gmail.com',
      emailVerified: new Date(),
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const devUser: User = {
      id: 'sandbox-user-id',
      name: 'Sandbox Developer',
      email: 'developer@gmail.com',
      emailVerified: new Date(),
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      role: 'user',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(devAdmin.id, devAdmin);
    this.users.set(devUser.id, devUser);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const created: User = {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(created.id, created);
    return created;
  }

  async updateUserRole(id: string, role: 'admin' | 'user'): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    const updated = { ...user, role, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async updateUserStatus(id: string, status: 'active' | 'disabled'): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    const updated = { ...user, status, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async createAccount(account: Account): Promise<Account> {
    this.accounts.set(account.id, account);
    return account;
  }

  async getAccountByProvider(provider: string, providerAccountId: string): Promise<Account | null> {
    for (const account of this.accounts.values()) {
      if (account.provider === provider && account.providerAccountId === providerAccountId) return account;
    }
    return null;
  }

  async createSession(session: Session): Promise<Session> {
    this.sessions.set(session.sessionToken, session);
    return session;
  }

  async getSessionByToken(token: string): Promise<Session | null> {
    return this.sessions.get(token) || null;
  }

  async updateSessionExpiration(token: string, expires: Date): Promise<Session> {
    const session = this.sessions.get(token);
    if (!session) throw new Error('Session not found');
    const updated = { ...session, expires };
    this.sessions.set(token, updated);
    return updated;
  }

  async deleteSessionByToken(token: string): Promise<void> {
    this.sessions.delete(token);
  }
}

// Instantiate and export active database adapter singleton
let activeAdapter: DatabaseAdapter;

const prisma = getPrisma();
if (prisma) {
  activeAdapter = new PrismaDatabaseAdapter(prisma);
  console.log('[StudyMaterial DB] Loaded Prisma Postgres Adapter');
} else {
  activeAdapter = new MemoryDatabaseAdapter();
  console.log('[StudyMaterial DB] Loaded Dev Transient Memory Adapter');
}

export const db = activeAdapter;
export { PrismaDatabaseAdapter, MemoryDatabaseAdapter };
