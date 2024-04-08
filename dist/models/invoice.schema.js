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
    shippingService: {
        type: String,
    },
    payment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Payment"
    },
    carrier: {
        type: Object
    },
    created: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
invoiceSchema.virtual('invoiceProduct', {
    ref: 'InvoiceProduct',
    localField: '_id',
    foreignField: 'invoice'
});
exports.Invoice = (0, mongoose_1.model)('Invoice', invoiceSchema);
