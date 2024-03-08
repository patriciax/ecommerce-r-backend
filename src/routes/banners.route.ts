import { Router } from "express";
import { BannerController } from "../controllers/bannerController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const bannerController = new BannerController();

router.post('/', authMiddleware, bannerController.createBanner)
router.get('/', bannerController.getBanner)

export default router;