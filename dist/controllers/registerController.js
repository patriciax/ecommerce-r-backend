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
const adminEmail_schema_1 = require("../models/adminEmail.schema");
class RegisterController {
    constructor() {
        this.validateForm = (req) => {
            const errors = [];
            if (!req.body.name)
                errors.push('NAME_REQUIRED');
            if (!req.body.lastname)
                errors.push('LASTNAME_REQUIRED');
            if (!req.body.email)
                errors.push('EMAIL_REQUIRED');
            if (!req.body.password)
                errors.push('PASSWORD_REQUIRED');
            if (req.body.password !== req.body.passwordConfirm)
                errors.push('PASSWORD_SHOULD_MATCH');
            if (!req.body.phone)
                errors.push('PHONE_REQUIRED');
            return errors;
        };
        this.signup = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const validateFormErrors = this.validateForm(req);
            if (validateFormErrors.length > 0) {
                return res.status(422).json({
                    status: 'fail',
                    message: 'VALIDATION_ERROR',
                    errors: validateFormErrors
                });
            }
            try {
                const customerRole = yield role_schema_1.Role.findOne({ name: 'CUSTOMER' });
                req.body.role = customerRole === null || customerRole === void 0 ? void 0 : customerRole._id;
                const emailOtpToCreate = (0, otpCreator_1.otpCreator)();
                const user = yield user_schema_1.User.create({
                    name: req.body.name,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    phone: req.body.phone,
                    address: req.body.address,
                    password: req.body.password,
                    emailOtp: emailOtpToCreate,
                });
                const _a = user.toJSON(), { password, emailOtp, role } = _a, data = __rest(_a, ["password", "emailOtp", "role"]);
                const emailController = new emailController_1.EmailController();
                const adminEmail = yield adminEmail_schema_1.AdminEmail.findOne();
                emailController.sendEmail("emailVerify", user.email, "Verificación de email", {
                    name: `${user.name} ${user.lastname}`,
                    emailOtp: user.emailOtp
                });
                if (adminEmail) {
                    emailController.sendEmail("adminNewRegister", adminEmail.email, "Nuevo cliente registrado", {
                        name: `${user.name} ${user.lastname}`,
                        email: user.email,
                        phone: user.phone
                    });
                }
                return res.status(201).json({
                    'status': 'success',
                    'message': 'EMAIL_VERIFICATION_SENT',
                    'data': {
                        user: data
                    }
                });
            }
            catch (error) {
                return res.status(500).json({
                    'status': 'error',
                    'message': 'SOMETHING_WENT_WRONG'
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
                        message: 'USER_NOT_FOUND'
                    });
                }
                emailController.sendEmail("emailVerify", user.email, "Email verification", user);
                res.status(200).json({
                    status: 'success',
                    message: 'EMAIL_SENT'
                });
            }
            catch (error) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'USER_NOT_FOUND'
                });
            }
        });
        this.verifyEmailOtp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_schema_1.User.findOneAndUpdate({ email: req.body.email, emailOtp: req.body.emailOtp }, { emailOtp: undefined, emailVerifiedAt: Date.now() });
                if (!user) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'USER_NOT_FOUND'
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    message: 'EMAIL_VERIFIED'
                });
            }
            catch (error) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'USER_NOT_FOUND'
                });
            }
        });
    }
}
exports.RegisterController = RegisterController;
