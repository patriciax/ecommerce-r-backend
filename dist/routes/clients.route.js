"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const clientController_1 = require("../controllers/clientController");
const router = (0, express_1.Router)();
const clientController = new clientController_1.ClientController();
router.get('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.restrictsTo)(['CLIENT-LIST']), clientController.clients);
exports.default = router;
