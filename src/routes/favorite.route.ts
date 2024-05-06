import { Router } from "express";
import { FavoriteController } from "../controllers/favoritesController";
import { authMiddleware, restrictsTo } from "../middlewares/auth.middleware";

const router = Router();
const favoriteController = new FavoriteController();

router.get('/', authMiddleware,  favoriteController.getFavorites)
router.delete('/:favoriteId', authMiddleware,  favoriteController.deleteFavorite)
router.post('/', authMiddleware,  favoriteController.storeFavorite)

export default router;