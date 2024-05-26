import { Router } from "express";
import { StatisticController } from "../controllers/statisticController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const statisticController = new StatisticController();

router.get('/', statisticController.statistic)


export default router;