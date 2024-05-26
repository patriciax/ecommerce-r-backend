"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllTimePurchase = void 0;
const mongoose_1 = require("mongoose");
const allTimePurchase = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Product"
    },
    size: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Size"
    },
    color: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Color"
    },
    amount: {
        type: Number,
        default: 1
    }
});
exports.AllTimePurchase = (0, mongoose_1.model)('AllTimePurchase', allTimePurchase);
