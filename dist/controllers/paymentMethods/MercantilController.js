"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.MercantilController = void 0;
const axios_1 = __importDefault(require("axios"));
const Crypto = __importStar(require("../../utils/cryptoFeatures.js"));
const dolarPrice_schema_1 = require("../../models/dolarPrice.schema");
const taxCalculation_1 = require("../../utils/taxCalculation");
const numberFormat_1 = require("../../utils/numberFormat");
class MercantilController {
    constructor() {
        this.makePayment = (data, cart, ivaType) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'X-IBM-Client-Id': process.env.MERCANTIL_HTTP_HEADER
                };
                const dolarPrice = yield dolarPrice_schema_1.DolarPrice.findOne({}).sort({ createdAt: -1 });
                const total = (_a = cart.reduce((acc, item) => acc + (item.priceDiscount || item.price) * item.quantity, 0) * (dolarPrice === null || dolarPrice === void 0 ? void 0 : dolarPrice.price)) !== null && _a !== void 0 ? _a : 1;
                const totalWithTax = (0, taxCalculation_1.taxCalculations)(total, ivaType);
                const formatedTotal = (0, numberFormat_1.decimalNumberFormat)(totalWithTax);
                const mercantilData = {
                    "merchant_identify": {
                        "integratorId": "1",
                        "merchantId": process.env.MERCANTIL_ID,
                        "terminalId": "1"
                    },
                    "client_identify": {
                        "ipaddress": data.ip,
                        "browser_agent": "Chrome 18.1.3",
                        "mobile": {
                            "manufacturer": "Samsung"
                        }
                    },
                    "transaction": {
                        "trx_type": "compra",
                        "payment_method": "tdd",
                        "card_number": data.cardNumber,
                        "customer_id": data.cardHolderId,
                        "invoice_number": data.transactionOrder,
                        "account_type": data.accountType,
                        "twofactor_auth": Crypto.encryptAES256(data.twofactorAuth, (_b = process.env.MERCANTIL_CYPHER_KEY) !== null && _b !== void 0 ? _b : ''),
                        "expiration_date": data.expirationDate.split('/').reverse().join('/'),
                        "cvv": Crypto.encryptAES256(data.cvc, (_c = process.env.MERCANTIL_CYPHER_KEY) !== null && _c !== void 0 ? _c : ''),
                        "currency": "ves",
                        "amount": formatedTotal
                    }
                };
                console.log(`mercantil ${process.env.MERCANTIL_API_URL}/payment/pay`);
                const response = yield axios_1.default.post(`${process.env.MERCANTIL_API_URL}/payment/pay`, mercantilData, {
                    headers
                });
                return response.data;
            }
            catch (error) {
                console.log(error.response.data);
                return error;
            }
        });
    }
    getOTPCode(req, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
        return __awaiter(this, void 0, void 0, function* () {
            const headers = {
                'Content-Type': 'application/json',
                'X-IBM-Client-Id': process.env.MERCANTIL_HTTP_HEADER
            };
            try {
                let ip = "";
                if (req.ip) {
                    ip = (_c = (_b = (_a = req.ip) === null || _a === void 0 ? void 0 : _a.split(':')) === null || _b === void 0 ? void 0 : _b.pop()) !== null && _c !== void 0 ? _c : '';
                }
                const mercantilData = {
                    "merchant_identify": {
                        "integratorId": "1",
                        "merchantId": process.env.MERCANTIL_ID,
                        "terminalId": "1"
                    },
                    "client_identify": {
                        "ipaddress": ip,
                        "browser_agent": "Chrome 18.1.3",
                        "mobile": {
                            "manufacturer": "Samsung",
                            "model": "S9",
                            "os_version": "Oreo 9.1",
                            "location": {
                                "lat": 37.422476,
                                "lng": 122.08425
                            }
                        }
                    },
                    "transaction_authInfo": {
                        "trx_type": "solaut",
                        "payment_method": "tdd",
                        "card_number": req.body.cardNumber,
                        "customer_id": req.body.identification
                    }
                };
                const response = yield axios_1.default.post(`${process.env.MERCANTIL_API_URL}/payment/getauth`, mercantilData, { headers });
                let label = "";
                let type = "";
                let fieldType = "";
                let length = "";
                if (response.data.authentication_info) {
                    label = Crypto.decryptAES256((_e = (_d = response.data) === null || _d === void 0 ? void 0 : _d.authentication_info) === null || _e === void 0 ? void 0 : _e.twofactor_label, (_f = process.env.MERCANTIL_CYPHER_KEY) !== null && _f !== void 0 ? _f : '');
                    type = Crypto.decryptAES256((_h = (_g = response.data) === null || _g === void 0 ? void 0 : _g.authentication_info) === null || _h === void 0 ? void 0 : _h.twofactor_type, (_j = process.env.MERCANTIL_CYPHER_KEY) !== null && _j !== void 0 ? _j : '');
                    fieldType = Crypto.decryptAES256((_l = (_k = response.data) === null || _k === void 0 ? void 0 : _k.authentication_info) === null || _l === void 0 ? void 0 : _l.twofactor_field_type, (_m = process.env.MERCANTIL_CYPHER_KEY) !== null && _m !== void 0 ? _m : '');
                    length = Crypto.decryptAES256((_p = (_o = response.data) === null || _o === void 0 ? void 0 : _o.authentication_info) === null || _p === void 0 ? void 0 : _p.twofactor_lenght, (_q = process.env.MERCANTIL_CYPHER_KEY) !== null && _q !== void 0 ? _q : '');
                }
                if (((_r = response.data.authentication_info) === null || _r === void 0 ? void 0 : _r.trx_status) != "approved") {
                    return res.status(400).json({
                        'status': 'fail'
                    });
                }
                return res.status(200).json({
                    'status': 'success',
                    'label': label,
                    'type': type,
                    'fieldType': fieldType,
                    'length': length
                });
            }
            catch (error) {
                console.log((_t = (_s = error === null || error === void 0 ? void 0 : error.response) === null || _s === void 0 ? void 0 : _s.data) !== null && _t !== void 0 ? _t : error);
                return res.status(400).json({
                    'status': 'fail'
                });
            }
        });
    }
}
exports.MercantilController = MercantilController;
