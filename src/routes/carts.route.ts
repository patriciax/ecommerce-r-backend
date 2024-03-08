import { Router } from "express";
import { CartController } from "../controllers/cartController";
import { authMiddleware } from "../middlewares/auth.middleware";
import { sanitizeCart } from "../middlewares/cart.middleware";

const router = Router();
const cartController = new CartController();

router.post('/', authMiddleware, sanitizeCart, cartController.addProductToCart)
router.post('/mass-assignment', authMiddleware, sanitizeCart, cartController.massAssignment)
router.post('/product-info-guest', sanitizeCart, cartController.productInfoGuest)
router.get('/product-info', authMiddleware, sanitizeCart, cartController.productInfo)
router.delete('/:id', authMiddleware, sanitizeCart,  cartController.deleteProductFromCart)
router.patch('/', authMiddleware, sanitizeCart, cartController.updateProductToCart)

export default router;