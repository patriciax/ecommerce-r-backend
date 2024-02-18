import { Router } from "express";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";
import { GiftCardController } from "../controllers/giftCardController";

const router = Router();
const giftCardController = new GiftCardController();

router.post('/', authMiddleware, restrictsTo(['GIFT-CARD-CREATE']), giftCardController.createGiftCard)
router.delete('/:id', authMiddleware, restrictsTo(['GIFT-CARD-DELETE']),  giftCardController.deleteGiftCard)

router.get('/', giftCardController.giftCards)
router.get('/:id', giftCardController.getGiftCard)
router.patch('/:id', authMiddleware, restrictsTo(['COLOR-UPDATE']), giftCardController.updateGiftCard)

export default router;