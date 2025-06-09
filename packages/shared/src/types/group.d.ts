export declare enum GroupType {
    ADMINISTRATIVE = "ADMINISTRATIVE",
    ACADEMIC = "ACADEMIC",
    SOCIAL = "SOCIAL",
    OTHER = "OTHER"
}
export interface Group {
    id: string;
    name: string;
    description?: string;
    type: GroupType;
    parentGroupId?: string;
    leaderId?: string;
    maxMembers?: number;
    isActive: boolean;
    metadata?: Record<string, any>;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    parentGroup?: Group;
    childGroups?: Group[];
    leader?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    memberships?: GroupMembership[];
}
export declare enum MembershipRole {
    MEMBER = "MEMBER",
    LEADER = "LEADER",
    COORDINATOR = "COORDINATOR"
}
export declare enum MembershipStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export interface GroupMembership {
    id: string;
    personId: string;
    groupId: string;
    role: MembershipRole;
    startDate: Date;
    endDate?: Date;
    status: MembershipStatus;
    reason?: string;
    addedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    person?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    group?: {
        id: string;
        name: string;
        type: GroupType;
    };
    addedByUser?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}
export interface CreateGroupRequest {
    name: string;
    description?: string;
    type: GroupType;
    parentGroupId?: string;
    leaderId?: string;
    maxMembers?: number;
    isActive?: boolean;
    metadata?: Record<string, any>;
}
export interface UpdateGroupRequest extends Partial<CreateGroupRequest> {
    id: string;
}
export interface GroupListResponse {
    data: Group[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GroupSearchParams {
    page?: number;
    limit?: number;
    search?: string;
    type?: GroupType;
    parentGroupId?: string;
    leaderId?: string;
    isActive?: boolean;
    hasMembers?: boolean;
    createdAfter?: string;
    createdBefore?: string;
}
export interface CreateMembershipRequest {
    personId: string;
    groupId: string;
    role?: MembershipRole;
    startDate: string;
    endDate?: string;
    status?: MembershipStatus;
    reason?: string;
}
export interface UpdateMembershipRequest extends Partial<CreateMembershipRequest> {
    id: string;
}
export interface MembershipListResponse {
    data: GroupMembership[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface MembershipSearchParams {
    page?: number;
    limit?: number;
    personId?: string;
    groupId?: string;
    role?: MembershipRole;
    status?: MembershipStatus;
    startDateAfter?: string;
    startDateBefore?: string;
    endDateAfter?: string;
    endDateBefore?: string;
    addedBy?: string;
}
export interface GroupHierarchy {
    id: string;
    name: string;
    type: GroupType;
    leaderId?: string;
    memberCount: number;
    children: GroupHierarchy[];
}
//# sourceMappingURL=group.d.ts.map