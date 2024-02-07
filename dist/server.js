"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = require("./config/cloudinary");
const products_route_1 = __importDefault(require("./routes/products.route"));
const users_route_1 = __importDefault(require("./routes/users.route"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const result = dotenv_1.default.config({ path: `${__dirname}/'config.env'` });
console.log("node_env", process.env.NODE_ENV);
console.log("database", process.env.DATABASE);
const dbString = process.env.DATABASE || '';
mongoose_1.default.connect(dbString).then(() => {
    console.log('Connected to MongoDB');
});
(0, cloudinary_1.initCloudinary)();
const app = (0, express_1.default)();
app.use(body_parser_1.default.json({ limit: '35mb' }));
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5000', 'http://ecommerce-dashboard.sytes.net'],
}));
app.use(express_1.default.json());
app.use(express_1.default.static('uploads'));
app.use("/api/v1/products", products_route_1.default);
app.use("/api/v1/users", users_route_1.default);
app.use("/api/v1/dashboard/users", users_route_1.default);
app.all('*', (req, res, next) => {
    return res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server`
    });
});
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
