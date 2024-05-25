import { Router } from "express";
import { emailTestingController } from "../controllers/emailTestingController";

const router = Router();
const emailTesting = new emailTestingController();

router.get('/admin-new-register', emailTesting.sendAdminNewRegister)
router.get('/credit-card-balance', emailTesting.sendCreditCardBalance)
router.get('/email-password-reset', emailTesting.sendEmailPasswordReset)
router.get('/email-verify', emailTesting.sendEmailVerify)
router.get('/gift-card', emailTesting.sendGiftCard)
router.get('/invoice', emailTesting.sendInvoice)
router.get('/newsletter', emailTesting.sendNewsletterHandlebars)
router.get('/reject-payment', emailTesting.sendRejectedPayment)
router.get('/ship-tracking', emailTesting.sendShipTracking)

export default router;