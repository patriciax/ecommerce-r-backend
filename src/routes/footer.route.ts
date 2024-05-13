import { Router } from "express";
import { FooterController } from "../controllers/footerController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const footerController = new FooterController();

router.get('/footer-front', footerController.getItemStore)
router.post('/', authMiddleware, footerController.createFooter)
router.get('/item/:footer', authMiddleware, footerController.getItem)
router.get('/:section', authMiddleware, footerController.list)
router.delete('/:footer', authMiddleware, footerController.deleteItem)
router.patch('/:footer', authMiddleware, footerController.updateItem)

export default router;