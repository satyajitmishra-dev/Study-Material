import { z } from 'zod';

export const CmsProjectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title is too long'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-_]+$/, 'Slug must be lower-case alphanumeric with dashes or underscores'),
  description: z.string().max(500, 'Description is too long').optional().nullable(),
  category: z.string().min(1, 'Category is required').optional().nullable(),
  tags: z.array(z.string()),
  language: z.string(),
  visibility: z.enum(['public', 'private', 'members']),
  thumbnail: z.string().or(z.literal('')).optional().nullable(),
  coverImage: z.string().or(z.literal('')).optional().nullable(),
  content: z.string(),
  seoTitle: z.string().max(70, 'Meta title must be under 70 characters').optional().nullable(),
  seoDescription: z.string().max(160, 'Meta description must be under 160 characters').optional().nullable(),
  seoKeywords: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  canonical: z.string().optional().nullable(),
  robots: z.string().optional().nullable(),
  schemaJson: z.string().optional().nullable(),
  seoScore: z.number().int().min(0).max(100),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  scheduledAt: z.string().optional().nullable(),
  versionNote: z.string().max(200, 'Version note is too long').optional().nullable(),
});

export type CmsProjectInput = z.infer<typeof CmsProjectSchema>;

export const CmsVersionSchema = z.object({
  projectId: z.string(),
  content: z.string(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  versionNote: z.string().optional().nullable(),
  authorId: z.string(),
});

export type CmsVersionInput = z.infer<typeof CmsVersionSchema>;

export const CmsMediaSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  url: z.string().min(1, 'Media URL is required'),
  size: z.number().int().positive(),
  type: z.string(),
  folder: z.string().default('/'),
  tags: z.array(z.string()).default([]),
});

export type CmsMediaInput = z.infer<typeof CmsMediaSchema>;

export const CmsAnalyticsSchema = z.object({
  projectId: z.string().optional().nullable(),
  visitorId: z.string(),
  userAgent: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  referer: z.string().optional().nullable(),
  views: z.number().int().default(1),
  ctr: z.number().default(0.0),
  bounceRate: z.number().default(0.0),
  timeOnPage: z.number().int().default(0),
});

export type CmsAnalyticsInput = z.infer<typeof CmsAnalyticsSchema>;
