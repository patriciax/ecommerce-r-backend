"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = void 0;
const mongoose_1 = require("mongoose");
const FooterSchema = new mongoose_1.Schema({
    title: {
        type: String,
        require: true,
    },
    titleEnglish: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true
    },
    descriptionEnglish: {
        type: String,
        require: true,
    },
    section: {
        type: String,
        require: true,
    },
    slug: {
        type: String,
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
exports.Footer = (0, mongoose_1.model)('Footer', FooterSchema);
