"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Size = void 0;
const mongoose_1 = require("mongoose");
const SizeSchema = new mongoose_1.Schema({
    name: {
        type: String,
        require: true,
    },
    englishName: {
        type: String,
        require: true
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
SizeSchema.pre(/^find/, function (next) {
    this.find({ deletedAt: null });
    next();
});
exports.Size = (0, mongoose_1.model)('Size', SizeSchema);
