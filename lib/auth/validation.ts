import { z } from 'zod';

const reservedUsernames = [
  'admin', 'api', 'support', 'login', 'root', 'studymaterial', 'moderator',
  'system', 'help', 'billing', 'security', 'auth', 'oauth', 'register', 'signup'
];

export const commonPasswords = [
  'password123', '123456789', 'studymaterial', 'welcome123', 'admin123', 'password123!'
];

export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .refine(val => !commonPasswords.includes(val.toLowerCase()), 'Password is too common or easily guessable');

export const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    username: z
      .string()
      .min(3, 'Username must be 3-30 characters')
      .max(30, 'Username must be 3-30 characters')
      .regex(/^[a-zA-Z0-9_\.]+$/, 'Username can only contain letters, numbers, underscores, and periods')
      .refine(val => !val.includes(' '), 'Username cannot contain spaces')
      .refine(val => !reservedUsernames.includes(val.toLowerCase()), 'Username is reserved'),
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    password: passwordSchema,
  })
  .refine(data => data.password.toLowerCase() !== data.username.toLowerCase(), {
    message: 'Password cannot be equal to your username',
    path: ['password'],
  })
  .refine(data => data.password.toLowerCase() !== data.email.toLowerCase(), {
    message: 'Password cannot be equal to your email',
    path: ['password'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: passwordSchema,
});
