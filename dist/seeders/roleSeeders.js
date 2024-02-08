"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleSeeder = void 0;
const role_schema_1 = require("../models/role.schema");
const roles = [
    {
        name: 'ADMIN',
        permissions: []
    },
    {
        name: 'CUSTOMER',
        permissions: []
    }
];
const permissions = [
    { role: "ADMIN", permission: "PRODUCT-CREATE" },
    { role: "ADMIN", permission: "PRODUCT-LIST" },
    { role: "ADMIN", permission: "PRODUCT-UPDATE" },
    { role: "ADMIN", permission: "PRODUCT-DELETE" },
    { role: "CUSTOMER", permission: "PRODUCT-LIST" },
];
class RoleSeeder {
    seed() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roleDocs = yield role_schema_1.Role.find();
                if (roleDocs.length == 0) {
                    yield role_schema_1.Role.insertMany(roles);
                }
                else {
                    const pendingRoles = roles.find(role => roleDocs.find(roleDoc => roleDoc.name === role.name) === undefined);
                    if (pendingRoles) {
                        yield role_schema_1.Role.insertMany(pendingRoles);
                    }
                }
                const roleDocs2 = yield role_schema_1.Role.find();
                roleDocs2.forEach((roleDoc) => __awaiter(this, void 0, void 0, function* () {
                    const actualRolePermissions = roleDoc.permissions;
                    const permissionsToInsert = permissions.filter(permission => permission.role === roleDoc.name).filter(permission => actualRolePermissions.find(actualRolePermission => actualRolePermission === permission.permission) === undefined);
                    roleDoc.permissions = [...actualRolePermissions, ...permissionsToInsert.map(permission => permission.permission)];
                    yield role_schema_1.Role.findByIdAndUpdate(roleDoc._id, roleDoc);
                }));
                console.log("role seeded");
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}
exports.RoleSeeder = RoleSeeder;
