"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DolarPrice = void 0;
const mongoose_1 = require("mongoose");
const dolarPrice = new mongoose_1.Schema({
    price: {
        type: Number,
        required: true
    },
    updatedAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});
exports.DolarPrice = (0, mongoose_1.model)('DolarPrice', dolarPrice);
