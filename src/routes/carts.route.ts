import { Router } from "express";
import { CartController } from "../controllers/cartController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const cartController = new CartController();

router.post('/', authMiddleware, cartController.addProductToCart)
router.delete('/:id', authMiddleware,  cartController.deleteProductFromCart)
router.patch('/:id', authMiddleware, cartController.updateProductToCart)

export default router;