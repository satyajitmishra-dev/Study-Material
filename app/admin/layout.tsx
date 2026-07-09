import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

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

  // 3. CMS role guard: Admin, Editor, Author, and Viewer are authorized
  const isCmsUser = role === 'admin' || role === 'editor' || role === 'author' || role === 'viewer';
  if (!isCmsUser) {
    redirect('/unauthorized?reason=admin-only');
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 min-h-[calc(100vh-2rem)] items-stretch">
      <AdminSidebar />
      <div className="flex-1 min-w-0 h-[calc(100vh-2rem)] overflow-y-auto pr-2 custom-scrollbar pb-24 md:pb-0">
        {children}
      </div>
    </div>
  );
}
