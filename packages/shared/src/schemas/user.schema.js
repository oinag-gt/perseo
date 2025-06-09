"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
exports.userSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    isActive: zod_1.z.boolean(),
    isEmailVerified: zod_1.z.boolean(),
    roles: zod_1.z.array(zod_1.z.nativeEnum(types_1.UserRole)),
    tenantId: zod_1.z.string().uuid().optional(),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
exports.updateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    roles: zod_1.z.array(zod_1.z.nativeEnum(types_1.UserRole)).optional(),
});
//# sourceMappingURL=user.schema.js.map