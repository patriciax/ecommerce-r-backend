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
const checkout_route_1 = __importDefault(require("./routes/checkout.route"));
const banners_route_1 = __importDefault(require("./routes/banners.route"));
const zoom_route_1 = __importDefault(require("./routes/zoom.route"));
const invoices_route_1 = __importDefault(require("./routes/invoices.route"));
const dolarPrice_route_1 = __importDefault(require("./routes/dolarPrice.route"));
const country_route_1 = __importDefault(require("./routes/country.route"));
const favorite_route_1 = __importDefault(require("./routes/favorite.route"));
const pagomovil_route_1 = __importDefault(require("./routes/pagomovil.route"));
const zelle_route_1 = __importDefault(require("./routes/zelle.route"));
const shipment_route_1 = __importDefault(require("./routes/shipment.route"));
const footer_route_1 = __importDefault(require("./routes/footer.route"));
const statistic_route_1 = __importDefault(require("./routes/statistic.route"));
const mercantil_route_1 = __importDefault(require("./routes/mercantil.route"));
const testing_route_1 = __importDefault(require("./routes/testing.route"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const newsletter_job_1 = require("./jobs/newsletter.job");
const dolarPrice_job_1 = require("./jobs/dolarPrice.job");
const result = dotenv_1.default.config({ path: `${__dirname}/config.env` });
const dbString = process.env.DATABASE || '';
mongoose_1.default.connect(dbString).then(() => {
    console.log('Connected to MongoDB');
});
//initCloudinary()
const app = (0, express_1.default)();
app.set('trust proxy', true);
app.use(body_parser_1.default.json({ limit: '35mb' }));
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000', 'https://rcroca.com', 'https://www.rcroca.com', 'https://dashboard.rcroca.com'],
}));
app.use(express_1.default.json());
app.use(express_1.default.static('uploads'));
app.use("/api/v1/banners", banners_route_1.default);
app.use("/api/v1/products", products_route_1.default);
app.use("/api/v1/users", users_route_1.default);
app.use("/api/v1/categories", categories_route_1.default);
app.use("/api/v1/sizes", sizes_route_1.default);
app.use("/api/v1/colors", colors_route_1.default);
app.use("/api/v1/gift-cards", giftCards_route_1.default);
app.use("/api/v1/clients", clients_route_1.default);
app.use("/api/v1/carts", carts_route_1.default);
app.use("/api/v1/newsletter", newsletter_route_1.default);
app.use("/api/v1/checkout", checkout_route_1.default);
app.use("/api/v1/zoom", zoom_route_1.default);
app.use("/api/v1/invoices", invoices_route_1.default);
app.use("/api/v1/dolar-price", dolarPrice_route_1.default);
app.use("/api/v1/countries", country_route_1.default);
app.use("/api/v1/favorites", favorite_route_1.default);
app.use("/api/v1/pago-movil", pagomovil_route_1.default);
app.use("/api/v1/zelle", zelle_route_1.default);
app.use("/api/v1/shipment", shipment_route_1.default);
app.use("/api/v1/footers", footer_route_1.default);
app.use("/api/v1/statistics", statistic_route_1.default);
app.use("/api/v1/mercantil", mercantil_route_1.default);
app.use("/api/v1/testing-email", testing_route_1.default);
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
