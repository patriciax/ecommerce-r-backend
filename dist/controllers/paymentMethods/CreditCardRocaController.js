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
const randomNumbersGenerator_1 = require("../../utils/randomNumbersGenerator");
const emailController_1 = require("../emailController");
const BanescoController_1 = require("./BanescoController");
const checkoutController_1 = require("../checkoutController");
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
            if (!request.body.card.emailTo)
                errors.push('EMAIL_REQUIRED');
            return errors;
        };
        this.purchaseCreditCardRoca = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const checkoutController = new checkoutController_1.CheckoutController();
                if (req.body.paymentMethod === 'banesco') {
                    try {
                        const tracnsactionOrder = yield checkoutController.generateInvoiceOrder();
                        const banescoProcess = new BanescoController_1.BanescoController();
                        const response = yield banescoProcess.makePaymentGiftCard(req.body.banescoData, req.body.card.total);
                        const payment = yield checkoutController.generatePayment(req, 'banesco', tracnsactionOrder, response);
                        if (response.success) {
                            this.createCreditCardRoca(req, res);
                            return res.status(200).json({
                                status: 'success',
                                message: 'PAYMENT_SUCCESS',
                                data: {
                                    tracnsactionOrder,
                                    card: req.body.card
                                }
                            });
                        }
                        return res.status(400).json({
                            status: 'fail',
                            message: 'PAYMENT_FAILED'
                        });
                    }
                    catch (error) {
                        console.log(error);
                        return res.status(400).json({
                            status: 'fail',
                            message: 'PAYMENT_FAILED'
                        });
                    }
                }
            }
            catch (error) {
                console.log(error);
                res.status(400).json({
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
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
                const giftCard = yield giftCard_schema_1.GiftCard.findOne({ amount: request.body.card.total });
                if (!giftCard) {
                    return {
                        status: 'fail',
                        message: 'GIFT_CARD_NOT_FOUND'
                    };
                }
                let creditCardNumber = null;
                let exists = true;
                while (exists) {
                    creditCardNumber = (0, randomNumbersGenerator_1.randomNumbersGenerator)(16);
                    exists = (yield creditCardRoca_schema_1.CreditCardRoca.findOne({ cardNumber: creditCardNumber })) || false;
                }
                const cardPin = (0, randomNumbersGenerator_1.randomNumbersGenerator)(4);
                yield creditCardRoca_schema_1.CreditCardRoca.create({
                    cardNumber: creditCardNumber,
                    cardPin: cardPin,
                    credit: giftCard.amount,
                    email: request.body.card.emailTo,
                    fromUser: (_a = request === null || request === void 0 ? void 0 : request.user) === null || _a === void 0 ? void 0 : _a._id,
                });
                const emailController = new emailController_1.EmailController();
                emailController.sendEmail("giftCard", request.body.card.emailTo, "Gift card recibida", {
                    cardNumber: creditCardNumber,
                    cardPin: cardPin,
                });
                return {
                    status: 'success',
                    message: 'CREDIT_CARD_ROCA_CREATED',
                };
            }
            catch (error) {
                return {
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                };
            }
        });
        this.verifyCredits = (request, response) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            try {
                const creditCardRoca = yield creditCardRoca_schema_1.CreditCardRoca.find({ email: (_b = request === null || request === void 0 ? void 0 : request.body) === null || _b === void 0 ? void 0 : _b.email });
                if (!creditCardRoca) {
                    return response.status(404).json({
                        status: 'fail',
                        message: 'CREDIT_CARD_NOT_FOUND'
                    });
                }
                let cardPin = null;
                let credits = null;
                let cardNumber = null;
                for (let card of creditCardRoca) {
                    cardNumber = yield card.verifyCardNumber(request.body.cardNumber);
                    cardPin = yield card.verifyCardPin(request.body.cardPin);
                    credits = card.credit;
                    if (cardNumber && cardPin) {
                        break;
                    }
                }
                if (!cardNumber || !cardPin) {
                    return response.status(404).json({
                        status: 'fail',
                        message: 'CREDIT_CARD_NOT_FOUND'
                    });
                }
                const emailController = new emailController_1.EmailController();
                emailController.sendEmail("creditCardBalance", request.body.email, "Balance de GiftCard ERoca", {
                    "cardNumber": request.body.cardNumber,
                    "cardPin": request.body.cardPin,
                    "credits": credits
                });
                return response.status(200).json({
                    status: 'success',
                    message: 'CREDIT_CARD_SENT'
                });
            }
            catch (error) {
                response.status(400).json({
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.updateCreditCardRoca = (creditCard) => __awaiter(this, void 0, void 0, function* () {
            try {
                const creditCardRoca = yield creditCardRoca_schema_1.CreditCardRoca.findByIdAndUpdate(creditCard._id, { credits: creditCard });
                if (!creditCardRoca) {
                    return {
                        status: 'fail',
                        message: 'CREDIT_CARD_NOT_FOUND'
                    };
                }
                return {
                    status: 'success',
                    message: 'CREDIT_CARD_UPDATED'
                };
            }
            catch (error) {
                return {
                    status: 'fail',
                    message: 'CREDIT_CARD_NOT_FOUND'
                };
            }
        });
        this.makePayment = (data, cart) => __awaiter(this, void 0, void 0, function* () {
            try {
                const total = cart.reduce((acc, item) => acc + (item.priceDiscount || item.price) * item.quantity, 0);
                const creditCardRoca = yield creditCardRoca_schema_1.CreditCardRoca.find({ email: data.email });
                if (!creditCardRoca) {
                    return {
                        status: 'fail',
                        message: 'CREDIT_CARD_NOT_FOUND'
                    };
                }
                let cardId = null;
                let cardPin = null;
                let credits = null;
                let cardNumber = null;
                for (let card of creditCardRoca) {
                    cardId = card.id;
                    cardNumber = yield card.verifyCardNumber(data.cardNumber);
                    cardPin = yield card.verifyCardPin(data.cardPin);
                    credits = card.credit;
                    if (cardNumber && cardPin) {
                        break;
                    }
                }
                if (!cardNumber || !cardPin || !credits) {
                    return {
                        status: 'fail',
                        message: 'CREDIT_CARD_NOT_FOUND'
                    };
                }
                if (credits < total) {
                    return {
                        status: 'fail',
                        message: 'INSUFFICIENT_CREDITS'
                    };
                }
                const creditsToUpdate = credits - total;
                const findCard = yield creditCardRoca_schema_1.CreditCardRoca.findByIdAndUpdate(cardId, { credit: creditsToUpdate }, { overwriteDiscriminatorKey: true, new: true });
                return {
                    status: 'success',
                    message: 'PAYMENT_SUCCESS',
                };
            }
            catch (error) {
                return {
                    status: 'fail',
                    message: 'CREDIT_CARD_NOT_FOUND'
                };
            }
        });
    }
}
exports.CreditCardRocaController = CreditCardRocaController;
