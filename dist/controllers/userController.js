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
exports.UserController = void 0;
const user_schema_1 = require("../models/user.schema");
class UserController {
    constructor() {
        this.updateProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield user_schema_1.User.findByIdAndUpdate(req.body.user._id, {
                    name: req.body.name
                });
                return res.status(200).json({
                    "status": "success",
                    "message": "Profile updated successfully"
                });
            }
            catch (err) {
                return res.status(200).json({
                    "status": "fail",
                    "message": "User not found"
                });
            }
        });
        this.getUserInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_schema_1.User.findById(req.body.user._id).select('-password -__v -_id').select('role').populate('role');
                return res.status(200).json({
                    "status": "success",
                    "data": user
                });
            }
            catch (err) {
                console.log(err);
                return res.status(200).json({
                    "status": "fail",
                    "message": "User not found"
                });
            }
        });
    }
}
exports.UserController = UserController;
