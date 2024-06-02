"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceProduct = void 0;
const mongoose_1 = require("mongoose");
const invoiceProductSchema = new mongoose_1.Schema({
    invoice: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Invoice"
    },
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
    quantity: {
        type: Number,
        default: 1
    },
    price: {
        type: Number
    }
});
invoiceProductSchema.pre(/^find/, function (next) {
    this.populate('product').populate('size').populate('color');
    next();
});
exports.InvoiceProduct = (0, mongoose_1.model)('InvoiceProduct', invoiceProductSchema);
