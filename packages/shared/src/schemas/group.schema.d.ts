import { z } from 'zod';
import { GroupType, MembershipRole, MembershipStatus } from '../types/group';
export declare const CreateGroupSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodNativeEnum<typeof GroupType>;
    parentGroupId: z.ZodOptional<z.ZodString>;
    leaderId: z.ZodOptional<z.ZodString>;
    maxMembers: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type?: GroupType;
    name?: string;
    description?: string;
    isActive?: boolean;
    parentGroupId?: string;
    leaderId?: string;
    maxMembers?: number;
    metadata?: Record<string, any>;
}, {
    type?: GroupType;
    name?: string;
    description?: string;
    isActive?: boolean;
    parentGroupId?: string;
    leaderId?: string;
    maxMembers?: number;
    metadata?: Record<string, any>;
}>;
export declare const UpdateGroupSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof GroupType>>;
    parentGroupId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    leaderId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    maxMembers: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
} & {
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
    type?: GroupType;
    name?: string;
    description?: string;
    isActive?: boolean;
    parentGroupId?: string;
    leaderId?: string;
    maxMembers?: number;
    metadata?: Record<string, any>;
}, {
    id?: string;
    type?: GroupType;
    name?: string;
    description?: string;
    isActive?: boolean;
    parentGroupId?: string;
    leaderId?: string;
    maxMembers?: number;
    metadata?: Record<string, any>;
}>;
export declare const GroupSearchSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof GroupType>>;
    parentGroupId: z.ZodOptional<z.ZodString>;
    leaderId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    hasMembers: z.ZodOptional<z.ZodBoolean>;
    createdAfter: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    createdBefore: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
}, "strip", z.ZodTypeAny, {
    search?: string;
    type?: GroupType;
    isActive?: boolean;
    parentGroupId?: string;
    leaderId?: string;
    page?: number;
    limit?: number;
    createdAfter?: string;
    createdBefore?: string;
    hasMembers?: boolean;
}, {
    search?: string;
    type?: GroupType;
    isActive?: boolean;
    parentGroupId?: string;
    leaderId?: string;
    page?: number;
    limit?: number;
    createdAfter?: string;
    createdBefore?: string;
    hasMembers?: boolean;
}>;
export declare const GroupIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
export declare const CreateMembershipSchema: z.ZodEffects<z.ZodObject<{
    personId: z.ZodString;
    groupId: z.ZodString;
    role: z.ZodDefault<z.ZodNativeEnum<typeof MembershipRole>>;
    startDate: z.ZodEffects<z.ZodString, string, string>;
    endDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof MembershipStatus>>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    personId?: string;
    groupId?: string;
    startDate?: string;
    role?: MembershipRole;
    endDate?: string;
    status?: MembershipStatus;
    reason?: string;
}, {
    personId?: string;
    groupId?: string;
    startDate?: string;
    role?: MembershipRole;
    endDate?: string;
    status?: MembershipStatus;
    reason?: string;
}>, {
    personId?: string;
    groupId?: string;
    startDate?: string;
    role?: MembershipRole;
    endDate?: string;
    status?: MembershipStatus;
    reason?: string;
}, {
    personId?: string;
    groupId?: string;
    startDate?: string;
    role?: MembershipRole;
    endDate?: string;
    status?: MembershipStatus;
    reason?: string;
}>;
export declare const UpdateMembershipSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    personId: z.ZodOptional<z.ZodString>;
    groupId: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof MembershipRole>>;
    startDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    endDate: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof MembershipStatus>>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    personId?: string;
    groupId?: string;
    startDate?: string;
    role?: MembershipRole;
    endDate?: string;
    status?: MembershipStatus;
    reason?: string;
}, {
    id?: string;
    personId?: string;
    groupId?: string;
    startDate?: string;
    role?: MembershipRole;
    endDate?: string;
    status?: MembershipStatus;
    reason?: string;
}>, {
    id?: string;
    personId?: string;
    groupId?: string;
    startDate?: string;
    role?: MembershipRole;
    endDate?: string;
    status?: MembershipStatus;
    reason?: string;
}, {
    id?: string;
    personId?: string;
    groupId?: string;
    startDate?: string;
    role?: MembershipRole;
    endDate?: string;
    status?: MembershipStatus;
    reason?: string;
}>;
export declare const MembershipSearchSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    personId: z.ZodOptional<z.ZodString>;
    groupId: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof MembershipRole>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof MembershipStatus>>;
    startDateAfter: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    startDateBefore: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    endDateAfter: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    endDateBefore: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    addedBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    personId?: string;
    groupId?: string;
    role?: MembershipRole;
    status?: MembershipStatus;
    addedBy?: string;
    page?: number;
    limit?: number;
    startDateAfter?: string;
    startDateBefore?: string;
    endDateAfter?: string;
    endDateBefore?: string;
}, {
    personId?: string;
    groupId?: string;
    role?: MembershipRole;
    status?: MembershipStatus;
    addedBy?: string;
    page?: number;
    limit?: number;
    startDateAfter?: string;
    startDateBefore?: string;
    endDateAfter?: string;
    endDateBefore?: string;
}>;
export declare const MembershipIdSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id?: string;
}, {
    id?: string;
}>;
export declare const GroupMembershipParamsSchema: z.ZodObject<{
    groupId: z.ZodString;
    personId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    personId?: string;
    groupId?: string;
}, {
    personId?: string;
    groupId?: string;
}>;
//# sourceMappingURL=group.schema.d.ts.map