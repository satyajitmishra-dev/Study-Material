import { getPrisma } from '@/lib/database/dbClient';

/**
 * Handles account linking and duplicate prevention during OAuth workflows
 */
export async function handleOAuthSignIn({
  user,
  account
}: {
  user: any;
  account: any;
}) {
  if (!user.email) return false;

  const prisma = getPrisma();
  if (!prisma) return true; // Dev sandbox fallback

  const email = user.email.toLowerCase().trim();

  // Check if a user with this email address already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true }
  });

  if (existingUser) {
    // If the provider isn't Credentials, dynamically link the OAuth identity
    if (account && account.provider !== 'credentials') {
      const isAlreadyLinked = existingUser.accounts.some(
        acc => acc.provider === account.provider
      );

      if (!isAlreadyLinked) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          }
        });
        console.log(`[OAuth Linker] Linked provider ${account.provider} to user email ${email}`);
      }
    }

    // Enforce suspension lock policies
    if (existingUser.status === 'disabled') {
      return false;
    }
  }

  return true;
}
