import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { getActiveProject } from '@/lib/actions/projectContext';
import ErrorBoundary from '@/components/admin/ErrorBoundary';

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

  const emailVerified = (session.user as any)?.emailVerified;

  // 3. Admin / Moderator Console capability guard: Only administrators and moderators are allowed.
  const isAdminOrMod = role === 'admin' || role === 'moderator';
  if (!isAdminOrMod) {
    redirect('/unauthorized?reason=admin-required');
  }

  const activeProject = await getActiveProject();

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 min-h-[calc(100vh-2rem)] items-stretch">
      <AdminSidebar activeProject={activeProject} userRole={role} emailVerified={emailVerified} />
      <div className="flex-1 min-w-0 h-[calc(100vh-2rem)] overflow-y-auto pr-2 custom-scrollbar pb-24 md:pb-0">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
}
