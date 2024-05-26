"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statisticController_1 = require("../controllers/statisticController");
const router = (0, express_1.Router)();
const statisticController = new statisticController_1.StatisticController();
router.get('/', statisticController.statistic);
exports.default = router;
