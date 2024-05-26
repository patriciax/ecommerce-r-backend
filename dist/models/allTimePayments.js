"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllTimePayment = void 0;
const mongoose_1 = require("mongoose");
const allTimePayment = new mongoose_1.Schema({
    amount: {
        type: Number
    }
});
exports.AllTimePayment = (0, mongoose_1.model)('AllTimePayment', allTimePayment);
