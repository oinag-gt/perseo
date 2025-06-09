"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonIdSchema = exports.PersonSearchSchema = exports.UpdatePersonSchema = exports.CreatePersonSchema = exports.CommunicationPreferencesSchema = exports.EmergencyContactSchema = exports.AddressSchema = void 0;
const zod_1 = require("zod");
const person_1 = require("../types/person");
exports.AddressSchema = zod_1.z.object({
    street: zod_1.z.string().min(1, 'Street is required').max(200, 'Street must be less than 200 characters'),
    city: zod_1.z.string().min(1, 'City is required').max(100, 'City must be less than 100 characters'),
    state: zod_1.z.string().min(1, 'State is required').max(100, 'State must be less than 100 characters'),
    postalCode: zod_1.z.string().min(1, 'Postal code is required').max(20, 'Postal code must be less than 20 characters'),
    country: zod_1.z.string().min(1, 'Country is required').max(100, 'Country must be less than 100 characters'),
});
exports.EmergencyContactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Emergency contact name is required').max(100, 'Name must be less than 100 characters'),
    relationship: zod_1.z.string().min(1, 'Relationship is required').max(50, 'Relationship must be less than 50 characters'),
    phone: zod_1.z.string().min(1, 'Emergency contact phone is required').regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
    email: zod_1.z.string().email('Invalid email format').optional(),
});
exports.CommunicationPreferencesSchema = zod_1.z.object({
    email: zod_1.z.boolean(),
    sms: zod_1.z.boolean(),
    whatsapp: zod_1.z.boolean(),
}).refine((data) => data.email || data.sms || data.whatsapp, {
    message: 'At least one communication preference must be enabled',
});
exports.CreatePersonSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
    lastName: zod_1.z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
    email: zod_1.z.string().email('Invalid email format').max(100, 'Email must be less than 100 characters'),
    alternateEmails: zod_1.z.array(zod_1.z.string().email('Invalid email format')).optional(),
    phone: zod_1.z.string().min(1, 'Phone is required').regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
    alternatePhones: zod_1.z.array(zod_1.z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format')).optional(),
    birthDate: zod_1.z.string().refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime()) && parsed <= new Date();
    }, 'Birth date must be a valid date in the past'),
    nationalId: zod_1.z.string().min(1, 'National ID is required').max(20, 'National ID must be less than 20 characters'),
    nationalIdType: zod_1.z.nativeEnum(person_1.NationalIdType),
    gender: zod_1.z.nativeEnum(person_1.Gender).optional(),
    address: exports.AddressSchema,
    emergencyContact: exports.EmergencyContactSchema,
    preferredLanguage: zod_1.z.enum(['es', 'en']).default('es'),
    communicationPreferences: exports.CommunicationPreferencesSchema,
    photoUrl: zod_1.z.string().url('Invalid photo URL').optional(),
    notes: zod_1.z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
    tags: zod_1.z.array(zod_1.z.string().max(50, 'Tag must be less than 50 characters')).optional(),
});
exports.UpdatePersonSchema = exports.CreatePersonSchema.partial().extend({
    id: zod_1.z.string().uuid('Invalid person ID'),
});
exports.PersonSearchSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    nationalId: zod_1.z.string().optional(),
    gender: zod_1.z.nativeEnum(person_1.Gender).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    isActive: zod_1.z.boolean().optional(),
    createdAfter: zod_1.z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
    createdBefore: zod_1.z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
});
exports.PersonIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid person ID'),
});
//# sourceMappingURL=person.schema.js.map