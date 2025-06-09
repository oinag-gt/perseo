"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipStatus = exports.MembershipRole = exports.GroupType = void 0;
var GroupType;
(function (GroupType) {
    GroupType["ADMINISTRATIVE"] = "ADMINISTRATIVE";
    GroupType["ACADEMIC"] = "ACADEMIC";
    GroupType["SOCIAL"] = "SOCIAL";
    GroupType["OTHER"] = "OTHER";
})(GroupType || (exports.GroupType = GroupType = {}));
var MembershipRole;
(function (MembershipRole) {
    MembershipRole["MEMBER"] = "MEMBER";
    MembershipRole["LEADER"] = "LEADER";
    MembershipRole["COORDINATOR"] = "COORDINATOR";
})(MembershipRole || (exports.MembershipRole = MembershipRole = {}));
var MembershipStatus;
(function (MembershipStatus) {
    MembershipStatus["ACTIVE"] = "ACTIVE";
    MembershipStatus["INACTIVE"] = "INACTIVE";
    MembershipStatus["SUSPENDED"] = "SUSPENDED";
})(MembershipStatus || (exports.MembershipStatus = MembershipStatus = {}));
//# sourceMappingURL=group.js.map