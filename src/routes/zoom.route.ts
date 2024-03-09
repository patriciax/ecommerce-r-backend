import { Router } from "express";
import { ZoomController } from "../controllers/zoomController";

const router = Router();
const zoomController = new ZoomController();

router.get('/get-states', zoomController.getStates)

export default router;