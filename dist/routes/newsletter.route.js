"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newsletterController_1 = require("../controllers/newsletterController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const newsletterController = new newsletterController_1.NewsletterController();
router.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.restrictsTo)(['NEWSLETTER-CREATE']), newsletterController.createNewsletter);
router.get('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.restrictsTo)(['NEWSLETTER-LIST']), newsletterController.newsletters);
exports.default = router;
