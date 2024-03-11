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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditCardRocaController = void 0;
const creditCardRoca_schema_1 = require("../../models/creditCardRoca.schema");
const giftCard_schema_1 = require("../../models/giftCard.schema");
const otpCreator_1 = require("../../utils/otpCreator");
const randomNumbersGenerator_1 = require("../../utils/randomNumbersGenerator");
const emailController_1 = require("../emailController");
// declare global {
//     namespace Express {
//         interface Request {
//             user?: any;
//         }
//     }
// }
class CreditCardRocaController {
    constructor() {
        this.validateForm = (request) => {
            const errors = [];
            if (!request.body.giftCardId)
                errors.push('GIFT_CARD_REQUIRED');
            if (!request.body.email)
                errors.push('EMAIL_REQUIRED');
            return errors;
        };
        this.validateOTP = (request) => {
            const errors = [];
            if (!request.body.otp)
                errors.push('OTP_REQUIRED');
            return errors;
        };
        this.createCreditCardRoca = (request, response) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const errors = this.validateForm(request);
                if (errors.length > 0) {
                    return response.status(422).json({
                        status: 'fail',
                        message: 'VALIDATION_ERROR',
                        errors: errors
                    });
                }
                const giftCard = yield giftCard_schema_1.GiftCard.findById(request.body.giftCardId);
                if (!giftCard) {
                    return response.status(404).json({
                        status: 'fail',
                        message: 'GIFT_CARD_NOT_FOUND'
                    });
                }
                const creditCardOtp = (0, otpCreator_1.otpCreator)();
                let creditCardNumber = null;
                let exists = true;
                while (exists) {
                    creditCardNumber = (0, randomNumbersGenerator_1.randomNumbersGenerator)(16);
                    exists = (yield creditCardRoca_schema_1.CreditCardRoca.findOne({ cardNumber: creditCardNumber })) || false;
                }
                const cardPin = (0, randomNumbersGenerator_1.randomNumbersGenerator)(4);
                const creditCardRoca = yield creditCardRoca_schema_1.CreditCardRoca.create({
                    cardNumber: creditCardNumber,
                    cardPin: cardPin,
                    credit: giftCard.amount,
                    otp: creditCardOtp,
                    email: request.body.email,
                    fromUser: (_a = request === null || request === void 0 ? void 0 : request.user) === null || _a === void 0 ? void 0 : _a._id,
                });
                const emailController = new emailController_1.EmailController();
                emailController.sendEmail("giftCard", request.body.email, "Gift card recibida", {
                    emailOtp: creditCardOtp,
                    cardNumber: creditCardNumber,
                    cardPin: cardPin,
                });
                response.status(201).json({
                    status: 'success',
                    message: 'CREDIT_CARD_ROCA_CREATED',
                });
            }
            catch (error) {
                response.status(400).json({
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.validateGifCardOtp = (request, response) => __awaiter(this, void 0, void 0, function* () {
            var _b, _c;
            try {
                const errors = this.validateOTP(request);
                if (errors.length > 0) {
                    return response.status(422).json({
                        status: 'fail',
                        message: 'VALIDATION_ERROR',
                        errors: errors
                    });
                }
                const creditCardRoca = yield creditCardRoca_schema_1.CreditCardRoca.findOne({ otp: request.body.otp, email: (_b = request === null || request === void 0 ? void 0 : request.user) === null || _b === void 0 ? void 0 : _b.email });
                if (!creditCardRoca) {
                    return response.status(404).json({
                        status: 'fail',
                        message: 'CREDIT_CARD_NOT_FOUND'
                    });
                }
                creditCardRoca.otp = null;
                creditCardRoca.user = (_c = request === null || request === void 0 ? void 0 : request.user) === null || _c === void 0 ? void 0 : _c._id;
                yield creditCardRoca.save();
                response.status(200).json({
                    status: 'success',
                    message: 'CREDIT_CARD_ROCA_VALIDATED',
                });
            }
            catch (error) {
                response.status(400).json({
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.verifyCredits = (request, response) => __awaiter(this, void 0, void 0, function* () {
            var _d;
            try {
                console.log(request.user);
                const creditCardRoca = yield creditCardRoca_schema_1.CreditCardRoca.find({ email: (_d = request === null || request === void 0 ? void 0 : request.user) === null || _d === void 0 ? void 0 : _d.email });
                console.log(creditCardRoca);
                if (!creditCardRoca) {
                    return response.status(404).json({
                        status: 'fail',
                        message: 'CREDIT_CARD_NOT_FOUND'
                    });
                }
                let card = null;
                for (let creditCard of creditCardRoca) {
                    if ((yield creditCard.verifyCardNumber(request.body.cardNumber)) && (yield creditCard.verifyCardPin(request.body.cardPin))) {
                        card = creditCard;
                    }
                }
                if (!card) {
                    return response.status(404).json({
                        status: 'fail',
                        message: 'CREDIT_CARD_NOT_FOUND'
                    });
                }
                return response.status(200).json({
                    status: 'success',
                    data: card.credit,
                });
            }
            catch (error) {
                response.status(400).json({
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
    }
}
exports.CreditCardRocaController = CreditCardRocaController;
