"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dolarPriceController_1 = require("../controllers/dolarPriceController");
const router = (0, express_1.Router)();
const dolarPriceController = new dolarPriceController_1.DolarPriceController();
router.get('/', dolarPriceController.getDolarPrice);
exports.default = router;
