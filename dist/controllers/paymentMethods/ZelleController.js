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
exports.ZelleController = void 0;
const dolarPrice_schema_1 = require("../../models/dolarPrice.schema");
const zelle_schema_1 = require("../../models/zelle.schema");
class ZelleController {
    constructor() {
        this.createOrUpdateZelle = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const zelle = yield zelle_schema_1.Zelle.find({});
                if (zelle.length > 0) {
                    zelle[0].email = req.body.email;
                    yield zelle[0].save();
                    return res.status(200).json({
                        status: 'success',
                        message: 'ZELLE_UPDATED',
                        data: zelle[0]
                    });
                }
                const newZelle = yield zelle_schema_1.Zelle.create({
                    email: req.body.email
                });
                return res.status(200).json({
                    status: 'success',
                    message: 'ZELLE_CREATED',
                    data: newZelle
                });
            }
            catch (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.deleteZelle = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const zelle = yield zelle_schema_1.Zelle.find({});
                if (zelle.length <= 0)
                    return res.status(404).json({ status: 'fail', message: 'ZELLE_NOT_FOUND' });
                yield zelle_schema_1.Zelle.findByIdAndDelete(zelle[0]._id);
                return res.status(201).json({
                    status: 'success',
                    message: 'ZELLE_DELETED'
                });
            }
            catch (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'SOMETHING_WENT_WRONG'
                });
            }
        });
        this.getZelle = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const zelle = yield zelle_schema_1.Zelle.find({});
                return res.status(200).json({
                    status: 'success',
                    data: zelle[0]
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
exports.ZelleController = ZelleController;
