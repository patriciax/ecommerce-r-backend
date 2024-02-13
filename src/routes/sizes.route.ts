import { Router } from "express";
import { SizeController } from "../controllers/sizeController";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";

const router = Router();
const sizeController = new SizeController();

router.post('/', authMiddleware, restrictsTo(['SIZE-CREATE']), sizeController.createSize)
router.delete('/:id', authMiddleware, restrictsTo(['SIZE-DELETE']),  sizeController.deleteSize)

router.get('/', sizeController.sizes)
router.get('/:id', sizeController.getSize)
router.patch('/:id', authMiddleware, restrictsTo(['SIZE-UPDATE']), sizeController.updateSize)

export default router;