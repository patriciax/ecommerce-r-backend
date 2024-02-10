import { Router } from "express";
import { SizeController } from "../controllers/sizeController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const sizeController = new SizeController();

router.post('/', authMiddleware, sizeController.createSize)
router.delete('/:id', authMiddleware,  sizeController.deleteSize)

router.get('/', authMiddleware, sizeController.sizes)
router.get('/:id', sizeController.getSize)
router.patch('/:id', sizeController.updateSize)

export default router;