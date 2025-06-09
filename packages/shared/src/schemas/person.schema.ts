import { z } from 'zod';
import { Gender, NationalIdType } from '../types/person';

export const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(200, 'Street must be less than 200 characters'),
  city: z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
  state: z.string().min(1, 'State is required').max(100, 'State must be less than 100 characters'),
  postalCode: z.string().min(1, 'Postal code is required').max(20, 'Postal code must be less than 20 characters'),
  country: z.string().min(1, 'Country is required').max(100, 'Country must be less than 100 characters'),
});

export const EmergencyContactSchema = z.object({
  name: z.string().min(1, 'Emergency contact name is required').max(100, 'Name must be less than 100 characters'),
  relationship: z.string().min(1, 'Relationship is required').max(50, 'Relationship must be less than 50 characters'),
  phone: z.string().min(1, 'Emergency contact phone is required').regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
  email: z.string().email('Invalid email format').optional(),
});

export const CommunicationPreferencesSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  whatsapp: z.boolean(),
}).refine(
  (data) => data.email || data.sms || data.whatsapp,
  {
    message: 'At least one communication preference must be enabled',
  }
);

export const CreatePersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email format').max(100, 'Email must be less than 100 characters'),
  alternateEmails: z.array(z.string().email('Invalid email format')).optional(),
  phone: z.string().min(1, 'Phone is required').regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
  alternatePhones: z.array(z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')).optional(),
  birthDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed <= new Date();
  }, 'Birth date must be a valid date in the past'),
  nationalId: z.string().min(1, 'National ID is required').max(20, 'National ID must be less than 20 characters'),
  nationalIdType: z.nativeEnum(NationalIdType),
  gender: z.nativeEnum(Gender).optional(),
  address: AddressSchema,
  emergencyContact: EmergencyContactSchema,
  preferredLanguage: z.enum(['es', 'en']).default('es'),
  communicationPreferences: CommunicationPreferencesSchema,
  photoUrl: z.string().url('Invalid photo URL').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).optional(),
});

export const UpdatePersonSchema = CreatePersonSchema.partial().extend({
  id: z.string().uuid('Invalid person ID'),
});

export const PersonSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  email: z.string().email().optional(),
  nationalId: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  createdAfter: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
  createdBefore: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
});

export const PersonIdSchema = z.object({
  id: z.string().uuid('Invalid person ID'),
});