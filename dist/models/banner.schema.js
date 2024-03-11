"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const mongoose_1 = require("mongoose");
const BannerSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["image", "video"],
        default: "image"
    },
    secondaryTexts: {
        type: [String],
    },
    mainTexts: {
        type: [String],
    },
    video: {
        type: String
    },
    images: {
        type: [String],
    }
});
exports.Banner = (0, mongoose_1.model)("Banner", BannerSchema);
