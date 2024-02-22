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
exports.restrictsTo = exports.authMiddleware = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const user_schema_1 = require("../models/user.schema");
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization) {
        return res.status(401).json({
            status: 'fail',
            message: 'You are not authorized to access this resource'
        });
    }
    const splittedHeader = req.headers.authorization.split(' ');
    if (splittedHeader[0] !== 'Bearer') {
        return res.status(401).json({
            status: 'fail',
            message: 'You are not authorized to access this resource'
        });
    }
    try {
        const userInfo = (0, jsonwebtoken_1.verify)(splittedHeader[1], process.env.JWT_SECRET);
        const user = yield user_schema_1.User.findById(userInfo._id).populate('role');
        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'You are not authorized to access this resource'
            });
        }
        req.user = user;
    }
    catch (error) {
        return res.status(401).json({
            status: 'fail',
            message: 'You are not authorized to access this resource'
        });
    }
    next();
});
exports.authMiddleware = authMiddleware;
const restrictsTo = (permissions) => {
    return (req, res, next) => {
        var _a, _b;
        if (!((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === null || _b === void 0 ? void 0 : _b.permissions.includes(permissions))) {
            return res.status(403).json({
                status: 'fail',
                message: 'You are not allowed to access this resource'
            });
        }
        next();
    };
};
exports.restrictsTo = restrictsTo;
