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
const pagoMovilController_1 = require("./paymentMethods/pagoMovilController");
const dolarPrice_schema_1 = require("../models/dolarPrice.schema");
const pagoMovil_schema_1 = require("../models/pagoMovil.schema");
const ZelleController_1 = require("./paymentMethods/ZelleController");
const zelle_schema_1 = require("../models/zelle.schema");
const shipmentController_1 = require("./shipmentController");
const allTimePayments_1 = require("../models/allTimePayments");
const allTimePurchases_schema_1 = require("../models/allTimePurchases.schema");
const user_schema_1 = require("../models/user.schema");
const MercantilController_1 = require("./paymentMethods/MercantilController");
const InvoiceController_1 = require("./InvoiceController");
const path_1 = require("path");
const promises_1 = require("fs/promises");
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
            var _a, _b, _c, _d, _e;
            const shipmentController = new shipmentController_1.ShipmentController();
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
                    tracnsactionOrder = yield this.generateInvoiceOrder();
                    const creditCardRocaController = new CreditCardRocaController_1.CreditCardRocaController();
                    const response = yield creditCardRocaController.makePayment(req.body, req.body.carts);
                    const payment = yield this.generatePayment(req, 'giftCard', tracnsactionOrder, (response === null || response === void 0 ? void 0 : response.status) == 'success' ? "approved" : "rejected", 'invoice', req.body.carrierRate);
                    if ((response === null || response === void 0 ? void 0 : response.status) == 'success') {
                        let trackingNumber = '';
                        if (req.body.carrierRate) {
                            const shippingResponse = yield shipmentController.createShipment(req.body.carrierRate.objectId);
                            trackingNumber = shippingResponse.trackingNumber;
                        }
                        const invoice = yield this.generateInvoice(req, tracnsactionOrder, payment, 'invoice', trackingNumber);
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
                const order = yield paypalProcess.createOrder(req.body.carts, req.body.ivaType, req.body.carrierRate);
                return res.status(200).json({
                    order,
                    "transactionOrder": tracnsactionOrder
                });
            }
            else if (req.body.paymentMethod === 'paypal-approve-order') {
                try {
                    const paypalProcess = new PaypalController_1.PaypalController();
                    const response = yield paypalProcess.captureOrder(req.body.orderId);
                    const payment = yield this.generatePayment(req, 'paypal', req.body.orderId, (response === null || response === void 0 ? void 0 : response.status) == 'COMPLETED' ? "approved" : "rejected", 'invoice', req.body.carrierRate);
                    if (response.status == 'COMPLETED') {
                        let trackingNumber = "";
                        if (req.body.carrierRate) {
                            const shippingResponse = yield shipmentController.createShipment(req.body.carrierRate.objectId);
                            trackingNumber = shippingResponse.trackingNumber;
                        }
                        const invoice = yield this.generateInvoice(req, req.body.orderId, payment, 'invoice', trackingNumber);
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
                    const ip = req.ip.split(':').pop();
                    req.body.banescoData.ip = ip;
                    tracnsactionOrder = yield this.generateInvoiceOrder();
                    req.body.transactionOrder = tracnsactionOrder;
                    const banescoProcess = new BanescoController_1.BanescoController();
                    const response = yield banescoProcess.makePayment(req.body.banescoData, req.body.carts, 'national');
                    const payment = yield this.generatePayment(req, 'banesco', tracnsactionOrder, response.success ? "approved" : "rejected");
                    console.log("response", response);
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
                    console.log("error", error);
                    return res.status(400).json({
                        status: 'fail',
                        message: 'PAYMENT_FAILED'
                    });
                }
            }
            else if (req.body.paymentMethod === 'mercantil') {
                try {
                    const ip = (_c = (_b = (_a = req.ip) === null || _a === void 0 ? void 0 : _a.split(':')) === null || _b === void 0 ? void 0 : _b.pop()) !== null && _c !== void 0 ? _c : '';
                    req.body.mercantilData.ip = ip;
                    tracnsactionOrder = yield this.generateInvoiceOrder();
                    req.body.mercantilData.transactionOrder = tracnsactionOrder.substring(0, 12);
                    const mercantilProcess = new MercantilController_1.MercantilController();
                    const response = yield mercantilProcess.makePayment(req.body.mercantilData, req.body.carts, 'national');
                    const payment = yield this.generatePayment(req, 'mercantil', tracnsactionOrder, ((_d = response === null || response === void 0 ? void 0 : response.transaction_response) === null || _d === void 0 ? void 0 : _d.trx_status) == 'approved' ? "approved" : "rejected");
                    if (((_e = response === null || response === void 0 ? void 0 : response.transaction_response) === null || _e === void 0 ? void 0 : _e.trx_status) == 'approved') {
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
            else if (req.body.paymentMethod === 'pagoMovil') {
                try {
                    const pagoMovilProcess = new pagoMovilController_1.PagoMovilController();
                    const response = yield pagoMovilProcess.makePayment(req.body.pagoMovilData, req.body.carts);
                    const payment = yield this.generatePayment(req, 'pagoMovil', tracnsactionOrder, response);
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
                catch (error) {
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
                    const carrierRate = req.body.carrierRate ? req.body.carrierRate : null;
                    const payment = yield this.generatePayment(req, 'zelle', tracnsactionOrder, response, 'invoice', carrierRate);
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
                catch (error) {
                    console.log(error);
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
        this.generatePayment = (req, payment, order, paymentStatus, purchaseType = 'invoice', carrierRate = null) => __awaiter(this, void 0, void 0, function* () {
            var _f, _g, _h, _j, _k, _l, _m;
            let userName = '';
            let userEmail = '';
            let userPhone = '';
            userName = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.name : req.body.name;
            userEmail = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.email : req.body.email;
            userPhone = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.phone : req.body.phone;
            let pagoMovilData = null;
            let zelleData = null;
            if (payment == 'pagoMovil')
                pagoMovilData = yield pagoMovil_schema_1.PagoMovil.find({});
            if (payment == 'zelle')
                zelleData = yield zelle_schema_1.Zelle.find({});
            let total = 0;
            const dolarPrice = yield dolarPrice_schema_1.DolarPrice.findOne({}).sort({ createdAt: -1 });
            if (purchaseType == 'invoice')
                total = (_g = (_f = req.body.carts) === null || _f === void 0 ? void 0 : _f.reduce((acc, item) => acc + (item.priceDiscount || item.price) * item.quantity, 0)) !== null && _g !== void 0 ? _g : 0;
            else if (purchaseType == 'giftCard')
                total = req.body.card.total;
            const finalTotal = payment == 'banesco' || payment == 'pagoMovil' || payment == 'mercantil' ? total * (dolarPrice === null || dolarPrice === void 0 ? void 0 : dolarPrice.price) : total;
            const subtotal = (finalTotal + (carrierRate ? (carrierRate === null || carrierRate === void 0 ? void 0 : carrierRate.amount) * 1 : 0));
            let taxAmount = purchaseType == 'invoice' ? subtotal * (carrierRate ? 0.06998 : 0.16) : 0;
            const paymentModel = yield payments_schema_1.Payment.create({
                user: (_h = req === null || req === void 0 ? void 0 : req.user) === null || _h === void 0 ? void 0 : _h._id,
                name: userName,
                identification: req.body.identification,
                email: userEmail,
                phone: userPhone,
                transactionId: order,
                type: payment,
                status: payment == 'pagoMovil' || payment == 'zelle' ? 'pending' : paymentStatus,
                total: finalTotal,
                bank: payment == 'pagoMovil' ? (_j = pagoMovilData[0]) === null || _j === void 0 ? void 0 : _j.bank : undefined,
                zelleEmail: payment == 'zelle' ? (_k = zelleData[0]) === null || _k === void 0 ? void 0 : _k.email : undefined,
                purchaseType,
                taxAmount,
                carrierRate,
                carrierRateAmount: (_l = carrierRate === null || carrierRate === void 0 ? void 0 : carrierRate.amount) !== null && _l !== void 0 ? _l : undefined
            });
            if (payment != 'pagoMovil' && payment != 'zelle' && payment != 'giftCard') {
                let allTimePaymentTotal = taxAmount + finalTotal;
                allTimePaymentTotal = allTimePaymentTotal * 1 + ((carrierRate === null || carrierRate === void 0 ? void 0 : carrierRate.amount) ? parseFloat(carrierRate === null || carrierRate === void 0 ? void 0 : carrierRate.amount) : 0) * 1;
                if (payment == 'banesco' || payment == 'mercantil') {
                    allTimePaymentTotal = allTimePaymentTotal / dolarPrice.price;
                }
                const allTimePaymentFind = yield allTimePayments_1.AllTimePayment.findOne({});
                if (!allTimePaymentFind) {
                    yield allTimePayments_1.AllTimePayment.create({
                        amount: allTimePaymentTotal
                    });
                }
                else {
                    const totalToUpdate = ((_m = allTimePaymentFind.amount) !== null && _m !== void 0 ? _m : 0) * 1 + allTimePaymentTotal * 1;
                    yield allTimePayments_1.AllTimePayment.findByIdAndUpdate(allTimePaymentFind._id, {
                        amount: totalToUpdate
                    });
                }
            }
            return paymentModel;
        });
        this.generateInvoice = (req, order, paymentModel, purchaseType = 'invoice', trackingNumber = '') => __awaiter(this, void 0, void 0, function* () {
            var _o, _p, _q, _r, _s, _t, _u, _v;
            const invoiceController = new InvoiceController_1.InvoiceController();
            let userName = '';
            let userEmail = '';
            let userPhone = '';
            userName = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.name : req.body.name;
            userEmail = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.email : req.body.email;
            userPhone = (req === null || req === void 0 ? void 0 : req.user) ? req === null || req === void 0 ? void 0 : req.user.phone : req.body.phone;
            if (req === null || req === void 0 ? void 0 : req.user) {
                yield user_schema_1.User.findByIdAndUpdate((_o = req === null || req === void 0 ? void 0 : req.user) === null || _o === void 0 ? void 0 : _o._id, {
                    identification: req.body.identification,
                });
            }
            const invoice = yield invoice_schema_1.Invoice.create({
                user: (_p = req === null || req === void 0 ? void 0 : req.user) === null || _p === void 0 ? void 0 : _p._id,
                name: userName,
                email: userEmail,
                phone: userPhone,
                transactionOrder: order,
                payment: paymentModel._id,
                carrier: req.body.carrier,
                purchaseType,
                pagoMovilReference: (_r = (_q = req.body.pagoMovilData) === null || _q === void 0 ? void 0 : _q.reference) !== null && _r !== void 0 ? _r : undefined,
                pagoMovilDate: (_t = (_s = req.body.pagoMovilData) === null || _s === void 0 ? void 0 : _s.date) !== null && _t !== void 0 ? _t : undefined,
                shippingTracking: trackingNumber !== null && trackingNumber !== void 0 ? trackingNumber : undefined
            });
            if (purchaseType == 'invoice') {
                const invoiceProducts = [];
                for (let cart of req.body.carts) {
                    const productModel = cart.name;
                    const sizeModel = cart.size.name;
                    const colorModel = cart.color.name;
                    const searchProduct = yield allTimePurchases_schema_1.AllTimePurchase.findOne({
                        product: cart.productId,
                        size: cart.size._id,
                        color: cart.color._id,
                    });
                    if (!searchProduct) {
                        console.log(cart);
                        console.log(cart.productId, cart.size._id, cart.color._id);
                        yield allTimePurchases_schema_1.AllTimePurchase.create({
                            product: cart.productId,
                            size: cart.size._id,
                            color: cart.color._id,
                            amount: cart.quantity
                        });
                    }
                    else {
                        searchProduct.amount = searchProduct.amount + cart.quantity;
                        yield searchProduct.save();
                    }
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
                const receiverEmail = ((_u = req === null || req === void 0 ? void 0 : req.user) === null || _u === void 0 ? void 0 : _u.email) || userEmail;
                const receiverName = ((_v = req === null || req === void 0 ? void 0 : req.user) === null || _v === void 0 ? void 0 : _v.name) || userName;
                const name = yield invoiceController.generatePDFProducts();
                const attachments = [
                    {
                        filename: name,
                        path: (0, path_1.resolve)(__dirname, '../uploads', name)
                    }
                ];
                this.sendInvoiceEmail(receiverEmail, order, receiverName, invoiceProducts, false, trackingNumber, attachments);
                const adminEmail = yield adminEmail_schema_1.AdminEmail.findOne();
                if (adminEmail) {
                    this.sendInvoiceEmail(adminEmail.email, order, receiverName, invoiceProducts, true, trackingNumber);
                }
                this.subsctractStock(req.body.carts);
                yield (0, promises_1.unlink)((0, path_1.resolve)(__dirname, '../uploads', name));
            }
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
        this.sendInvoiceEmail = (email, invoiceNumber, name, carts, isAdmin = false, trackingNumber = "", attachments = []) => __awaiter(this, void 0, void 0, function* () {
            const emailController = new emailController_1.EmailController();
            emailController.sendEmail(isAdmin ? "invoiceAdmin" : "invoice", email, "Factura ERoca", {
                "invoiceNumber": invoiceNumber,
                "user": name,
                "carts": carts,
                "trackingNumber": trackingNumber
            }, attachments);
        });
        this.clearCarts = (req) => __awaiter(this, void 0, void 0, function* () {
            var _w;
            yield cart_schema_1.Cart.deleteMany({ user: (_w = req === null || req === void 0 ? void 0 : req.user) === null || _w === void 0 ? void 0 : _w._id });
        });
    }
}
exports.CheckoutController = CheckoutController;
