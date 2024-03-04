"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomNumbersGenerator = void 0;
const randomNumbersGenerator = (length) => {
    let creditCardNumber = '';
    for (let i = 0; i < length; i++) {
        creditCardNumber += Math.floor(Math.random() * 10);
    }
    return creditCardNumber;
};
exports.randomNumbersGenerator = randomNumbersGenerator;
