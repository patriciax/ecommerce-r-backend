import { Router } from "express";
import { authMiddleware, authMiddlewareLoginNoRequired } from "../middlewares/auth.middleware";
import { CheckoutController } from "../controllers/checkoutController";

const router = Router();
const checkoutController = new CheckoutController();

router.post('/', authMiddlewareLoginNoRequired, checkoutController.paymentProcess)

export default router;