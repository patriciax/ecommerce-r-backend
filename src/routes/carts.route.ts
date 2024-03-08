import { Router } from "express";
import { CartController } from "../controllers/cartController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const cartController = new CartController();

router.post('/', authMiddleware, cartController.addProductToCart)
router.post('/mass-assignment', authMiddleware, cartController.massAssignment)
router.post('/product-info-guest', cartController.productInfoGuest)
router.get('/product-info', authMiddleware, cartController.productInfo)
router.delete('/:id', authMiddleware,  cartController.deleteProductFromCart)
router.patch('/:id', authMiddleware, cartController.updateProductToCart)

export default router;