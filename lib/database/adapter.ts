export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  avatar: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface DatabaseAdapter {
  // Users
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUserRole(id: string, role: 'admin' | 'user'): Promise<User>;
  updateUserStatus(id: string, status: 'active' | 'disabled'): Promise<User>;

  // Accounts
  createAccount(account: Account): Promise<Account>;
  getAccountByProvider(provider: string, providerAccountId: string): Promise<Account | null>;

  // Sessions
  createSession(session: Session): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | null>;
  updateSessionExpiration(token: string, expires: Date): Promise<Session>;
  deleteSessionByToken(token: string): Promise<void>;
}
