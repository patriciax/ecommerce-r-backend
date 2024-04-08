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
exports.CheckoutController = void 0;
const PaypalController_1 = require("./paymentMethods/PaypalController");
const BanescoController_1 = require("./paymentMethods/BanescoController");
const product_schema_1 = require("../models/product.schema");
const invoice_schema_1 = require("../models/invoice.schema");
const randomNumbersGenerator_1 = require("../utils/randomNumbersGenerator");
const payments_schema_1 = require("../models/payments.schema");
const invoiceProduct_schema_1 = require("../models/invoiceProduct.schema");
const emailController_1 = require("./emailController");
const adminEmail_schema_1 = require("../models/adminEmail.schema");
const cart_schema_1 = require("../models/cart.schema");
const CreditCardRocaController_1 = require("./paymentMethods/CreditCardRocaController");
class CheckoutController {
    constructor() {
        this.paymentMethods = [
            'credits',
            'paypal-create-order',
            'paypal-approve-order',
            'applepay',
            'mercantil',
            'banesco'
        ];
        this.paymentProcess = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let tracnsactionOrder = '';
            if ((req.body.paymentMethod !== 'paypal-approve-order')) {
                const result = yield this.validateCart(req.body.carts);
                if ((result === null || result === void 0 ? void 0 : result.status) != 'success') {
                    return res.status(200).json(result);
                }
                tracnsactionOrder = yield this.generateInvoiceOrder();
            }
            if (req.body.paymentMethod === 'giftCard') {
                try {
                    const creditCardRocaController = new CreditCardRocaController_1.CreditCardRocaController();
                    const response = yield creditCardRocaController.makePayment(req.body, req.body.carts);
                    const payment = yield this.generatePayment(req, 'giftCard', tracnsactionOrder, response);
                    if ((response === null || response === void 0 ? void 0 : response.status) == 'success') {
                        const invoice = yield this.generateInvoice(req, tracnsactionOrder, payment);
                        this.clearCarts(req);
                        return res.status(200).json({
                            status: 'success',
                            message: 'PAYMENT_SUCCESS',
                            data: {
                                invoice,
                                cart: req.body.carts
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
            else if (req.body.paymentMethod === 'paypal-create-order') {
                const paypalProcess = new PaypalController_1.PaypalController();
                const order = yield paypalProcess.createOrder(req.body.carts);
                return res.status(200).json({
                    order,
                    "transactionOrder": tracnsactionOrder
                });
            }
            else if (req.body.paymentMethod === 'paypal-approve-order') {
                try {
                    const paypalProcess = new PaypalController_1.PaypalController();
                    const response = yield paypalProcess.captureOrder(req.body.orderId);
                    const payment = yield this.generatePayment(req, 'paypal', req.body.orderId, response);
                    if (response.status == 'COMPLETED') {
                        const invoice = yield this.generateInvoice(req, req.body.orderId, payment);
                        this.clearCarts(req);
                        return res.status(200).json({
                            status: 'success',
                            message: 'PAYMENT_SUCCESS',
                            data: {
                                invoice,
                                cart: req.body.carts
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
            else if (req.body.paymentMethod === 'banesco') {
                try {
                    const banescoProcess = new BanescoController_1.BanescoController();
                    const response = yield banescoProcess.makePayment(req.body.banescoData, req.body.carts);
                    const payment = yield this.generatePayment(req, 'banesco', tracnsactionOrder, response);
                    if (response.success) {
                        const invoice = yield this.generateInvoice(req, tracnsactionOrder, payment);
                        this.clearCarts(req);
                        return res.status(200).json({
                            status: 'success',
                            message: 'PAYMENT_SUCCESS',
                            data: {
                                invoice,
                                cart: req.body.carts
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
            return res.status(200).json({
                status: 'success',
                message: 'Payment process'
            });
        });
        this.generateInvoiceOrder = () => __awaiter(this, void 0, void 0, function* () {
            let transactionOrder = '';
            let exists = true;
            while (exists) {
                transactionOrder = (0, randomNumbersGenerator_1.randomNumbersGenerator)(16);
                exists = (yield invoice_schema_1.Invoice.findOne({ transactionOrder: transactionOrder })) || false;
            }
            return transactionOrder;
        });
        this.validateCart = (carts) => __awaiter(this, void 0, void 0, function* () {
            const cartProduct = [];
            let productDoesNotExist = false;
            for (let cart of carts) {
                const product = yield product_schema_1.Product.findById(cart.productId);
                if (product)
                    cartProduct.push(product);
                else {
                    productDoesNotExist = true;
                    break;
                }
            }
            if (productDoesNotExist) {
                return {
                    status: 'fail',
                    message: 'PRODUCT_NOT_EXIST'
                };
            }
            let cartProductsOverStock = false;
            const productOverStock = [];
            for (let cart of carts) {
                const product = yield product_schema_1.Product.findById(cart.productId);
                const productVariation = product === null || product === void 0 ? void 0 : product.productVariations.find((variation) => variation.color == cart.color._id && variation.size == cart.size._id);
                if (product && productVariation) {
                    if (cart.quantity > (productVariation === null || productVariation === void 0 ? void 0 : productVariation.stock)) {
                        cartProductsOverStock = true;
                        productOverStock.push(product.name);
                    }
                }
            }
            if (cartProductsOverStock) {
                return {
                    status: 'fail',
                    message: 'PRODUCT_OVER_STOCK',
                    data: {
                        productOverStock
                    }
                };
            }
            return {
                status: 'success'
            };
        });
        this.generatePayment = (req, payment, order, response) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            let userName = '';
            let userEmail = '';
            let userPhone = '';
            userName = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.name : req.body.name;
            userEmail = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.email : req.body.email;
            userPhone = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.phone : req.body.phone;
            const paymentModel = yield payments_schema_1.Payment.create({
                user: (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id,
                name: userName,
                email: userEmail,
                phone: userPhone,
                transactionId: order,
                type: payment,
                status: response.status == 'COMPLETED' ? 'approved' : 'rejected'
            });
            return paymentModel;
        });
        this.generateInvoice = (req, order, paymentModel) => __awaiter(this, void 0, void 0, function* () {
            var _b, _c, _d;
            let userName = '';
            let userEmail = '';
            let userPhone = '';
            userName = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.name : req.body.name;
            userEmail = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.email : req.body.email;
            userPhone = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.phone : req.body.phone;
            const invoice = yield invoice_schema_1.Invoice.create({
                user: (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b._id,
                name: userName,
                email: userEmail,
                phone: userPhone,
                transactionOrder: order,
                payment: paymentModel._id,
                carrier: req.body.carrier
            });
            const invoiceProducts = [];
            for (let cart of req.body.carts) {
                const productModel = cart.name;
                const sizeModel = cart.size.name;
                const colorModel = cart.color.name;
                invoiceProducts.push({
                    invoice: invoice._id,
                    product: cart.productId,
                    quantity: cart.quantity,
                    size: cart.size._id,
                    color: cart.color._id,
                    productModel: productModel,
                    colorModel: colorModel,
                    sizeModel: sizeModel
                });
            }
            yield invoiceProduct_schema_1.InvoiceProduct.insertMany(invoiceProducts);
            const receiverEmail = ((_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.email) || userEmail;
            const receiverName = ((_d = req === null || req === void 0 ? void 0 : req.user) === null || _d === void 0 ? void 0 : _d.name) || userName;
            this.sendInvoiceEmail(receiverEmail, order, receiverName, invoiceProducts);
            const adminEmail = yield adminEmail_schema_1.AdminEmail.findOne();
            if (adminEmail) {
                this.sendInvoiceEmail(adminEmail.email, order, receiverName, invoiceProducts, true);
            }
            this.subsctractStock(req.body.carts);
            return invoice;
        });
        this.subsctractStock = (carts) => __awaiter(this, void 0, void 0, function* () {
            for (let cart of carts) {
                const product = yield product_schema_1.Product.findById(cart.productId);
                const productVariationIndex = product === null || product === void 0 ? void 0 : product.productVariations.findIndex((variation) => variation.color == cart.color._id && variation.size == cart.size._id);
                if (productVariationIndex != undefined && product) {
                    product.productVariations[productVariationIndex].stock = product.productVariations[productVariationIndex].stock - cart.quantity;
                    yield product.save();
                }
            }
        });
        this.sendInvoiceEmail = (email, invoiceNumber, name, carts, isAdmin = false) => __awaiter(this, void 0, void 0, function* () {
            const emailController = new emailController_1.EmailController();
            emailController.sendEmail(isAdmin ? "invoiceAdmin" : "invoice", email, "Factura ERoca", {
                "invoiceNumber": invoiceNumber,
                "user": name,
                "carts": carts
            });
        });
        this.clearCarts = (req) => __awaiter(this, void 0, void 0, function* () {
            var _e;
            yield cart_schema_1.Cart.deleteMany({ user: (_e = req === null || req === void 0 ? void 0 : req.user) === null || _e === void 0 ? void 0 : _e._id });
        });
    }
}
exports.CheckoutController = CheckoutController;
