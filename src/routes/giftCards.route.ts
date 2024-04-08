import { Router } from "express";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";
import { GiftCardController } from "../controllers/giftCardController";
import {CreditCardRocaController} from "../controllers/paymentMethods/CreditCardRocaController";

const router = Router();
const giftCardController = new GiftCardController();
const creditCardRocaController = new CreditCardRocaController();

router.post('/', authMiddleware, restrictsTo(['GIFT-CARD-CREATE']), giftCardController.createGiftCard)
router.delete('/:id', authMiddleware, restrictsTo(['GIFT-CARD-DELETE']),  giftCardController.deleteGiftCard)

router.get('/', giftCardController.giftCards)
router.get('/:id', giftCardController.getGiftCard)
router.patch('/:id', authMiddleware, restrictsTo(['COLOR-UPDATE']), giftCardController.updateGiftCard)

router.post('/create-credit-card-roca', authMiddleware, creditCardRocaController.createCreditCardRoca)

router.post('/purchase', authMiddleware, creditCardRocaController.purchaseCreditCardRoca)
router.post('/balance', creditCardRocaController.verifyCredits)

export default router;