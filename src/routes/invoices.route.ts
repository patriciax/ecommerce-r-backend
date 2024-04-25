import { Router } from "express";
import { InvoiceController } from "../controllers/InvoiceController";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";
import { CreditCardRocaController } from "../controllers/paymentMethods/CreditCardRocaController";

const router = Router();
const invoiceController = new InvoiceController();
const creditCardRocaController = new CreditCardRocaController();

router.get('/', authMiddleware, restrictsTo(['INVOICE-LIST']), invoiceController.listInvoices)
router.patch('/status/:invoice', invoiceController.updateInvoiceStatus)
router.patch('/status-giftcard/:invoice', creditCardRocaController.updateGiftCardStatus)
router.patch('/:invoice', authMiddleware, restrictsTo(['INVOICE-UPDATE']), invoiceController.updateInvoice)

router.get('/user', authMiddleware, invoiceController.userInvoices)

export default router;