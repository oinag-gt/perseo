import { z } from 'zod';
import { DocumentType } from '../types/document';
export declare const CreateDocumentSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodNativeEnum<typeof DocumentType>;
    fileName: z.ZodString;
    mimeType: z.ZodEffects<z.ZodString, string, string>;
    fileSize: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
    personId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type?: DocumentType;
    name?: string;
    description?: string;
    personId?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
}, {
    type?: DocumentType;
    name?: string;
    description?: string;
    personId?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
}>;
export declare const UpdateDocumentSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodNativeEnum<typeof DocumentType>>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    fileName: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    fileSize: z.ZodOptional<z.ZodNumber>;
} & {
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: DocumentType;
    name?: string;
    description?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
}, {
    id?: string;
    type?: DocumentType;
    name?: string;
    description?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
}>;
export declare const DocumentSearchSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    personId: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof DocumentType>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    createdAfter: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    createdBefore: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    search?: string;
    type?: DocumentType;
    isActive?: boolean;
    personId?: string;
    page?: number;
    limit?: number;
    createdAfter?: string;
    createdBefore?: string;
}, {
    search?: string;
    type?: DocumentType;
    isActive?: boolean;
    personId?: string;
    page?: number;
    limit?: number;
    createdAfter?: string;
    createdBefore?: string;
}>;
export declare const DocumentIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
export declare const DocumentUploadSchema: z.ZodObject<{
    file: z.ZodEffects<z.ZodEffects<z.ZodAny, any, any>, any, any>;
    name: z.ZodString;
    type: z.ZodNativeEnum<typeof DocumentType>;
    description: z.ZodOptional<z.ZodString>;
    personId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type?: DocumentType;
    name?: string;
    description?: string;
    personId?: string;
    file?: any;
}, {
    type?: DocumentType;
    name?: string;
    description?: string;
    personId?: string;
    file?: any;
}>;
export declare const DocumentByPersonSchema: z.ZodObject<{
    personId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    personId?: string;
}, {
    personId?: string;
}>;
//# sourceMappingURL=document.schema.d.ts.map