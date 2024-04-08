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
class InvoiceController {
    constructor() {
        this.listInvoices = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const features = new apiFeatures_1.APIFeatures(invoice_schema_1.Invoice.find().populate('user').populate("invoiceProduct"), req.query)
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
    }
}
exports.InvoiceController = InvoiceController;
