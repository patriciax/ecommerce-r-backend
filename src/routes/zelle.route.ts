import { Router } from "express";
import { ZelleController } from "../controllers/paymentMethods/ZelleController";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";

const router = Router();
const zelleController = new ZelleController();

router.post('/', authMiddleware, restrictsTo(['BANNER-CREATE']), zelleController.createOrUpdateZelle)
router.get('/',  zelleController.getZelle)
router.delete('/', authMiddleware, restrictsTo(['BANNER-CREATE']),  zelleController.deleteZelle)

export default router;