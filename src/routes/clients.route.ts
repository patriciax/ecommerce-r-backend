import { Router } from "express";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";
import { ClientController } from "../controllers/clientController";

const router = Router();
const clientController = new ClientController();

router.get('/', authMiddleware, restrictsTo(['CLIENT-LIST']), clientController.clients)

export default router;