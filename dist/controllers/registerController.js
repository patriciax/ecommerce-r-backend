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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = void 0;
const user_schema_1 = require("../models/user.schema");
const role_schema_1 = require("../models/role.schema");
const emailController_1 = require("./emailController");
const otpCreator_1 = require("../utils/otpCreator");
class RegisterController {
    constructor() {
        this.signup = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const customerRole = yield role_schema_1.Role.findOne({ name: 'CUSTOMER' });
                req.body.role = customerRole === null || customerRole === void 0 ? void 0 : customerRole._id;
                const emailOtpToCreate = (0, otpCreator_1.otpCreator)();
                const user = yield user_schema_1.User.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    emailOtp: emailOtpToCreate,
                });
                const _a = user.toJSON(), { password, emailOtp, role } = _a, data = __rest(_a, ["password", "emailOtp", "role"]);
                const emailController = new emailController_1.EmailController();
                emailController.sendEmail("emailVerify", user.email, "Email verification", {
                    name: user.name,
                    emailOtp: user.emailOtp
                });
                return res.status(201).json({
                    'status': 'success',
                    'data': {
                        user: data
                    }
                });
            }
            catch (error) {
                return res.status(400).json({
                    'status': 'error',
                    'message': error.message
                });
            }
        });
        this.resendEmailOtp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const emailController = new emailController_1.EmailController();
                const user = yield user_schema_1.User.findOne({ email: req.body.email }).lean().select({ emailOtp: 1, name: 1, email: 1 });
                if (!user) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'User not found'
                    });
                }
                emailController.sendEmail("emailVerify", user.email, "Email verification", user);
                res.status(200).json({
                    status: 'success',
                    message: 'Email sent'
                });
            }
            catch (error) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                });
            }
        });
        this.verifyEmailOtp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_schema_1.User.findOneAndUpdate({ email: req.body.email, emailOtp: req.body.emailOtp }, { emailOtp: undefined, emailVerifiedAt: Date.now() });
                if (!user) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'User not found'
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    message: 'Email verified'
                });
            }
            catch (error) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                });
            }
        });
    }
}
exports.RegisterController = RegisterController;
