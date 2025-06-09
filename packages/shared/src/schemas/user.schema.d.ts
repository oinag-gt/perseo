import { z } from 'zod';
import { UserRole } from '../types';
export declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    isActive: z.ZodBoolean;
    isEmailVerified: z.ZodBoolean;
    roles: z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">;
    tenantId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    isActive?: boolean;
    email?: string;
    firstName?: string;
    lastName?: string;
    isEmailVerified?: boolean;
    roles?: UserRole[];
    tenantId?: string;
}, {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    isActive?: boolean;
    email?: string;
    firstName?: string;
    lastName?: string;
    isEmailVerified?: boolean;
    roles?: UserRole[];
    tenantId?: string;
}>;
export declare const updateUserSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    roles: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof UserRole>, "many">>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean;
    firstName?: string;
    lastName?: string;
    roles?: UserRole[];
}, {
    isActive?: boolean;
    firstName?: string;
    lastName?: string;
    roles?: UserRole[];
}>;
export type UserDto = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
//# sourceMappingURL=user.schema.d.ts.map