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
exports.PagoMovilController = void 0;
const pagoMovil_schema_1 = require("../../models/pagoMovil.schema");
const dolarPrice_schema_1 = require("../../models/dolarPrice.schema");
class PagoMovilController {
    constructor() {
        this.createOrUpdatePagoMovil = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pagoMovil = yield pagoMovil_schema_1.PagoMovil.find({});
                if (pagoMovil.length > 0) {
                    pagoMovil[0].bank = req.body.bank;
                    pagoMovil[0].phone = req.body.phone;
                    pagoMovil[0].identification = req.body.identification;
                    yield pagoMovil[0].save();
                    return res.status(200).json({
                        status: 'success',
                        message: 'PAGO_MOVIL_UPDATED',
                        data: pagoMovil[0]
                    });
                }
                const newPagoMovil = yield pagoMovil_schema_1.PagoMovil.create({
                    bank: req.body.bank,
                    phone: req.body.phone,
                    identification: req.body.identification
                });
                return res.status(200).json({
                    status: 'success',
                    message: 'PAGO_MOVIL_CREATED',
                    data: newPagoMovil
                });
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({
                    status: 'error',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.deletePagoMovil = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pagoMovil = yield pagoMovil_schema_1.PagoMovil.find({});
                if (pagoMovil.length <= 0)
                    return res.status(404).json({ status: 'fail', message: 'PAGO_MOVIL_NOT_FOUND' });
                yield pagoMovil_schema_1.PagoMovil.findByIdAndDelete(pagoMovil[0]._id);
                return res.status(201).json({
                    status: 'success',
                    message: 'PAGO_MOVIL_DELETED'
                });
            }
            catch (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.getPagoMovil = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const pagoMovil = yield pagoMovil_schema_1.PagoMovil.find({});
                return res.status(200).json({
                    status: 'success',
                    data: pagoMovil[0]
                });
            }
            catch (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.makePayment = (data, cart) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const dolarPrice = yield dolarPrice_schema_1.DolarPrice.findOne({}).sort({ createdAt: -1 });
                const total = (_a = cart.reduce((acc, item) => acc + (item.priceDiscount || item.price) * item.quantity, 0) * (dolarPrice === null || dolarPrice === void 0 ? void 0 : dolarPrice.price)) !== null && _a !== void 0 ? _a : 1;
                return total;
            }
            catch (error) {
                return error;
            }
        });
    }
}
exports.PagoMovilController = PagoMovilController;
