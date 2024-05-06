"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decimalNumberFormat = void 0;
const decimalNumberFormat = (number) => {
    const decimalPart = number.toString().split('.')[1];
    const integerPart = number.toString().split('.')[0];
    let decimalPartNumber = 0;
    if (decimalPart) {
        if ((decimalPart === null || decimalPart === void 0 ? void 0 : decimalPart.length) > 2) {
            const lastNumber = parseInt(decimalPart.charAt(2));
            decimalPartNumber = lastNumber >= 5 ? parseInt(decimalPart.slice(0, 2)) + 1 : parseInt(decimalPart.slice(0, 2));
        }
        else if ((decimalPart === null || decimalPart === void 0 ? void 0 : decimalPart.length) === 2) {
            decimalPartNumber = parseInt(decimalPart);
        }
        else if ((decimalPart === null || decimalPart === void 0 ? void 0 : decimalPart.length) === 1) {
            decimalPartNumber = parseInt(decimalPart) * 10;
        }
    }
    return `${integerPart}.${decimalPartNumber < 10 ? `0${decimalPartNumber}` : decimalPartNumber}`;
};
exports.decimalNumberFormat = decimalNumberFormat;
