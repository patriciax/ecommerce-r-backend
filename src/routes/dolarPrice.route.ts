import { Router } from "express";
import { DolarPriceController } from "../controllers/dolarPriceController";

const router = Router();
const dolarPriceController = new DolarPriceController();

router.get('/',  dolarPriceController.getDolarPrice)

export default router;