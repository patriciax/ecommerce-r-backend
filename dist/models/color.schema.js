"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Color = void 0;
const mongoose_1 = require("mongoose");
const ColorSchema = new mongoose_1.Schema({
    name: {
        type: String,
        require: true,
    },
    englishName: {
        type: String,
        require: true
    },
    hex: {
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
ColorSchema.pre(/^find/, function (next) {
    this.find({ deletedAt: null });
    next();
});
exports.Color = (0, mongoose_1.model)('Color', ColorSchema);
