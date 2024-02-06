"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpCreator = void 0;
const otpCreator = () => Math.floor(100000 + Math.random() * 900000).toString();
exports.otpCreator = otpCreator;
