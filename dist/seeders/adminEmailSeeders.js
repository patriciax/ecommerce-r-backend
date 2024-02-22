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
exports.AdminEmailSeeder = void 0;
const adminEmail_schema_1 = require("../models/adminEmail.schema");
const emailAdminList = [
    {
        email: 'rodriguezwillian95@gmail.com',
    }
];
class AdminEmailSeeder {
    seed() {
        return __awaiter(this, void 0, void 0, function* () {
            yield adminEmail_schema_1.AdminEmail.deleteMany();
            yield adminEmail_schema_1.AdminEmail.insertMany(emailAdminList);
            console.log("admin email seeded");
        });
    }
}
exports.AdminEmailSeeder = AdminEmailSeeder;
