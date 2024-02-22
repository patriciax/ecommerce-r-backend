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
const role_schema_1 = require("../models/role.schema");
const apiFeatures_1 = require("../utils/apiFeatures");
class UserController {
    constructor() {
        this.validateFormCreate = (req) => {
            const errors = [];
            if (!req.body.name)
                errors.push('Nombre es requerido');
            if (!req.body.email)
                errors.push('Email es requerido');
            if (!req.body.password)
                errors.push('Contraseña es requerida');
            return errors;
        };
        this.validateFormUpdate = (req) => {
            const errors = [];
            if (!req.body.name)
                errors.push('Nombre es requerido');
            return errors;
        };
        this.updateProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield user_schema_1.User.findByIdAndUpdate(req.user._id, {
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
                const user = yield user_schema_1.User.findById(req.user._id).select('-password -__v -_id').select('role').populate('role');
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
        this.createEmployee = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = this.validateFormCreate(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                const role = yield role_schema_1.Role.findOne({ name: "EMPLOYEE" });
                if (!role) {
                    return res.status(400).json({
                        "status": "fail",
                        "message": "Role not found"
                    });
                }
                const user = yield user_schema_1.User.create({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    role: role._id
                });
                return res.status(201).json({
                    "status": "success",
                    "data": user
                });
            }
            catch (err) {
                console.log(err);
                return res.status(400).json({
                    "status": "fail",
                    "message": "User not created"
                });
            }
        });
        this.employees = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const role = yield role_schema_1.Role.findOne({ name: "EMPLOYEE" });
                const features = new apiFeatures_1.APIFeatures(user_schema_1.User.find({ role: role === null || role === void 0 ? void 0 : role._id }), req.query).paginate();
                const users = yield features.query;
                const totalEmployees = yield user_schema_1.User.find({ role: role === null || role === void 0 ? void 0 : role._id });
                const totalPages = totalEmployees.length / Number(((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
                    results: users.length,
                    data: {
                        users
                    }
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.deleteEmployee = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const employeeToDelete = yield user_schema_1.User.findById(req.params.id);
                const employee = yield user_schema_1.User.findByIdAndUpdate(req.params.id, {
                    email: `${employeeToDelete === null || employeeToDelete === void 0 ? void 0 : employeeToDelete.email}-${Date.now()}`,
                    deletedAt: new Date()
                });
                if (!employee)
                    return res.status(404).json({ status: 'fail', message: 'No employee found with that ID' });
                return res.status(204).json({
                    status: 'success',
                    data: null
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No color found with that ID'
                });
            }
        });
        this.employee = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_schema_1.User.findById(req.params.id);
                if (!user)
                    return res.status(404).json({ status: 'fail', message: 'No user found with that ID' });
                return res.status(200).json({
                    status: 'success',
                    data: user
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
        this.updateEmployee = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = this.validateFormUpdate(req);
                if (errors.length > 0)
                    return res.status(422).json({ status: 'fail', message: errors });
                const employee = yield user_schema_1.User.findById(req.params.id);
                if (!employee)
                    return res.status(404).json({ status: 'fail', message: 'No employee found with that ID' });
                employee.name = req.body.name;
                if (req.body.password)
                    employee.password = req.body.password;
                employee.save();
                return res.status(200).json({
                    status: 'success',
                    data: {
                        employee
                    }
                });
            }
            catch (err) {
                return res.status(404).json({
                    status: 'fail',
                    message: err.message
                });
            }
        });
        this.verifyRepeatedEmail = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield user_schema_1.User.findOne({ email: req.body.email });
                if (user)
                    return res.status(200).json({
                        "status": "success",
                        "message": "EMAIL_ALREADY_EXISTS"
                    });
                return res.status(404).json({
                    "status": "fail",
                    "message": "USER_NOT_FOUND"
                });
            }
            catch (err) {
                return res.status(500).json({
                    "status": "error",
                    "message": "SOMETHING_WENT_WRONG"
                });
            }
        });
    }
}
exports.UserController = UserController;
