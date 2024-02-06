"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maxImagesCount = void 0;
exports.maxImagesCount = process.env.MAX_IMAGES_COUNT ? parseInt(process.env.MAX_IMAGES_COUNT) : 3;
