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
const PaypalController_1 = require("./PaypalController");
const ZelleController_1 = require("./ZelleController");
const pagoMovilController_1 = require("./pagoMovilController");
const dolarPrice_schema_1 = require("../../models/dolarPrice.schema");
const invoice_schema_1 = require("../../models/invoice.schema");
const payments_schema_1 = require("../../models/payments.schema");
const numberFormat_1 = require("../../utils/numberFormat");
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
                const tracnsactionOrder = yield checkoutController.generateInvoiceOrder();
                if (req.body.paymentMethod === 'banesco') {
                    try {
                        const banescoProcess = new BanescoController_1.BanescoController();
                        const dolarPrice = yield dolarPrice_schema_1.DolarPrice.findOne({}).sort({ createdAt: -1 });
                        const total = req.body.card.total * dolarPrice.price;
                        const response = yield banescoProcess.makePaymentGiftCard(req.body.banescoData, total);
                        const payment = yield checkoutController.generatePayment(req, 'banesco', tracnsactionOrder, response.success ? "approved" : "rejected", 'giftCard');
                        if (response.success) {
                            const invoice = yield checkoutController.generateInvoice(req, tracnsactionOrder, payment, 'giftCard');
                            yield this.createCreditCardRoca(req, res, invoice, 'active');
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
                        return res.status(400).json({
                            status: 'fail',
                            message: 'PAYMENT_FAILED'
                        });
                    }
                }
                else if (req.body.paymentMethod === 'paypal-create-order') {
                    const paypalProcess = new PaypalController_1.PaypalController();
                    const order = yield paypalProcess.createOrderCard(req.body.card.total);
                    return res.status(200).json({
                        order,
                        "transactionOrder": tracnsactionOrder
                    });
                }
                else if (req.body.paymentMethod === 'paypal-approve-order') {
                    try {
                        const paypalProcess = new PaypalController_1.PaypalController();
                        const response = yield paypalProcess.captureOrder(req.body.orderId);
                        if (response.status == 'COMPLETED') {
                            const payment = yield checkoutController.generatePayment(req, 'paypal', tracnsactionOrder, (response === null || response === void 0 ? void 0 : response.status) == 'COMPLETED' ? "approved" : "rejected", 'giftCard');
                            const invoice = yield checkoutController.generateInvoice(req, tracnsactionOrder, payment, 'giftCard');
                            this.createCreditCardRoca(req, res, invoice, 'active');
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
                        return res.status(400).json({
                            status: 'fail',
                            message: 'PAYMENT_FAILED'
                        });
                    }
                }
                else if (req.body.paymentMethod === 'pagoMovil') {
                    try {
                        const pagoMovilProcess = new pagoMovilController_1.PagoMovilController();
                        const response = yield pagoMovilProcess.makePayment(req.body.pagoMovilData, req.body.carts);
                        const payment = yield checkoutController.generatePayment(req, 'pagoMovil', tracnsactionOrder, response, 'giftCard');
                        const invoice = yield checkoutController.generateInvoice(req, tracnsactionOrder, payment, 'giftCard');
                        yield this.createCreditCardRoca(req, res, invoice, 'inactive');
                        return res.status(200).json({
                            status: 'success',
                            message: 'PAYMENT_SUCCESS',
                            data: {
                                tracnsactionOrder,
                                card: req.body.card
                            }
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
                else if (req.body.paymentMethod === 'zelle') {
                    try {
                        const zelleProcess = new ZelleController_1.ZelleController();
                        const response = yield zelleProcess.makePayment(req.body.pagoMovilData, req.body.carts);
                        const payment = yield checkoutController.generatePayment(req, 'zelle', tracnsactionOrder, response, 'giftCard');
                        const invoice = yield checkoutController.generateInvoice(req, tracnsactionOrder, payment, 'giftCard');
                        yield this.createCreditCardRoca(req, res, invoice, 'inactive');
                        return res.status(200).json({
                            status: 'success',
                            message: 'PAYMENT_SUCCESS',
                            data: {
                                tracnsactionOrder,
                                card: req.body.card
                            }
                        });
                    }
                    catch (error) {
                        return res.status(400).json({
                            status: 'fail',
                            message: 'PAYMENT_FAILED'
                        });
                    }
                }
            }
            catch (error) {
                res.status(400).json({
                    status: 'fail',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.createCreditCardRoca = (request, response, invoice, status = 'active') => __awaiter(this, void 0, void 0, function* () {
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
                creditCardNumber = (0, randomNumbersGenerator_1.randomNumbersGenerator)(16);
                const cardPin = (0, randomNumbersGenerator_1.randomNumbersGenerator)(4);
                yield creditCardRoca_schema_1.CreditCardRoca.create({
                    cardNumber: creditCardNumber,
                    cardPin: cardPin,
                    invoice: invoice._id,
                    status: status,
                    credit: giftCard.amount,
                    email: request.body.card.emailTo,
                    fromUser: (_a = request === null || request === void 0 ? void 0 : request.user) === null || _a === void 0 ? void 0 : _a._id,
                    message: request.body.card.message
                });
                if (status == 'active') {
                    const emailController = new emailController_1.EmailController();
                    emailController.sendEmail("giftCard", request.body.card.emailTo, "Gift card recibida", {
                        cardNumber: creditCardNumber,
                        cardPin: cardPin,
                        message: request.body.card.message
                    });
                }
                return {
                    status: 'success',
                    message: 'CREDIT_CARD_ROCA_CREATED',
                };
            }
            catch (error) {
                console.log(error);
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
                    "credits": (0, numberFormat_1.decimalNumberFormat)(credits || 0)
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
        this.makePayment = (data, cart, carrierRate = null) => __awaiter(this, void 0, void 0, function* () {
            try {
                const total = cart.reduce((acc, item) => acc + (item.priceDiscount || item.price) * item.quantity, 0);
                const subtotal = (total + (carrierRate ? (carrierRate === null || carrierRate === void 0 ? void 0 : carrierRate.amount) * 1 : 0));
                let taxAmount = subtotal * (carrierRate ? 0.06998 : 0.16);
                const finalTotal = taxAmount * 1 + subtotal * 1;
                const creditCardRoca = yield creditCardRoca_schema_1.CreditCardRoca.find({ email: data.emailCard });
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
                if (credits < finalTotal) {
                    return {
                        status: 'fail',
                        message: 'INSUFFICIENT_CREDITS'
                    };
                }
                const creditsToUpdate = credits - finalTotal;
                const findCard = yield creditCardRoca_schema_1.CreditCardRoca.findByIdAndUpdate(cardId, { credit: creditsToUpdate }, { overwriteDiscriminatorKey: true, new: true });
                return {
                    status: 'success',
                    message: 'PAYMENT_SUCCESS',
                };
            }
            catch (error) {
                console.log("error", error);
                return {
                    status: 'fail',
                    message: 'CREDIT_CARD_NOT_FOUND'
                };
            }
        });
        this.updateGiftCardStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _c;
            try {
                const emailController = new emailController_1.EmailController();
                const invoice = yield invoice_schema_1.Invoice.findById(req.params.invoice);
                if (!invoice) {
                    return res.status(404).json({
                        status: 'fail',
                        message: "NOT_FOUND"
                    });
                }
                const payment = yield payments_schema_1.Payment.findById(invoice.payment);
                if (!payment) {
                    return res.status(404).json({
                        status: 'fail',
                        message: "NOT_FOUND"
                    });
                }
                if (req.body.status === "pending" || req.body.status === "approved" || req.body.status === "rejected") {
                    payment.status = req.body.status;
                }
                else {
                    payment.status = 'pending';
                }
                yield payment.save();
                if (payment.status == 'approved') {
                    const creditCardNumber = (0, randomNumbersGenerator_1.randomNumbersGenerator)(16);
                    const cardPin = (0, randomNumbersGenerator_1.randomNumbersGenerator)(4);
                    const creditCardCopy = yield creditCardRoca_schema_1.CreditCardRoca.findOne({ invoice: req.params.invoice });
                    const creditCardObject = yield creditCardRoca_schema_1.CreditCardRoca.create({ invoice: invoice._id, cardNumber: creditCardNumber, cardPin: cardPin, status: 'active', credit: creditCardCopy === null || creditCardCopy === void 0 ? void 0 : creditCardCopy.credit, email: creditCardCopy === null || creditCardCopy === void 0 ? void 0 : creditCardCopy.email, fromUser: creditCardCopy === null || creditCardCopy === void 0 ? void 0 : creditCardCopy.fromUser, message: creditCardCopy === null || creditCardCopy === void 0 ? void 0 : creditCardCopy.message });
                    yield creditCardRoca_schema_1.CreditCardRoca.findByIdAndDelete(creditCardCopy === null || creditCardCopy === void 0 ? void 0 : creditCardCopy._id);
                    if (!creditCardObject) {
                        return res.status(404).json({
                            status: 'fail',
                            message: "NOT_FOUND"
                        });
                    }
                    emailController.sendEmail("giftCard", creditCardObject === null || creditCardObject === void 0 ? void 0 : creditCardObject.email, "Gift card recibida", {
                        cardNumber: creditCardNumber,
                        cardPin: cardPin,
                        message: creditCardObject === null || creditCardObject === void 0 ? void 0 : creditCardObject.message
                    });
                }
                else if (payment.status == 'rejected') {
                    emailController.sendEmail("rejectedPayment", (_c = invoice === null || invoice === void 0 ? void 0 : invoice.email) !== null && _c !== void 0 ? _c : '', "Pago rechazado", {
                        "reference": invoice.pagoMovilReference
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    data: {
                        payment
                    }
                });
            }
            catch (error) {
                return error;
            }
        });
    }
}
exports.CreditCardRocaController = CreditCardRocaController;
