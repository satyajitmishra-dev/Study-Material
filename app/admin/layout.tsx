import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. Session check
  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any)?.role;
  const status = (session.user as any)?.status;

  // 2. Disabled account guard
  if (status === 'disabled') {
    redirect('/unauthorized?reason=disabled');
  }

  // 3. Admin-only role guard
  if (role !== 'admin') {
    redirect('/unauthorized?reason=admin-only');
  }

  return <>{children}</>;
}
