import { z } from 'zod';
import { GroupType, MembershipRole, MembershipStatus } from '../types/group';

export const CreateGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  type: z.nativeEnum(GroupType),
  parentGroupId: z.string().uuid('Invalid parent group ID').optional(),
  leaderId: z.string().uuid('Invalid leader ID').optional(),
  maxMembers: z.number().int().min(1, 'Max members must be at least 1').optional(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

export const UpdateGroupSchema = CreateGroupSchema.partial().extend({
  id: z.string().uuid('Invalid group ID'),
});

export const GroupSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.nativeEnum(GroupType).optional(),
  parentGroupId: z.string().uuid().optional(),
  leaderId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  hasMembers: z.boolean().optional(),
  createdAfter: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
  createdBefore: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
});

export const GroupIdSchema = z.object({
  id: z.string().uuid('Invalid group ID'),
});

export const CreateMembershipSchema = z.object({
  personId: z.string().uuid('Invalid person ID'),
  groupId: z.string().uuid('Invalid group ID'),
  role: z.nativeEnum(MembershipRole).default(MembershipRole.MEMBER),
  startDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Start date must be a valid date'),
  endDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'End date must be a valid date').optional(),
  status: z.nativeEnum(MembershipStatus).default(MembershipStatus.ACTIVE),
  reason: z.string().max(200, 'Reason must be less than 200 characters').optional(),
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

export const UpdateMembershipSchema = z.object({
  id: z.string().uuid('Invalid membership ID'),
  personId: z.string().uuid('Invalid person ID').optional(),
  groupId: z.string().uuid('Invalid group ID').optional(),
  role: z.nativeEnum(MembershipRole).optional(),
  startDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Start date must be a valid date').optional(),
  endDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'End date must be a valid date').optional(),
  status: z.nativeEnum(MembershipStatus).optional(),
  reason: z.string().max(200, 'Reason must be less than 200 characters').optional(),
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

export const MembershipSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  personId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  role: z.nativeEnum(MembershipRole).optional(),
  status: z.nativeEnum(MembershipStatus).optional(),
  startDateAfter: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
  startDateBefore: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
  endDateAfter: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
  endDateBefore: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Invalid date format').optional(),
  addedBy: z.string().uuid().optional(),
});

export const MembershipIdSchema = z.object({
  id: z.string().uuid('Invalid membership ID'),
});

export const GroupMembershipParamsSchema = z.object({
  groupId: z.string().uuid('Invalid group ID'),
  personId: z.string().uuid('Invalid person ID'),
});