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
exports.InvoiceController = void 0;
const invoice_schema_1 = require("../models/invoice.schema");
const apiFeatures_1 = require("../utils/apiFeatures");
const emailController_1 = require("./emailController");
const payments_schema_1 = require("../models/payments.schema");
const invoiceProduct_schema_1 = require("../models/invoiceProduct.schema");
const product_schema_1 = require("../models/product.schema");
const shipmentController_1 = require("./shipmentController");
const allTimePayments_1 = require("../models/allTimePayments");
class InvoiceController {
    constructor() {
        this.listInvoices = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const features = new apiFeatures_1.APIFeatures(invoice_schema_1.Invoice.find().populate("payment").populate('user').populate("invoiceProduct"), req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate();
                const invoices = yield features.query;
                const totalInvoices = yield invoice_schema_1.Invoice.find();
                const totalPages = totalInvoices.length / Number(((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.limit) || 1);
                return res.status(200).json({
                    status: 'success',
                    totalPages: Math.ceil(totalPages),
                    results: invoices.length,
                    data: {
                        invoices
                    }
                });
            }
            catch (error) {
                console.log(error);
            }
        });
        this.updateInvoice = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            try {
                const invoice = yield invoice_schema_1.Invoice.findByIdAndUpdate(req.params.invoice, {
                    shippingTracking: req.body.shippingTracking,
                });
                if (!invoice) {
                    return res.status(404).json({
                        status: 'fail',
                        message: "NOT_FOUND"
                    });
                }
                const emailController = new emailController_1.EmailController();
                emailController.sendEmail("shipTracking", (_b = invoice === null || invoice === void 0 ? void 0 : invoice.email) !== null && _b !== void 0 ? _b : '', "Tracking de envío", {
                    "invoiceNumber": invoice.transactionOrder,
                    "tracking": invoice.shippingTracking
                });
                return res.status(200).json({
                    status: 'success',
                    data: {
                        invoice
                    }
                });
            }
            catch (error) {
            }
        });
        this.updateInvoiceStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d, _e, _f;
            try {
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
                if (payment.status == 'rejected') {
                    const invoiceProducts = yield invoiceProduct_schema_1.InvoiceProduct.find({ invoice: invoice._id });
                    invoiceProducts.forEach((invoiceProduct) => __awaiter(this, void 0, void 0, function* () {
                        const product = yield product_schema_1.Product.findById(invoiceProduct.product);
                        if (product) {
                            product.productVariations.forEach(variation => {
                                var _a, _b;
                                if (((_a = invoiceProduct.size) === null || _a === void 0 ? void 0 : _a._id.toString()) == variation.size[0].toString() && ((_b = invoiceProduct.color) === null || _b === void 0 ? void 0 : _b._id.toString()) == variation.color[0].toString()) {
                                    variation.stock = variation.stock + invoiceProduct.quantity;
                                }
                            });
                            yield (product === null || product === void 0 ? void 0 : product.save());
                        }
                    }));
                    const emailController = new emailController_1.EmailController();
                    emailController.sendEmail("rejectedPayment", (_c = invoice === null || invoice === void 0 ? void 0 : invoice.email) !== null && _c !== void 0 ? _c : '', "Pago rechazado", {
                        "reference": invoice.pagoMovilReference
                    });
                }
                else {
                    let allTimePaymentTotal = payment.taxAmount + payment.total;
                    allTimePaymentTotal = allTimePaymentTotal * 1 + (((_d = payment === null || payment === void 0 ? void 0 : payment.carrierRate) === null || _d === void 0 ? void 0 : _d.amount) ? parseFloat((_e = payment === null || payment === void 0 ? void 0 : payment.carrierRate) === null || _e === void 0 ? void 0 : _e.amount) : 0) * 1;
                    const allTimePaymentFind = yield allTimePayments_1.AllTimePayment.findOne({});
                    if (!allTimePaymentFind) {
                        yield allTimePayments_1.AllTimePayment.create({
                            amount: allTimePaymentTotal
                        });
                    }
                    else {
                        const totalToUpdate = ((_f = allTimePaymentFind.amount) !== null && _f !== void 0 ? _f : 0) * 1 + allTimePaymentTotal * 1;
                        yield allTimePayments_1.AllTimePayment.findByIdAndUpdate(allTimePaymentFind._id, {
                            amount: totalToUpdate
                        });
                    }
                    if (payment.carrierRate) {
                        const shipmentController = new shipmentController_1.ShipmentController();
                        const response = yield shipmentController.createShipment(payment.carrierRate.objectId);
                        invoice.shippingTracking = response.trackingNumber;
                    }
                    yield invoice.save();
                }
                yield payment.save();
                return res.status(200).json({
                    status: 'success',
                    data: {
                        payment
                    }
                });
            }
            catch (error) {
                console.log(error);
                return error;
            }
        });
        this.userInvoices = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const features = new apiFeatures_1.APIFeatures(invoice_schema_1.Invoice.find({ user: req.user._id, purchaseType: 'invoice' }).populate("payment").populate("invoiceProduct"), req.query)
                    .filter()
                    .sort()
                    .limitFields()
                    .paginate();
                const invoices = yield features.query;
                return res.status(200).json({
                    status: 'success',
                    results: invoices.length,
                    data: {
                        invoices
                    }
                });
            }
            catch (error) {
                return res.status(400).json({
                    status: 'error'
                });
            }
        });
    }
}
exports.InvoiceController = InvoiceController;
