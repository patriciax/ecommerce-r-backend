import { Router } from "express";
import { ZoomController } from "../controllers/zoomController";

const router = Router();
const zoomController = new ZoomController();

router.get('/get-states', zoomController.getStates)
router.get('/states/:state/offices', zoomController.getOffices)
router.get('/tracking/:tracking', zoomController.getTracking)

export default router;