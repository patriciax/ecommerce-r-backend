"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const size_schema_1 = require("./size.schema");
const color_schema_1 = require("./color.schema");
const category_schema_1 = require("./category.schema");
const ProductSchema = new mongoose_1.Schema({
    name: {
        type: String,
        require: true,
    },
    nameEnglish: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    descriptionEnglish: {
        type: String,
        require: true
    },
    showInHomeSection: {
        type: String,
        enum: ['section-1', 'section-2', 'section-3'],
    },
    price: {
        type: Number,
        require: true
    },
    priceDiscount: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        default: 1
    },
    mainImage: {
        type: String
    },
    sizes: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: size_schema_1.Size }
    ],
    colors: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: color_schema_1.Color }
    ],
    categories: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: category_schema_1.Category }
    ],
    tags: [String],
    images: [String],
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
ProductSchema.pre(/^find/, function (next) {
    this.find({ deletedAt: null });
    next();
});
exports.Product = (0, mongoose_1.model)('Product', ProductSchema);
