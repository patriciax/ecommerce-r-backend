"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftCard = void 0;
const mongoose_1 = require("mongoose");
const GiftCardSchema = new mongoose_1.Schema({
    name: {
        type: String,
        require: true,
    },
    englishName: {
        type: String,
        require: true
    },
    amount: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deletedAt: {
        type: Date,
        default: null
    }
});
GiftCardSchema.pre(/^find/, function (next) {
    this.find({ deletedAt: null });
    next();
});
exports.GiftCard = (0, mongoose_1.model)('GiftCard', GiftCardSchema);
