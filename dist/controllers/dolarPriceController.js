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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DolarPriceController = void 0;
const axios_1 = __importDefault(require("axios"));
const dolarPrice_schema_1 = require("../models/dolarPrice.schema");
class DolarPriceController {
    constructor() {
        this.updateDolarPrice = () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const response = yield axios_1.default.get('https://pydolarvenezuela-api.vercel.app/api/v1/dollar');
            try {
                if (response.data) {
                    const price = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.monitors) === null || _b === void 0 ? void 0 : _b.bcv) === null || _c === void 0 ? void 0 : _c.price;
                    const dolarPrice = yield dolarPrice_schema_1.DolarPrice.findOne();
                    if (!dolarPrice) {
                        yield dolarPrice_schema_1.DolarPrice.create({ price: price });
                        return;
                    }
                    dolarPrice.price = price;
                    dolarPrice.updatedAt = new Date();
                    dolarPrice.save();
                }
            }
            catch (err) {
                console.log(err);
            }
        });
        this.getDolarPrice = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const dolarPrice = yield dolarPrice_schema_1.DolarPrice.findOne();
            return res.status(200).json({
                price: dolarPrice === null || dolarPrice === void 0 ? void 0 : dolarPrice.price
            });
        });
    }
}
exports.DolarPriceController = DolarPriceController;
