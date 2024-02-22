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
exports.ClientController = void 0;
const user_schema_1 = require("../models/user.schema");
const role_schema_1 = require("../models/role.schema");
const apiFeatures_1 = require("../utils/apiFeatures");
class ClientController {
    constructor() {
        this.clients = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const role = yield role_schema_1.Role.findOne({ name: "CUSTOMER" });
                const features = new apiFeatures_1.APIFeatures(user_schema_1.User.find({ role: role === null || role === void 0 ? void 0 : role._id }), req.query).paginate();
                const clients = yield features.query;
                const totalEmployees = yield user_schema_1.User.find({ role: role === null || role === void 0 ? void 0 : role._id });
                const totalPages = totalEmployees.length / Number(((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
                    results: clients.length,
                    data: {
                        clients
                    }
                });
            }
            catch (err) {
                res.status(500).json({ message: err.message });
            }
        });
    }
}
exports.ClientController = ClientController;
