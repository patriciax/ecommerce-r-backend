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
class CheckoutController {
    constructor() {
        this.paymentMethods = [
            'credits',
            'paypal-create-order',
            'paypal-approve-order',
            'stripe',
            'mercantil',
            'banesco'
        ];
        this.paymentProcess = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
                return res.status(200).json({
                    response
                });
            }
            return res.status(200).json({
                status: 'success',
                message: 'Payment process'
            });
        });
    }
}
exports.CheckoutController = CheckoutController;
