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
const product_schema_1 = require("../models/product.schema");
const invoice_schema_1 = require("../models/invoice.schema");
const randomNumbersGenerator_1 = require("../utils/randomNumbersGenerator");
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
            this.validateCart(req.body.carts);
            const tracnsactionOrder = yield this.generateInvoiceOrder();
            const paypalProcess = new PaypalController_1.PaypalController();
            if (req.body.paymentMethod === 'credits') {
            }
            else if (req.body.paymentMethod === 'paypal-create-order') {
                const order = yield paypalProcess.createOrder([]);
                return res.status(200).json({
                    order
                });
            }
            else if (req.body.paymentMethod === 'paypal-approve-order') {
                const response = yield paypalProcess.captureOrder(req.body.orderId);
                console.log(response);
                //this.generateInvoice(req, response)
                return res.status(200).json({
                    response
                });
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
                if (!product) {
                    cartProductsOverStock = true;
                    break;
                }
                if (cart.quantity > product.stock) {
                    cartProductsOverStock = true;
                    productOverStock.push(product.name);
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
        this.generateInvoice = (req, payment, order) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let userName = '';
            let userEmail = '';
            let userPhone = '';
            if (!((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id)) {
                userName = req.body.name;
                userEmail = req.body.email;
                userPhone = req.body.phone;
            }
            yield invoice_schema_1.Invoice.create({
                user: (_b = req === null || req === void 0 ? void 0 : req.user) === null || _b === void 0 ? void 0 : _b._id,
                name: userName,
                email: userEmail,
                phone: userPhone,
                transaction: order,
                products: req.body.carts
            });
            this.subsctractStock(req.body.carts);
        });
        this.subsctractStock = (carts) => __awaiter(this, void 0, void 0, function* () {
            for (let cart of carts) {
                const product = yield product_schema_1.Product.findById(cart.productId);
                if (product) {
                    product.stock = product.stock - cart.quantity;
                    yield product.save();
                }
            }
        });
    }
}
exports.CheckoutController = CheckoutController;
