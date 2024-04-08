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
exports.BanescoController = void 0;
const axios_1 = __importDefault(require("axios"));
const dolarPrice_schema_1 = require("../../models/dolarPrice.schema");
class BanescoController {
    constructor() {
        this.makePayment = (data, cart) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const dolarPrice = yield dolarPrice_schema_1.DolarPrice.findOne({}).sort({ createdAt: -1 });
                const total = (_a = cart.reduce((acc, item) => acc + (item.priceDiscount || item.price) * item.quantity, 0) * (dolarPrice === null || dolarPrice === void 0 ? void 0 : dolarPrice.price)) !== null && _a !== void 0 ? _a : 1;
                const response = yield axios_1.default.post(`${process.env.BANESCO_API_URL}/payment`, {
                    "KeyId": process.env.BANESCO_PRIVATE_KEY,
                    "PublicKeyId": process.env.BANESCO_PUBLIC_KEY,
                    "Amount": `${total}`,
                    "Description": data.description,
                    "CardHolder": data.cardHolder,
                    "CardHolderId": data.cardHolderId,
                    "CardNumber": data.cardNumber,
                    "CVC": data.cvc,
                    "ExpirationDate": data.expirationDate,
                    "StatusId": 2,
                    "IP": data.ip
                }, {
                    headers: { 'content-type': 'application/x-www-form-urlencoded' }
                });
                return response.data;
            }
            catch (error) {
                return error;
            }
        });
        this.makePaymentGiftCard = (data, total) => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post(`${process.env.BANESCO_API_URL}/payment`, {
                    "KeyId": process.env.BANESCO_PRIVATE_KEY,
                    "PublicKeyId": process.env.BANESCO_PUBLIC_KEY,
                    "Amount": `${total}`,
                    "Description": data.description,
                    "CardHolder": data.cardHolder,
                    "CardHolderId": data.cardHolderId,
                    "CardNumber": data.cardNumber,
                    "CVC": data.cvc,
                    "ExpirationDate": data.expirationDate,
                    "StatusId": 2,
                    "IP": data.ip
                }, {
                    headers: { 'content-type': 'application/x-www-form-urlencoded' }
                });
                return response.data;
            }
            catch (error) {
                return error;
            }
        });
    }
}
exports.BanescoController = BanescoController;
