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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const roleSeeders_1 = require("./roleSeeders");
const userSeeders_1 = require("./userSeeders");
const dotenv_1 = __importDefault(require("dotenv"));
const adminEmailSeeders_1 = require("./adminEmailSeeders");
const result = dotenv_1.default.config({ path: `${__dirname}/../config.env` });
mongoose_1.default.connect(process.env.DATABASE || '').then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Connected to database');
    const roleSeeder = new roleSeeders_1.RoleSeeder();
    yield roleSeeder.seed();
    const userSeeder = new userSeeders_1.UserSeeder();
    yield userSeeder.seed();
    const adminEmailSeeder = new adminEmailSeeders_1.AdminEmailSeeder();
    yield adminEmailSeeder.seed();
    console.log("finish seeding");
    process.exit();
}));
