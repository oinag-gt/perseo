"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupMembershipParamsSchema = exports.MembershipIdSchema = exports.MembershipSearchSchema = exports.UpdateMembershipSchema = exports.CreateMembershipSchema = exports.GroupIdSchema = exports.GroupSearchSchema = exports.UpdateGroupSchema = exports.CreateGroupSchema = void 0;
const zod_1 = require("zod");
const group_1 = require("../types/group");
exports.CreateGroupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Group name is required').max(100, 'Group name must be less than 100 characters'),
    description: zod_1.z.string().max(500, 'Description must be less than 500 characters').optional(),
    type: zod_1.z.nativeEnum(group_1.GroupType),
    parentGroupId: zod_1.z.string().uuid('Invalid parent group ID').optional(),
    leaderId: zod_1.z.string().uuid('Invalid leader ID').optional(),
    maxMembers: zod_1.z.number().int().min(1, 'Max members must be at least 1').optional(),
    isActive: zod_1.z.boolean().default(true),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.UpdateGroupSchema = exports.CreateGroupSchema.partial().extend({
    id: zod_1.z.string().uuid('Invalid group ID'),
});
exports.GroupSearchSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    search: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(group_1.GroupType).optional(),
    parentGroupId: zod_1.z.string().uuid().optional(),
    leaderId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.boolean().optional(),
    hasMembers: zod_1.z.boolean().optional(),
    createdAfter: zod_1.z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
    createdBefore: zod_1.z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
});
exports.GroupIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid group ID'),
});
exports.CreateMembershipSchema = zod_1.z.object({
    personId: zod_1.z.string().uuid('Invalid person ID'),
    groupId: zod_1.z.string().uuid('Invalid group ID'),
    role: zod_1.z.nativeEnum(group_1.MembershipRole).default(group_1.MembershipRole.MEMBER),
    startDate: zod_1.z.string().refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
    }, 'Start date must be a valid date'),
    endDate: zod_1.z.string().refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
    }, 'End date must be a valid date').optional(),
    status: zod_1.z.nativeEnum(group_1.MembershipStatus).default(group_1.MembershipStatus.ACTIVE),
    reason: zod_1.z.string().max(200, 'Reason must be less than 200 characters').optional(),
}).refine((data) => {
    if (data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return endDate >= startDate;
    }
    return true;
}, {
    message: 'End date must be after start date',
    path: ['endDate'],
});
exports.UpdateMembershipSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid membership ID'),
    personId: zod_1.z.string().uuid('Invalid person ID').optional(),
    groupId: zod_1.z.string().uuid('Invalid group ID').optional(),
    role: zod_1.z.nativeEnum(group_1.MembershipRole).optional(),
    startDate: zod_1.z.string().refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
    }, 'Start date must be a valid date').optional(),
    endDate: zod_1.z.string().refine((date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime());
    }, 'End date must be a valid date').optional(),
    status: zod_1.z.nativeEnum(group_1.MembershipStatus).optional(),
    reason: zod_1.z.string().max(200, 'Reason must be less than 200 characters').optional(),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return endDate >= startDate;
    }
    return true;
}, {
    message: 'End date must be after start date',
    path: ['endDate'],
});
exports.MembershipSearchSchema = zod_1.z.object({
    page: zod_1.z.number().int().min(1).default(1),
    limit: zod_1.z.number().int().min(1).max(100).default(20),
    personId: zod_1.z.string().uuid().optional(),
    groupId: zod_1.z.string().uuid().optional(),
    role: zod_1.z.nativeEnum(group_1.MembershipRole).optional(),
    status: zod_1.z.nativeEnum(group_1.MembershipStatus).optional(),
    startDateAfter: zod_1.z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
    startDateBefore: zod_1.z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
    endDateAfter: zod_1.z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
    endDateBefore: zod_1.z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
    addedBy: zod_1.z.string().uuid().optional(),
});
exports.MembershipIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid membership ID'),
});
exports.GroupMembershipParamsSchema = zod_1.z.object({
    groupId: zod_1.z.string().uuid('Invalid group ID'),
    personId: zod_1.z.string().uuid('Invalid person ID'),
});
//# sourceMappingURL=group.schema.js.map