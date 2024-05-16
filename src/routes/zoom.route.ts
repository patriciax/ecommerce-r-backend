import { Router } from "express";
import { ZoomController } from "../controllers/zoomController";
import { MercantilController } from "../controllers/paymentMethods/MercantilController";

const router = Router();
const zoomController = new ZoomController();
const mercantilController = new MercantilController();

router.get('/get-states', zoomController.getStates)
router.get('/states/:state/offices', zoomController.getOffices)
router.get('/tracking/:tracking', zoomController.getTracking)

//router.get('test', mercantilController.decrypt)

export default router;