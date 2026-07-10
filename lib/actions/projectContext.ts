'use server';

import { cookies } from 'next/headers';
import { auth } from '@/auth';
import { getPrisma } from '@/lib/database/dbClient';

// In-Memory state for sandbox mode fallback
let inMemoryOrg: any = null;
let inMemoryProjects: any[] = [];

export interface ProjectContext {
  projectId: string;
  projectName: string;
  projectSlug: string;
  organizationId: string;
  organizationName: string;
  userId: string;
}

export async function getActiveProject(): Promise<ProjectContext> {
  const session = await auth();
  const userId = session?.user?.id || 'sandbox-admin-id';
  const email = session?.user?.email || 'admin@gmail.com';
  
  const cookieStore = await cookies();
  let cookieVal = cookieStore.get('active_project_id')?.value;
  
  const prisma = getPrisma();
  
  if (prisma) {
    // Ensure the User exists in the database to avoid organization owner foreign key violation
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      await prisma.user.create({
        data: {
          id: userId,
          email: email,
          name: email.split('@')[0],
          role: 'admin',
          status: 'active'
        }
      });
    }

    // 1. Check if user has an organization. If not, create one.
    let org = await prisma.organization.findFirst({
      where: { ownerId: userId }
    });
    
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: `${email.split('@')[0]}'s Organization`,
          slug: `${email.split('@')[0].toLowerCase()}-${Date.now().toString().slice(-4)}-org`,
          ownerId: userId,
          plan: 'free',
          status: 'active'
        }
      });
    }
    
    // 2. Fetch projects for this organization
    let projects = await prisma.project.findMany({
      where: { organizationId: org.id }
    });
    
    if (projects.length === 0) {
      // Create default project
      const defaultProj = await prisma.project.create({
        data: {
          name: 'Study Materials',
          slug: 'study-materials',
          organizationId: org.id
        }
      });
      projects = [defaultProj];
    }
    
    // 3. Resolve active project from cookie or default to first project
    let activeProj = projects.find(p => p.id === cookieVal);
    if (!activeProj) {
      activeProj = projects[0];
      try {
        cookieStore.set('active_project_id', activeProj.id, { httpOnly: true, path: '/' });
      } catch (e) {
        // Safe fallback: ignores writing during layouts render phase
      }
    }
    
    return {
      projectId: activeProj.id,
      projectName: activeProj.name,
      projectSlug: activeProj.slug,
      organizationId: org.id,
      organizationName: org.name,
      userId
    };
  } else {
    // Memory fallback mode
    if (!inMemoryOrg) {
      inMemoryOrg = {
        id: 'org_sandbox_1',
        name: 'Sandbox Organization',
        slug: 'sandbox-org',
        ownerId: userId
      };
    }
    if (inMemoryProjects.length === 0) {
      inMemoryProjects.push({
        id: 'proj_sandbox_1', // match seeded projects
        name: 'Study Materials',
        slug: 'study-materials',
        organizationId: inMemoryOrg.id
      });
    }
    
    let activeProj = inMemoryProjects.find(p => p.id === cookieVal);
    if (!activeProj) {
      activeProj = inMemoryProjects[0];
      try {
        cookieStore.set('active_project_id', activeProj.id, { httpOnly: true, path: '/' });
      } catch (e) {
        // Safe fallback: ignores writing during layouts render phase
      }
    }
    
    return {
      projectId: activeProj.id,
      projectName: activeProj.name,
      projectSlug: activeProj.slug,
      organizationId: inMemoryOrg.id,
      organizationName: inMemoryOrg.name,
      userId
    };
  }
}

export async function setActiveProjectAction(projectId: string) {
  const cookieStore = await cookies();
  cookieStore.set('active_project_id', projectId, { httpOnly: true, path: '/' });
  return { success: true };
}

export async function getProjectsAction() {
  const session = await auth();
  const userId = session?.user?.id || 'sandbox-admin-id';
  const prisma = getPrisma();

  if (prisma) {
    const org = await prisma.organization.findFirst({
      where: { ownerId: userId }
    });
    if (!org) return [];
    return prisma.project.findMany({
      where: { organizationId: org.id }
    });
  } else {
    if (inMemoryProjects.length === 0) {
      inMemoryProjects.push({
        id: 'proj_sandbox_1',
        name: 'Study Materials',
        slug: 'study-materials',
        organizationId: 'org_sandbox_1'
      });
    }
    return inMemoryProjects;
  }
}

export async function createProjectAction(name: string, slug: string, description?: string) {
  const session = await auth();
  const userId = session?.user?.id || 'sandbox-admin-id';
  const prisma = getPrisma();
  const projectSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (prisma) {
    // Ensure the User exists in the database to avoid organization owner foreign key violation
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      const email = session?.user?.email || 'admin@gmail.com';
      await prisma.user.create({
        data: {
          id: userId,
          email: email,
          name: email.split('@')[0],
          role: 'admin',
          status: 'active'
        }
      });
    }

    let org = await prisma.organization.findFirst({
      where: { ownerId: userId }
    });
    if (!org) {
      const email = session?.user?.email || 'admin@gmail.com';
      org = await prisma.organization.create({
        data: {
          name: `${email.split('@')[0]}'s Organization`,
          slug: `${email.split('@')[0].toLowerCase()}-${Date.now().toString().slice(-4)}-org`,
          ownerId: userId,
          plan: 'free',
          status: 'active'
        }
      });
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        slug: projectSlug,
        description,
        organizationId: org.id
      }
    });

    const cookieStore = await cookies();
    cookieStore.set('active_project_id', newProject.id, { httpOnly: true, path: '/' });

    return { success: true, project: newProject };
  } else {
    const newProject = {
      id: `proj_sandbox_${Date.now()}`,
      name,
      slug: projectSlug,
      description,
      organizationId: 'org_sandbox_1'
    };
    inMemoryProjects.push(newProject);

    const cookieStore = await cookies();
    cookieStore.set('active_project_id', newProject.id, { httpOnly: true, path: '/' });

    return { success: true, project: newProject };
  }
}
