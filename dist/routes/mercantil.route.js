"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MercantilController_1 = require("../controllers/paymentMethods/MercantilController");
const router = (0, express_1.Router)();
const mercantilController = new MercantilController_1.MercantilController();
router.post('/get-sms-code', mercantilController.getOTPCode);
exports.default = router;
