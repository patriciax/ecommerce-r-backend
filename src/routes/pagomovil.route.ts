import { Router } from "express";
import { PagoMovilController } from "../controllers/paymentMethods/pagoMovilController";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";

const router = Router();
const pagoMovilController = new PagoMovilController();

router.post('/', authMiddleware, restrictsTo(['BANNER-CREATE']), pagoMovilController.createOrUpdatePagoMovil)
router.get('/',  pagoMovilController.getPagoMovil)
router.delete('/', authMiddleware, restrictsTo(['BANNER-CREATE']),  pagoMovilController.deletePagoMovil)

export default router;