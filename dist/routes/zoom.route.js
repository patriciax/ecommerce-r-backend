"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zoomController_1 = require("../controllers/zoomController");
const MercantilController_1 = require("../controllers/paymentMethods/MercantilController");
const router = (0, express_1.Router)();
const zoomController = new zoomController_1.ZoomController();
const mercantilController = new MercantilController_1.MercantilController();
router.get('/get-states', zoomController.getStates);
router.get('/states/:state/offices', zoomController.getOffices);
router.get('/tracking/:tracking', zoomController.getTracking);
//router.get('test', mercantilController.decrypt)
exports.default = router;
