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
exports.PasswordRestoreController = void 0;
const user_schema_1 = require("../models/user.schema");
const otpCreator_1 = require("../utils/otpCreator");
const emailController_1 = require("./emailController");
class PasswordRestoreController {
    constructor() {
        this.setRestorePasswordOtp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const otp = (0, otpCreator_1.otpCreator)();
                const user = yield user_schema_1.User.findOneAndUpdate({ email: req.body.email }, { passwordResetOtp: otp }).select({ passwordResetOtp: 1, name: 1, email: 1 });
                if (!user) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'User not found'
                    });
                }
                const emailController = new emailController_1.EmailController();
                emailController.sendEmail("emailPasswordReset", user.email, "Password reset", {
                    name: user.name,
                    emailOtp: otp
                });
                return res.status(200).json({
                    status: 'success',
                    message: 'Password reset otp sent to email'
                });
            }
            catch (error) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                });
            }
        });
        this.verifyPasswordOtp = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_schema_1.User.findOne({ email: req.body.email, passwordResetOtp: req.body.passwordOtp });
                if (!user) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'User not found'
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    message: 'Otp verified'
                });
            }
            catch (error) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found'
                });
            }
        });
        this.updatePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_schema_1.User.findOne({ email: req.body.email, passwordResetOtp: req.body.passwordOtp });
                if (!user) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'User not found'
                    });
                }
                user.passwordResetOtp = undefined;
                user.password = req.body.password;
                user.save();
                return res.status(200).json({
                    status: 'success',
                    message: 'Passowrd updated successfully'
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
exports.PasswordRestoreController = PasswordRestoreController;
