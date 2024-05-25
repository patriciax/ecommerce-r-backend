import { Router } from "express";
import { MercantilController } from "../controllers/paymentMethods/MercantilController";

const router = Router();
const mercantilController = new MercantilController();

router.post('/get-sms-code', mercantilController.getOTPCode)

export default router;