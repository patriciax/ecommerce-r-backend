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
exports.UserSeeder = void 0;
const user_schema_1 = require("../models/user.schema");
const role_schema_1 = require("../models/role.schema");
const usersList = [
    {
        name: 'Admin',
        email: 'admin@example.com',
        password: '41lz0DAqKVOn',
        emailVerifiedAt: Date.now(),
        role: "ADMIN"
    }
];
class UserSeeder {
    seed() {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield user_schema_1.User.find({});
            const usersToInsert = usersList.filter(userList => !users.find(user => user.email === userList.email));
            for (const user of usersToInsert) {
                const role = yield role_schema_1.Role.findOne({ name: user.role });
                if (role) {
                    user.role = role._id.toString();
                    yield user_schema_1.User.create(user);
                }
            }
            console.log("user seeded");
        });
    }
}
exports.UserSeeder = UserSeeder;
