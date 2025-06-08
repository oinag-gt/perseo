import { z } from 'zod';
import { UserRole } from '../types';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  roles: z.array(z.nativeEnum(UserRole)),
  tenantId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isActive: z.boolean().optional(),
  roles: z.array(z.nativeEnum(UserRole)).optional(),
});

export type UserDto = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;