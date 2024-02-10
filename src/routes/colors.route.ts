import { Router } from "express";
import { ColorController } from "../controllers/colorController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const colorController = new ColorController();

router.post('/', authMiddleware, colorController.createColor)
router.delete('/:id', authMiddleware,  colorController.deleteColor)

router.get('/', authMiddleware, colorController.colors)
router.get('/:id', authMiddleware, colorController.getColor)
router.patch('/:id', authMiddleware, colorController.updateColor)

export default router;