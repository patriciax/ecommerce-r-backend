import { Router } from "express";
import { InvoiceController } from "../controllers/InvoiceController";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";

const router = Router();
const invoiceController = new InvoiceController();

router.get('/', authMiddleware, restrictsTo(['INVOICE-LIST']), invoiceController.listInvoices)
router.patch('/status/:invoice', invoiceController.updateInvoiceStatus)
router.patch('/:invoice', authMiddleware, restrictsTo(['INVOICE-UPDATE']), invoiceController.updateInvoice)

export default router;