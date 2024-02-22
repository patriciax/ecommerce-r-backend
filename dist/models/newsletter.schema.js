"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Newsletter = void 0;
const mongoose_1 = require("mongoose");
const newsletter = new mongoose_1.Schema({
    "title": {
        type: String,
        required: true
    },
    "description": {
        type: String,
        required: true
    },
    "sent": {
        type: Boolean,
        default: false
    }
});
exports.Newsletter = (0, mongoose_1.model)("Newsletter", newsletter);
