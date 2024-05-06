"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shipmentController_1 = require("../controllers/shipmentController");
const router = (0, express_1.Router)();
const shipmentController = new shipmentController_1.ShipmentController();
router.post('/', shipmentController.getRates);
exports.default = router;
