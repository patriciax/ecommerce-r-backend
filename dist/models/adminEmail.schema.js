"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminEmail = void 0;
const mongoose_1 = require("mongoose");
const adminEmail = new mongoose_1.Schema({
    email: {
        type: String,
        required: true
    }
});
exports.AdminEmail = (0, mongoose_1.model)('AdminEmail', adminEmail);
