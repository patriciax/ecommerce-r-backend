"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCloudinary = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const initCloudinary = () => {
    cloudinary_1.default.v2.config({
        cloud_name: 'dzrkonvpo',
        api_key: '261881846577638',
        api_secret: 'ai694HK_OEf6AKWxbfHblO5F8GU',
    });
};
exports.initCloudinary = initCloudinary;
