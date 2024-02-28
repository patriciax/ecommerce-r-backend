"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
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
const newsletter_job_1 = require("./jobs/newsletter.job");
const dolarPrice_job_1 = require("./jobs/dolarPrice.job");
const result = dotenv_1.default.config({ path: `${__dirname}/config.env` });
const dbString = process.env.DATABASE || '';
mongoose_1.default.connect(dbString).then(() => {
    console.log('Connected to MongoDB');
});
const newsletterController = new newsletterController_1.NewsletterController();
//initCloudinary()
const app = (0, express_1.default)();
app.use(body_parser_1.default.json({ limit: '35mb' }));
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000', 'https://ecommerce-dashboard.sytes.net'],
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
const newsLetterJob = new newsletter_job_1.NewsletterJob();
const dolaPriceJob = new dolarPrice_job_1.DolarPriceJob();
newsLetterJob.sendNewsletter();
dolaPriceJob.updateDolarPrice();
