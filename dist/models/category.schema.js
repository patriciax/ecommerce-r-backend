"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        require: true,
    },
    englishName: {
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    parent_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category'
    },
    categoryType: {
        type: String,
        enum: ['main', 'sub', 'final'],
        default: 'main'
    },
    slug: {
        type: String,
        unique: true
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
CategorySchema.pre(/^find/, function (next) {
    this.find({ deletedAt: null });
    next();
});
exports.Category = (0, mongoose_1.model)('Category', CategorySchema);
