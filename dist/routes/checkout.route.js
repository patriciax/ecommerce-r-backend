"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const checkoutController_1 = require("../controllers/checkoutController");
const router = (0, express_1.Router)();
const checkoutController = new checkoutController_1.CheckoutController();
router.post('/', auth_middleware_1.authMiddlewareLoginNoRequired, checkoutController.paymentProcess);
exports.default = router;
