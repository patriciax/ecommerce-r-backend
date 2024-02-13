import { Router } from "express";
import { ColorController } from "../controllers/colorController";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";

const router = Router();
const colorController = new ColorController();

router.post('/', authMiddleware, restrictsTo(['COLOR-CREATE']), colorController.createColor)
router.delete('/:id', authMiddleware, restrictsTo(['COLOR-DELETE']),  colorController.deleteColor)

router.get('/', colorController.colors)
router.get('/:id', colorController.getColor)
router.patch('/:id', authMiddleware, restrictsTo(['COLOR-UPDATE']), colorController.updateColor)

export default router;