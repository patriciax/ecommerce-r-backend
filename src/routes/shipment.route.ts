import { Router } from "express";
import { ShipmentController } from "../controllers/shipmentController";

const router = Router();
const shipmentController = new ShipmentController();

router.post('/', shipmentController.getRates)

export default router;