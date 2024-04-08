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
exports.PaypalController = void 0;
const axios_1 = __importDefault(require("axios"));
class PaypalController {
    constructor() {
        this.baseUrl = () => process.env.PAYPAL_ENVIRONMENT === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
        this.generateAccessToken = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const res = yield (0, axios_1.default)({
                    method: 'post',
                    url: 'https://api.sandbox.paypal.com/v1/oauth2/token',
                    data: 'grant_type=client_credentials', // => this is mandatory x-www-form-urlencoded. DO NOT USE json format for this
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded', // => needed to handle data parameter
                        'Accept-Language': 'en_US',
                    },
                    auth: {
                        username: process.env.PAYPAL_CLIENT_ID || '',
                        password: process.env.PAYPAL_CLIENT_SECRET || ''
                    },
                });
                return (_a = res.data) === null || _a === void 0 ? void 0 : _a.access_token;
            }
            catch (error) {
            }
        });
        this.createOrder = (cart) => __awaiter(this, void 0, void 0, function* () {
            const total = cart.reduce((acc, item) => acc + (item.priceDiscount || item.price) * item.quantity, 0);
            const accessToken = yield this.generateAccessToken();
            const url = `${this.baseUrl()}/v2/checkout/orders`;
            const payload = {
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: total,
                        },
                    },
                ],
            };
            const response = yield axios_1.default.post(url, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                }
            });
            /*const response = await fetch(url, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
                // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
                // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
                // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
                // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
              },
              method: "POST",
              body: JSON.stringify(payload),
            });*/
            console.log(response.data);
            return response.data;
        });
        this.captureOrder = (orderID) => __awaiter(this, void 0, void 0, function* () {
            try {
                const accessToken = yield this.generateAccessToken();
                const url = `${this.baseUrl()}/v2/checkout/orders/${orderID}/capture`;
                const response = yield axios_1.default.post(url, null, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                /*const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                    // Uncomment one of these to force an error for negative testing (in sandbox mode only). Documentation:
                    // https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
                    // "PayPal-Mock-Response": '{"mock_application_codes": "INSTRUMENT_DECLINED"}'
                    // "PayPal-Mock-Response": '{"mock_application_codes": "TRANSACTION_REFUSED"}'
                    // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
                },
                });*/
                return response.data;
            }
            catch (error) {
                //console.log(error)
            }
        });
    }
}
exports.PaypalController = PaypalController;
