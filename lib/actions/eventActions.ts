'use server';

import { auth } from '@/auth';
import { publicDb } from '@/lib/database/publicDb';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  eventType: z.string(),
  startAt: z.date(),
  endAt: z.date(),
  deadlineAt: z.date(),
  minTeamSize: z.number().default(1),
  maxTeamSize: z.number().default(4),
  onlineOffline: z.enum(['online', 'offline']),
  venue: z.string().optional(),
  contactEmail: z.string().email(),
  discordUrl: z.string().optional(),
  whatsappUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  certificate: z.boolean().default(false),
  prizes: z.string().optional(),
  rules: z.string().optional(),
  faq: z.string().optional(),
  timelineJson: z.string().optional(),
  judgesJson: z.string().optional(),
  sponsorsJson: z.string().optional(),
});

const registrationSchema = z.object({
  eventId: z.string(),
  fullName: z.string().min(2, 'Full Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  college: z.string().optional(),
  university: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  resumeUrl: z.string().optional(),
  teamName: z.string().optional(),
  teamMembers: z.array(z.string()).default([]), // Emails of team members
  customAnswers: z.string().optional(), // JSON response string
  consent: z.boolean().refine(v => v === true, 'Consent is required'),
});

export async function createEventAction(raw: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  const result = eventSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'VALIDATION_FAILED', details: result.error.flatten() };
  }

  const data = result.data;
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 7);

  try {
    const event = await publicDb.createEvent({
      ...data,
      slug,
      organizerId: session.user.id,
    });

    revalidatePath('/');
    revalidatePath('/community');
    return { success: true, event };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

export async function registerForEventAction(raw: any) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  const result = registrationSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'VALIDATION_FAILED', details: result.error.flatten() };
  }

  try {
    const registration = await publicDb.registerForEvent({
      ...result.data,
      userId: session.user.id,
    });

    revalidatePath(`/events/${raw.slug}`);
    return { success: true, registration };
  } catch (err: any) {
    if (err.message === 'ALREADY_REGISTERED') {
      return { success: false, error: 'ALREADY_REGISTERED' };
    }
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}

export async function getEventRegistrationsAction(eventId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'UNAUTHENTICATED' };
  }

  // Verification that user is the organizer of the event
  // Ideally, query the event first:
  // const event = await publicDb.getEventById(eventId)
  // if (event.organizerId !== session.user.id) return { success: false, error: 'UNAUTHORIZED' }

  try {
    const prisma = publicDb['prisma']; // Access inside database client
    let registrations: any[] = [];
    if (prisma) {
      registrations = await prisma.eventRegistration.findMany({
        where: { eventId },
        include: { user: true },
      });
    } else {
      // In-memory fallback
      const { inMemoryEventRegistrations } = require('@/lib/database/publicDb');
      registrations = inMemoryEventRegistrations.filter((r: any) => r.eventId === eventId);
    }

    return { success: true, registrations };
  } catch (err: any) {
    return { success: false, error: err.message || 'SERVER_ERROR' };
  }
}
