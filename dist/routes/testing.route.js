"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailTestingController_1 = require("../controllers/emailTestingController");
const checkoutController_1 = require("../controllers/checkoutController");
const router = (0, express_1.Router)();
const emailTesting = new emailTestingController_1.emailTestingController();
const checkoutController = new checkoutController_1.CheckoutController();
router.get('/admin-new-register', emailTesting.sendAdminNewRegister);
router.get('/credit-card-balance', emailTesting.sendCreditCardBalance);
router.get('/email-password-reset', emailTesting.sendEmailPasswordReset);
router.get('/email-verify', emailTesting.sendEmailVerify);
router.get('/gift-card', emailTesting.sendGiftCard);
router.get('/invoice', emailTesting.sendInvoice);
router.get('/newsletter', emailTesting.sendNewsletterHandlebars);
router.get('/reject-payment', emailTesting.sendRejectedPayment);
router.get('/ship-tracking', emailTesting.sendShipTracking);
router.get('/pdf', checkoutController.generatePDFProducts);
exports.default = router;
