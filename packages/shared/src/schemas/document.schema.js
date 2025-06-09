"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentByPersonSchema = exports.DocumentUploadSchema = exports.DocumentIdSchema = exports.DocumentSearchSchema = exports.UpdateDocumentSchema = exports.CreateDocumentSchema = void 0;
const zod_1 = require("zod");
const document_1 = require("../types/document");
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    ...ALLOWED_IMAGE_TYPES,
];
exports.CreateDocumentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Document name is required').max(100, 'Document name must be less than 100 characters'),
    type: zod_1.z.nativeEnum(document_1.DocumentType),
    fileName: zod_1.z.string().min(1, 'File name is required').max(255, 'File name must be less than 255 characters'),
    mimeType: zod_1.z.string().refine((mimeType) => ALLOWED_DOCUMENT_TYPES.includes(mimeType), 'File type not allowed'),
    fileSize: zod_1.z.number().int().min(1, 'File size must be greater than 0').max(MAX_FILE_SIZE, 'File size must be less than 10MB'),
    description: zod_1.z.string().max(500, 'Description must be less than 500 characters').optional(),
    personId: zod_1.z.string().uuid('Invalid person ID'),
});
exports.UpdateDocumentSchema = exports.CreateDocumentSchema.omit({ personId: true }).partial().extend({
    id: zod_1.z.string().uuid('Invalid document ID'),
});
exports.DocumentSearchSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    personId: zod_1.z.string().uuid().optional(),
    type: zod_1.z.nativeEnum(document_1.DocumentType).optional(),
    isActive: zod_1.z.boolean().optional(),
    search: zod_1.z.string().optional(),
    createdAfter: zod_1.z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
    createdBefore: zod_1.z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
});
exports.DocumentIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid document ID'),
});
exports.DocumentUploadSchema = zod_1.z.object({
    file: zod_1.z.any().refine((file) => {
        return file && file.size <= MAX_FILE_SIZE;
    }, 'File size must be less than 10MB').refine((file) => {
        return file && ALLOWED_DOCUMENT_TYPES.includes(file.mimetype);
    }, 'File type not allowed'),
    name: zod_1.z.string().min(1, 'Document name is required').max(100, 'Document name must be less than 100 characters'),
    type: zod_1.z.nativeEnum(document_1.DocumentType),
    description: zod_1.z.string().max(500, 'Description must be less than 500 characters').optional(),
    personId: zod_1.z.string().uuid('Invalid person ID'),
});
exports.DocumentByPersonSchema = zod_1.z.object({
    personId: zod_1.z.string().uuid('Invalid person ID'),
});
//# sourceMappingURL=document.schema.js.map