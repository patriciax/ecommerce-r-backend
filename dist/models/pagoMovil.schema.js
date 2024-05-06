"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagoMovil = void 0;
const mongoose_1 = require("mongoose");
const PagoMovilSchema = new mongoose_1.Schema({
    phone: {
        type: String,
        required: true
    },
    bank: {
        type: String,
        required: true
    },
    identification: {
        type: String,
        required: true
    }
});
exports.PagoMovil = (0, mongoose_1.model)('PagoMovil', PagoMovilSchema);
