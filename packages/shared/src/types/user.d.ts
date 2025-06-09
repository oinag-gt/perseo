export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    TENANT_ADMIN = "tenant_admin",
    INSTRUCTOR = "instructor",
    STUDENT = "student",
    MEMBER = "member"
}
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    isActive: boolean;
    isEmailVerified: boolean;
    roles: UserRole[];
    tenantId?: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=user.d.ts.map