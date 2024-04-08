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
exports.LoginController = void 0;
const user_schema_1 = require("../models/user.schema");
const jsonwebtoken_1 = require("jsonwebtoken");
class LoginController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_schema_1.User.findOne({ email: req.body.email }).select({ '_id': String, 'password': String, 'name': String, 'role': String, }).populate('role');
                if (!user) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'USER_NOT_FOUND'
                    });
                }
                const isPasswordValid = yield user.verifyUserPassword(req.body.password);
                if (!isPasswordValid) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'USER_NOT_FOUND'
                    });
                }
                if (!user.emailVerifiedAt) {
                    return res.status(404).json({
                        status: 'fail',
                        message: 'EMAIL_NOT_VERIFIED'
                    });
                }
                const { _id } = user.toObject();
                const token = (0, jsonwebtoken_1.sign)({ _id }, process.env.JWT_SECRET, { expiresIn: '2y' });
                return res.status(200).json({
                    status: 'success',
                    data: token
                });
            }
            catch (err) {
                return res.status(500).json({
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
    }
}
exports.LoginController = LoginController;
