"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxCalculations = void 0;
const taxCalculations = (number, type) => {
    const taxRate = type === 'international' ? 1.06998 : 1.16;
    return number * taxRate;
};
exports.taxCalculations = taxCalculations;
