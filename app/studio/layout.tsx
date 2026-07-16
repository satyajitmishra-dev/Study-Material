import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import StudioSidebar from '@/components/studio/StudioSidebar';
import { getActiveProject } from '@/lib/actions/projectContext';

export default async function StudioLayout({
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

  const activeProject = await getActiveProject();

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 min-h-[calc(100vh-2rem)] items-stretch">
      <StudioSidebar activeProject={activeProject} userRole={role} />
      <div className="flex-1 min-w-0 h-[calc(100vh-2rem)] overflow-y-auto pr-2 custom-scrollbar pb-24 md:pb-0">
        {children}
      </div>
    </div>
  );
}
