import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { CheckoutController } from "../controllers/checkoutController";

const router = Router();
const checkoutController = new CheckoutController();

router.post('/', checkoutController.paymentProcess)

export default router;