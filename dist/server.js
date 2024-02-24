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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const schedule = __importStar(require("node-schedule"));
//import { initCloudinary } from './config/cloudinary';
const products_route_1 = __importDefault(require("./routes/products.route"));
const users_route_1 = __importDefault(require("./routes/users.route"));
const categories_route_1 = __importDefault(require("./routes/categories.route"));
const sizes_route_1 = __importDefault(require("./routes/sizes.route"));
const colors_route_1 = __importDefault(require("./routes/colors.route"));
const giftCards_route_1 = __importDefault(require("./routes/giftCards.route"));
const clients_route_1 = __importDefault(require("./routes/clients.route"));
const carts_route_1 = __importDefault(require("./routes/carts.route"));
const newsletter_route_1 = __importDefault(require("./routes/newsletter.route"));
const newsletterController_1 = require("./controllers/newsletterController");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const result = dotenv_1.default.config({ path: `${__dirname}/config.env` });
const dbString = process.env.DATABASE || '';
mongoose_1.default.connect(dbString).then(() => {
    console.log('Connected to MongoDB');
});
const newsletterController = new newsletterController_1.NewsletterController();
//initCloudinary()
const rule = new schedule.RecurrenceRule();
rule.hour = 10;
const app = (0, express_1.default)();
app.use(body_parser_1.default.json({ limit: '35mb' }));
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5000', 'https://ecommerce-dashboard.sytes.net'],
}));
app.use(express_1.default.json());
app.use(express_1.default.static('uploads'));
app.use("/api/v1/products", products_route_1.default);
app.use("/api/v1/users", users_route_1.default);
app.use("/api/v1/categories", categories_route_1.default);
app.use("/api/v1/sizes", sizes_route_1.default);
app.use("/api/v1/colors", colors_route_1.default);
app.use("/api/v1/gift-cards", giftCards_route_1.default);
app.use("/api/v1/clients", clients_route_1.default);
app.use("/api/v1/carts", carts_route_1.default);
app.use("/api/v1/newsletter", newsletter_route_1.default);
app.all('*', (req, res, next) => {
    return res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server`
    });
});
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
schedule.scheduleJob(rule, function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield newsletterController.sendNewsletters();
    });
});
