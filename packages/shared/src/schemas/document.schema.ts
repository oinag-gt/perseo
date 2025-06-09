import { z } from 'zod';
import { DocumentType } from '../types/document';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  ...ALLOWED_IMAGE_TYPES,
];

export const CreateDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(100, 'Document name must be less than 100 characters'),
  type: z.nativeEnum(DocumentType),
  fileName: z.string().min(1, 'File name is required').max(255, 'File name must be less than 255 characters'),
  mimeType: z.string().refine(
    (mimeType) => ALLOWED_DOCUMENT_TYPES.includes(mimeType),
    'File type not allowed'
  ),
  fileSize: z.number().int().min(1, 'File size must be greater than 0').max(MAX_FILE_SIZE, 'File size must be less than 10MB'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  personId: z.string().uuid('Invalid person ID'),
});

export const UpdateDocumentSchema = CreateDocumentSchema.omit({ personId: true }).partial().extend({
  id: z.string().uuid('Invalid document ID'),
});

export const DocumentSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  personId: z.string().uuid().optional(),
  type: z.nativeEnum(DocumentType).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  createdAfter: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
  createdBefore: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
});

export const DocumentIdSchema = z.object({
  id: z.string().uuid('Invalid document ID'),
});

export const DocumentUploadSchema = z.object({
  file: z.any().refine((file) => {
    return file && file.size <= MAX_FILE_SIZE;
  }, 'File size must be less than 10MB').refine((file) => {
    return file && ALLOWED_DOCUMENT_TYPES.includes(file.mimetype);
  }, 'File type not allowed'),
  name: z.string().min(1, 'Document name is required').max(100, 'Document name must be less than 100 characters'),
  type: z.nativeEnum(DocumentType),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  personId: z.string().uuid('Invalid person ID'),
});

export const DocumentByPersonSchema = z.object({
  personId: z.string().uuid('Invalid person ID'),
});