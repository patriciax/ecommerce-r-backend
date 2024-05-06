"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const countryController_1 = require("../controllers/countryController");
const router = (0, express_1.Router)();
const countryController = new countryController_1.CountryController();
router.get('/', countryController.countries);
exports.default = router;
