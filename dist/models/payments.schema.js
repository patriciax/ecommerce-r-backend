"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const paymentSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    identification: {
        type: String
    },
    transactionId: {
        type: String
    },
    type: {
        type: String,
        enum: ['card', 'paypal', 'appelpay', 'zelle', 'mercantil', 'banesco', 'giftCard', 'pagoMovil', "mercantil"],
    },
    total: {
        type: Number
    },
    bank: {
        type: String
    },
    purchaseType: {
        type: String,
        enum: ['invoice', 'giftCard'],
    },
    taxAmount: {
        type: Object
    },
    carrierRate: {
        type: Object,
    },
    carrierRateAmount: {
        type: Number
    },
    zelleEmail: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
    },
    created: {
        type: Date,
        default: Date.now
    }
});
exports.Payment = (0, mongoose_1.model)('Payment', paymentSchema);
