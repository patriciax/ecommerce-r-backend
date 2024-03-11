"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const mongoose_1 = require("mongoose");
const invoiceSchema = new mongoose_1.Schema({
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
    transactionOrder: {
        type: String
    },
    shippingTracking: {
        type: String
    },
    payment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Payment"
    },
    products: {
        type: [
            {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "User"
            },
            {
                type: Number
            }
        ]
    }
});
exports.Invoice = (0, mongoose_1.model)('Invoice', invoiceSchema);
