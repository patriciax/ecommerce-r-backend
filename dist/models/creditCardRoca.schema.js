"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditCardRoca = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const CreditCardRocaSchema = new mongoose_1.Schema({
    cardNumber: {
        type: String,
        required: true
    },
    cardPin: {
        type: String,
        required: true
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    credit: {
        type: Number,
        required: true
    },
    otp: {
        type: Number,
    }
});
CreditCardRocaSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.cardNumber && this.cardPin) {
            this.cardNumber = yield bcrypt_1.default.hash(this.cardNumber, 10);
            this.cardPin = yield bcrypt_1.default.hash(this.cardPin, 10);
        }
        next();
    });
});
CreditCardRocaSchema.methods.verifyCardNumber = function (cardNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(cardNumber, this.cardNumber);
    });
};
CreditCardRocaSchema.methods.verifyCardPin = function (cardPin) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(cardPin, this.cardPin);
    });
};
exports.CreditCardRoca = (0, mongoose_1.model)('CreditCardRoca', CreditCardRocaSchema);
