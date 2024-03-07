import { Router } from "express";
import { BannerController } from "../controllers/bannerController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const bannerController = new BannerController();

router.post('/', authMiddleware, bannerController.createBanner)

export default router;