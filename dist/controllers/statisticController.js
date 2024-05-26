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
exports.StatisticController = void 0;
const payments_schema_1 = require("../models/payments.schema");
const dolarPrice_schema_1 = require("../models/dolarPrice.schema");
const user_schema_1 = require("../models/user.schema");
const role_schema_1 = require("../models/role.schema");
const invoice_schema_1 = require("../models/invoice.schema");
const allTimePayments_1 = require("../models/allTimePayments");
const allTimePurchases_schema_1 = require("../models/allTimePurchases.schema");
class StatisticController {
    constructor() {
        this.totalPayments = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const allPayments = yield allTimePayments_1.AllTimePayment.findOne({});
            return (_a = allPayments === null || allPayments === void 0 ? void 0 : allPayments.amount) !== null && _a !== void 0 ? _a : 0;
        });
        this.todayBolivars = () => __awaiter(this, void 0, void 0, function* () {
            let startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            let endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const bolivarsRevenues = yield payments_schema_1.Payment.find({
                type: {
                    $in: ["pagoMovil", "banesco", "mercantil"]
                },
                created: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            });
            return bolivarsRevenues.reduce((acc, payment) => acc + payment.total + payment.taxAmount, 0);
        });
        this.todayDolars = () => __awaiter(this, void 0, void 0, function* () {
            let startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            let endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            const dolarsRevenue = yield payments_schema_1.Payment.find({
                type: {
                    $in: ["paypal", "zelle", "giftCard"]
                },
                created: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            });
            return dolarsRevenue.reduce((acc, payment) => { var _a; return acc + payment.total + payment.taxAmount + (payment.createRate ? ((_a = payment === null || payment === void 0 ? void 0 : payment.createRate) === null || _a === void 0 ? void 0 : _a.amount) * 1 : 0); }, 0);
        });
        this.getClients = () => __awaiter(this, void 0, void 0, function* () {
            const clientRole = yield role_schema_1.Role.findOne({ name: "CUSTOMERS" });
            const clients = yield user_schema_1.User.find({ role: clientRole === null || clientRole === void 0 ? void 0 : clientRole._id });
            return clients.length;
        });
        this.latestSales = () => __awaiter(this, void 0, void 0, function* () {
            const latestSales = yield invoice_schema_1.Invoice.find()
                .sort("createdAt")
                .limit(10)
                .populate({
                path: 'payment',
                match: { status: 'approved' }
            })
                .populate("invoiceProduct");
            return latestSales;
        });
        this.mostPurchasedProducts = () => __awaiter(this, void 0, void 0, function* () {
            const products = yield allTimePurchases_schema_1.AllTimePurchase.find().sort({ amount: -1 }).limit(10).populate("product").populate("size").populate("color");
            return products;
        });
        this.lessPurchasedProducts = () => __awaiter(this, void 0, void 0, function* () {
            const products = yield allTimePurchases_schema_1.AllTimePurchase.find().sort("amount").limit(10).populate("product").populate("size").populate("color");
            return products;
        });
        this.statistic = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const dolarPrice = yield dolarPrice_schema_1.DolarPrice.findOne({});
            const totalPaymentsAmount = yield this.totalPayments();
            const clients = yield this.getClients();
            const latestSales = yield this.latestSales();
            const todayBolivars = yield this.todayBolivars();
            const todayDolars = yield this.todayDolars();
            const mostPurchasedProducts = yield this.mostPurchasedProducts();
            const lessPurchasedProducts = yield this.lessPurchasedProducts();
            const bolivarDolar = todayBolivars / ((_b = dolarPrice === null || dolarPrice === void 0 ? void 0 : dolarPrice.price) !== null && _b !== void 0 ? _b : 1);
            const todayPurchase = bolivarDolar + todayDolars;
            res.status(200).json({
                totalPayment: totalPaymentsAmount,
                clients,
                latestSales,
                todayPurchase,
                mostPurchasedProducts,
                lessPurchasedProducts
            });
        });
    }
}
exports.StatisticController = StatisticController;
